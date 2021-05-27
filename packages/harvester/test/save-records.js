import fs, {
    promises as fsp
} from 'fs'
import path from 'path'

import {
    console
} from '../../core/lib/logger'

export default async function saveRecords(dir, harvester, runOptions, filter) {

    var i = 1;
    const records = [];
    const jsonLPath = path.join(dir, 'records.json');
    // const file = await fsp.open(jsonLPath)
    let stream;
    const flags = runOptions.resume ? 'r+' : 'w';
    try {
        stream = fs.createWriteStream(jsonLPath, {
            flags
        })
    } catch (e) {
        console.error(e)
        process.exit()
    }

    function write(data) {
        if (stream.pending) {
            process.nextTick(() => {
                write(data);
            })
        } else {
            stream.write(data);
        }
    }

    stream.once('open', () => {
        stream.write('[')
    })

    function json(data) {
        let str = '';
        try {
            str = JSON.stringify(data, null, 2);
        } catch (e) {
            console.warn('Could not stringify data, so removing responses array.');
            // console.warn(data);
            if ('request' in data) {
                delete data.request;

                try {
                    str = JSON.stringify(data, null, 2);
                } catch (e) {
                    console.warn('Could not stringify data with `responseChain` removed.')
                    console.warn(e)
                    str = JSON.stringify({
                        id: data.id,
                        url: data.url
                    }, null, 2)
                }
            }
        }
        return `${i === 1 ? `\n` : `,\n`}${str.replace(/(^)/gm, '$1  ')}`
    }

    harvester.on('record', function onRecord(record) {
        if (filter && !filter(record)) {
            return
        }

        write(json(record))
        records.push(record)

        console.info(`[record] ${i++}`)

    })

    harvester.on('end', () => {
        console.z('on end...')
        try {
            // toXML(dir, records);
            stream.end('\n]');
            // fs.writeFileSync(path.join(dir, 'records.sync.json'), stringify(records, null, 2), 'utf8');

            // fs.writeFileSync(path.join(dir, 'records-l.json'), records.map(record => JSON.stringify(record)).join('\n'), 'utf8');
            // await saveToDb(records)
        } catch (e) {
            console.z(e)
        }
    })
}