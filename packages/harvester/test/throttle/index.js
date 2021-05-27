import path from 'path'
import Apify from 'apify';
import www from './www';

import randomUri from 'random-uri'

import {
    Harvester
}
    from '../../lib/harvester'

import saveRecords from '../save-records'

import {
    logErrorCodes
} from '../../lib/utils'

import {
    console
}
    from '../../../core/lib/logger';

import configs from './config'

const domains = [
    'home.com',
    'domain-1.com',
    'domain-2.com',
    'domain-3.com',
    'domain-4.com'
]

const urls = []

for (var i = 0; i < 100; i++) {
    urls.push(randomUri({
        protocol: 'http',
        domain: 'domain.com'
    }))
}

//console.z(urls)

const harvester = new Harvester(configs);

saveRecords(__dirname, harvester)

logErrorCodes(harvester, path.join(__dirname, './error-codes.json'))

harvester.addUrl(urls)

async function start() {
    try {
        await www()
        Apify.main(harvester.run());
    } catch (e) {
        console.error(e)
        process.exit()
    }
}

start()

// async function start() {
//     await proxy()

//     try {
//         const resp = await request({
//             url: 'http://aaa.bbb.ccc',
//             proxy: 'http://localhost:3128'
//         })
//         console.log(resp)
//     } catch (e) {
//         console.error(e)
//     }
// }

// start()