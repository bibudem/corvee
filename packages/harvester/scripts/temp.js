import fs from 'fs'
import path from 'path'
import records from '../test/bib/records-in.json'


// records.forEach(r => {

//     // if ('redirectChain' in r && Array.isArray(r.redirectChain) && r.redirectChain.length > 0) {
//     //     r.realUrl = r.redirectChain[r.redirectChain.length - 1].url;
//     //     r.redirectChain.forEach(redirect => {
//     //         redirect.url = normalizeUrl(redirect.url)
//     //     })
//     // }

//     r.realUrl && (r.realUrl = normalizeUrl(r.realUrl))

//     return r;

// })

fs.writeFileSync(path.join(__dirname, '../test/bib/records.json'), JSON.stringify(records, null, 2))