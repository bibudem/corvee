import fs from 'node:fs'
import path from 'node:path'

import yargs from 'yargs'

const argv = yargs
    //     .usage(`Usage
    //   $ $0 <url>[, <url>]*`)
    //     .example('$0 https://bib.umontreal.ca')
    // .option(
    //     'url', {
    //         alias: 'u'
    //     }
    // )
    // .option(
    //     'file', {
    //         alias: 'f',
    //         type: 'string'
    //     }
    // )
    .help()
    .argv;


// let url = 'http://apps.webofknowledge.com/ViewMarkedList.do?SID=6BjskVEuE1OY2i7n6Sw&action=Search&colName=BIOABS&entry_prod=BIOABS&mark_id=UDB&product=BIOABS&search_mode=MarkedList'
// let


const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), argv._[1]), 'utf-8'))
const url = argv._[0]
const ancestry = [url];

const urls = new Set()

urls.add(url)

console.log(`url: ${url}`)

export function findOrigin(url) {

    const elem = data.find(elem => elem.url === url)

    if (elem && !urls.has(elem.parent)) {
        urls.add(elem.parent)
        console.log(elem)
        ancestry.push(elem.parent)
        findOrigin(elem.parent)
    }

    // while (true) {
    //     const parent = findParent(data, url)
    //     console.log(parent)
    //     if (typeof parent === 'undefined') {
    //         break;
    //     }
    //     url = parent.url;
    //     ancestry.push(url)

    // }

    // while (typeof parent !== 'undefined') {
    //     parent = findParent(url)
    //     url = parent.url
    //     ancestry.push(url)
    //     console.log(url)
    // }
    // console.log(ancestry)

}

findOrigin(url)

console.log(ancestry)