import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

export default {
    apifyLocalStorageDir: join(DIRNAME, '.storage'),
    puppeteerCacheDir: join(DIRNAME, '.cache'),
    startUrl: 'http://localhost:3128/',
    checkExtern: true,
    pageWaitUntil: 'networkidle',
    navigationOnly: true,
    useCache: true,
    maxConcurrency: 1,
    maxRequestRetries: 3,
    requestTimeout: 30000,
    internLinks: [
        'http://localhost:3128[.*]'
    ]
}