import { join } from 'path'

export default {
    apifyLocalStorageDir: join(__dirname, '.storage'),
    puppeteerCacheDir: join(__dirname, '.cache'),
    startUrl: 'http://localhost:3128/',
    checkExtern: true,
    pageWaitUntil: ['load', 'domcontentloaded', 'networkidle0'],
    navigationOnly: true,
    userAgent: 'Mozilla/5.0 (Corvee/1.0.0)',
    useCache: true,
    maxConcurrency: 1,
    maxRequestRetries: 3,
    requestTimeout: 30000,
    internLinks: [
        'http://localhost:3128[.*]'
    ]
}