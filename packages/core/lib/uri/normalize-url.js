import fs from "fs";
import * as URI from 'uri-js'
import URL from "url";
// import xmlbuilder from "xmlbuilder";
import apifyUtils from "apify-shared/utilities";
import {
    isObject
}
from "underscore";

/**
 * Returns a normalized url
 *
 * @param {string} url                     URL to normalize.
 * @param {object} [opts]                  Options.
 * @param {string} opts.base               URL to serve as base to resolve the url.
 * @param {boolean=true} opts.keepFragment Wether to keep the URL fragment.
 * @param {boolean=false} opts.sortParams  Sort parameters
 *
 * @return {string} A normalized url.
 */

export const normalizeUrl = (url, options) => {
    if (typeof url !== "string" || !url.length) {
        return null;
    }

    // default values
    const defaultOpts = {
        base: null,
        keepFragment: false,
        sortParams: false
    };

    if (arguments.length === 2) {
        if (typeof options === "boolean") {
            options = Object.assign({}, defaultOpts, {
                keepFragment: options
            });
        } else if (typeof arguments[1] === "string") {
            options = Object.assign({}, defaultOpts, {
                base: options
            });
        } else if (isObject(arguments[1])) {
            options = Object.assign({}, defaultOpts, options);
        }

        if (options.base) {
            try {
                url = new URL(url, options.base).href;
            } catch (e) {
                console.error(`url could not parsed. ${url}`);
                return e;
            }
        }
    }

    const uriObj = URI.parse(url);

    if (!/^https?$/i.test(uriObj.scheme)) {
        return URI.normalize(url);
    }

    const urlObj = apifyUtils.parseUrl(url.trim());
    if (!urlObj.protocol || !urlObj.host) {
        return null;
    }

    const path = urlObj.path.replace(/\/$/, "");
    const params = urlObj.query ?
        urlObj.query
        .split("&")
        .filter(param => {
            return !/^utm_/.test(param);
        }) : [];
    if (options.sortParams) {
        params.sort();

    }
    let port = "";
    if (urlObj.port) {
        if (
            !(urlObj.port === "80" && urlObj.protocol === "http") &&
            !(urlObj.port === "443" && urlObj.protocol === "https")
        ) {
            port = `:${urlObj.port}`;
        }
    }

    return `${urlObj.protocol
    .trim()
    .toLowerCase()}://${urlObj.host.trim().toLowerCase()}${port}${path.trim()}${
    params.length ? `?${params.join("&").trim()}` : ""
  }${
    options.keepFragment && urlObj.fragment ? `#${urlObj.fragment.trim()}` : ""
  }`;
};

export function toXML(data) {

    fs.writeFileSync('out.xml', '<?xml version="1.0"?>\n<linkchecker>', 'utf8');

    data.forEach(({
        urlData,
        realUrl: finalUrl,
        id,
        text,
        parent,
        extern,
        reports,
        ok,
        timing,
        status,
        statusText
    } = {
        ...item
    }) => {
        const {
            infos,
            warnings,
            errors
        } = mapReportsToLinkChecker(reports);

        const urldata = {
            '@id': id,
            url: urlData,
            realUrl: finalUrl,
            parent,
            extern: extern ? 1 : 0,
            checktime: timing,
            infos,
            warnings,
            errors
        };

        if (ok === 'http::200') {
            urldata.valid = {
                '@result': '200 OK',
                '#text': 1
            }
        }

        const xml = xmlbuilder.create({
            urldata
        }, {
            headless: true
        }).end({
            pretty: true
        })

        fs.appendFileSync('out.xml', `\n${xml}`);
    });

    fs.appendFileSync('out.xml', "\n</linkchecker>");
}

export function mapReportsToLinkChecker(reports = []) {
    const infos = [];
    const warnings = [];
    const errors = [];

    reports.forEach(report => {

    })

    return {
        infos,
        warnings,
        errors
    }
}