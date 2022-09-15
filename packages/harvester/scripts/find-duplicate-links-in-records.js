import fs from 'node:fs'
import path from 'node:path'

import yargs from 'yargs'

const argv = yargs
    .usage(`Usage
      $ $0 <file>`)
    .help()
    .showHelp()
    .argv;

function indexData(data) {
    const dups = new Map()
    for (var i = 0; i < data.length; i++) {
        const rec = data[i],
            page = rec.parent,
            url = rec.url,
            id = `${encodeURIComponent(page)}#${encodeURIComponent(url)}`;
        if (!dups.has(id)) {
            dups.set(id, [])
        }
        dups.get(id).push(rec)
    }

    return dups;
}

export function findDups(src) {

    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), src), 'utf-8'))
    console.log(`Loaded ${data.length} records.`)
    const idx = indexData(data)

    const dups = [];

    idx.forEach(elem => {
        if (elem.length > 1) {
            dups.push(elem)
        }
    });

    console.log(`Found ${dups.length} duplicates.`)

    if (dups.length > 0) {
        console.log(dups)
    }


}

findDups(argv._[0])