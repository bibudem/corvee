import fs from "fs";
import path from "path";
import moment from "moment";
import convert from "xml-js";
import SqlString from "sqlstring";
import escapeHtml from "escape-html";
import {
    parseString
} from "xml2js";

import {
    console
} from "../../../core/lib/logger";

// export const errorMapping = {
//       'http-auth-unknonwn',
//       'http-decompress-error',
//       'http-empty-content',
//       'http-moved-permanent',
//       'http-unsupported-encoding',
//       'http-wrong-redirect',
//       'https-certificate-error',
//       'ignore-url',
//       'mail-no-mx-host',
//       'mail-unverified-address',
//       'url-content-duplicate',
//       'url-content-size-zero',
//       'url-effective-url',
//       'url-error-getting-content',
//       'url-too-long',
//       'url-warnregex-found',
//       'url-whitespace'
// }

export function toXML(dir, dataSet) {
    const outFilePath = path.join(dir, "site-web-20180512-raw.xml");
    const now = moment();
    const created = `${now.format("YYYY-MM-DD HH:mm:ss")}-004`;
    const xmlObj = {
        _declaration: {
            _attributes: {
                version: "1.0"
            }
        },
        linkchecker: {
            _attributes: {
                created
            },
            urldata: []
        }
    };
    const xmlOptions = {
        compact: true,
        spaces: 4
    };

    dataSet
        .filter(
            d => "httpStatusCode" in d && d.httpStatusCode >= 300
        )
        .forEach(
            ({
                urlData,
                finalUrl: realurl,
                id,
                parent,
                extern,
                reports,
                timing,
                level,
                text: name,
                httpStatusCode,
                httpStatusText
            } = {
                ...item
            }) => {
                const {
                    infos,
                    warnings,
                    errors
                } = mapReportsToLinkChecker(reports);

                const urldata = {
                    _attributes: {
                        id
                    },
                    url: urlData,
                    name,
                    parent,
                    realurl,
                    extern: extern ? 1 : 0,
                    level,
                    checktime: timing,
                    infos,
                    warnings,
                    errors
                };

                const valid =
                    httpStatusCode && httpStatusCode >= 200 && httpStatusCode < 400 ? 1 : 0;
                const result = httpStatusCode ?
                    `${httpStatusCode} ${httpStatusText}` :
                    reports && reports.length ?
                    `[${reports[reports.length - 1].code}] ${
            reports[reports.length - 1].message
          }` :
                    "";

                urldata.valid = {
                    _attributes: {
                        result
                    },
                    _text: valid
                };

                xmlObj.linkchecker.urldata.push(urldata);
            }
        );

    fs.writeFileSync(outFilePath, convert.js2xml(xmlObj, xmlOptions));
}

export function mapReportsToLinkChecker(reports = []) {
    const infos = [];
    const warnings = [];
    const errors = [];

    reports.forEach(({
        code: tag,
        message: _text
    }) => {
        errors.push({
            _attributes: {
                tag
            },
            _text
        });
    });

    return {
        infos: {
            info: infos
        },
        warnings: {
            warning: warnings
        },
        errors: {
            error: errors
        }
    };
}

async function parseMessages(xmlString) {
    return new Promise((resolve, reject) => {
        parseString(
            xmlString, {
                explicitRoot: false,
                explicitArray: false,
                mergeAttrs: true
            },
            (err, data) => {
                if (err) {
                    return reject(err);
                }
                const ret = {};
                data.messages.message.forEach(m => (ret[m["error-code"]] = m._));

                resolve(ret);
            }
        );
    });
}

export async function toSQL(dir, dataSet) {
    // const now = moment();
    // const jobId = now.format("YYYYMMDD");
    const jobId = '20190512';
    const outFilePath = path.join(dir, `site-web-${jobId}.sql`);
    const prologue = `/* * Insertion des données dans la table liens */
DELETE FROM corvee.dbo.liens WHERE projectId = 'site-web' AND jobId = '${jobId}';`;
    const sqlColumns = [
        // "lienId",
        "url",
        "libelle",
        "page",
        "statut",
        "message",
        "realurl",
        "externe",
        "action",
        "projectId",
        "error_code",
        "jobId"
    ];
    const sqlPrologue = `INSERT into liens(${sqlColumns.join(", ")}) VALUES(`;
    const sqlEpilogue = `);`;
    const messages = await parseMessages(fs.readFileSync("corvee.xml", "utf-8"));

    const sqlQuery = [prologue];

    function sql(data) {
        return `${sqlPrologue}'${sqlColumns
      .map(key => {
        return typeof data[key] === "string"
          ? data[key].replace(/'/g, "''")
          : data[key];
      })
      .join("', '")}'${sqlEpilogue}`;
    }

    function errFor(errCode) {
        const code = escapeHtml(errCode);
        if (errCode in messages) {
            return `<li data-error-code="${code}">${escapeHtml(
        messages[errCode]
      )}</li>`;
        }
        return `<li data-error-code="${code}">${errCode}</li>`;
    }

    dataSet
        .filter(
            d =>
            ("httpStatusCode" in d && d.httpStatusCode >= 400) ||
            ("redirectionChain" in d &&
                d.redirectionChain.some(r => [301, 307].includes(r.status)))
        )
        .forEach(
            ({
                id: lienId,
                urlData: url,
                text: libelle,
                finalUrl,
                parent: page,
                extern,
                reports,
                httpStatusCode,
                httpStatusText
            } = {
                ...item
            }) => {
                const errCode = `http-${httpStatusCode}`;
                const sqlData = {
                    lienId,
                    url,
                    libelle,
                    page,
                    statut: "error",
                    message: errFor(errCode),
                    realurl: finalUrl ? finalUrl : "",
                    externe: extern ? "1" : "0",
                    action: "to-be-fixed",
                    error_code: errCode,
                    projectId: "site-web",
                    jobId
                };

                const valid =
                    httpStatusCode && httpStatusCode >= 200 && httpStatusCode < 400 ?
                    1 :
                    0;

                const result = httpStatusCode ?
                    `${httpStatusCode} ${httpStatusText}` :
                    reports && reports.length ?
                    `[${reports[reports.length - 1].code}] ${
              reports[reports.length - 1].message
            }` :
                    "";

                sqlQuery.push(sql(sqlData));
            }
        );

    fs.writeFileSync(outFilePath, sqlQuery.join("\n"));
}