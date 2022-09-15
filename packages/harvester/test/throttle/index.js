import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import randomUri from 'random-uri'
import www from './www.js'
import { Harvester } from '../../lib/harvester/index.js'
import saveRecords from '../save-records.js'
import { logErrorCodes } from '../../index.js'
import { console } from '../../../core/index.js'
import configs from './config.js'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

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

const harvester = new Harvester(configs);

saveRecords(DIRNAME, harvester)

logErrorCodes(harvester, join(DIRNAME, './error-codes.json'))

harvester.addUrl(urls)

async function start() {
    try {
        await www()
        await harvester.run()
    } catch (e) {
        console.error(e)
        process.exit()
    }
}

start()