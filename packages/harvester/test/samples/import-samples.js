import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import parser from 'fast-xml-parser'
import he from 'he'
import { Set, Map } from 'json-set-map'
import { makeArray } from '../../lib/utils/index.js'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

const fileList = readdirSync(join(DIRNAME, 'samples')).map(file => join(DIRNAME, 'samples', file));
const errorDic = new Map();
const errCodesDic = new Set();

const parserOptions = {
    attributeNamePrefix: "",
    attrNodeName: "@",
    textNodeName: "#text",
    ignoreAttributes: false,
    ignoreNameSpace: true,
    parseNodeValue: true,
    allowBooleanAttributes: true,
    trimValues: true,
    decodeHTMLchar: false,
    cdataTagName: false,
    cdataPositionChar: "\\c",
    localeRange: "",
    parseTrueNumberOnly: false,
    attrValueProcessor: a => he.decode(a, {
        isAttributeValue: true
    }), //default is a=>a
    tagValueProcessor: a => he.decode(a) //default is a=>a
};

fileList.forEach(filePath => {
    console.log(filePath)
    const fileData = fs.readFileSync(filePath, 'utf-8')
    const root = parser.parse(fileData, parserOptions);
    //console.log(root.linkchecker.urldata[0])
    root.linkchecker.urldata
        //.filter(lien => lien.extern === 1)
        .forEach((lien, i) => {
            //console.log('ici');
            ['errors', 'warnings', 'infos'].forEach(errGroup => {
                const errType = errGroup.slice(0, -1);
                if (i === 0) {
                    // console.log(errType)
                    // console.log(lien)
                }
                //console.log(lien.hasOwnProperty(errGroup))
                if (lien.hasOwnProperty(errGroup) && lien[errGroup].hasOwnProperty(errType)) {
                    //console.log(lien)
                    //console.log(lien[errGroup].li)
                    // if (i === 0) {
                    //     console.error(lien[errGroup][errType])
                    // }
                    const errs = makeArray(lien[errGroup][errType]);
                    // if (i === 0) {
                    //     console.log(errs)
                    // }
                    errs.forEach(err => {
                        const errCode = typeof err === 'string' ? null : '@' in err ? err['@'].tag : null;
                        const errMessage = typeof err === 'string' ? err : '#text' in err ? err['#text'] : null;

                        errCodesDic.add(errCode);

                        if (!errorDic.has(errCode)) {
                            errorDic.set(errCode, new Map())
                        }
                        const {
                            url,
                            realurl
                        } = lien;

                        const urlKey = url.toLowerCase();

                        const list = errorDic.get(errCode);

                        if (!list.has(urlKey))
                            list.set(urlKey, {
                                errCode,
                                errMessage,
                                url,
                                realurl
                            })
                    })
                }
            })
        })
})

const sortedGroups = new Map(Array.from(errorDic.entries()).filter(g => g[0] !== '').sort())
sortedGroups.forEach((list, group, map) => {
    const sortedList = new Map(Array.from(list.entries()).sort())
    map.set(group, new Set(sortedList.values()))
})

console.log(sortedGroups.keys())

fs.writeFileSync(join(DIRNAME, 'public', 'samples.json'), JSON.stringify(sortedGroups, null, 2))