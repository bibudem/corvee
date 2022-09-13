import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

export default {
    apifyLocalStorageDir: join(DIRNAME, './.storage'),
    puppeteerCacheDir: join(DIRNAME, './.cache'),
    //startUrl: 'http://localhost:3000/',
    checkExtern: true,
    cookies: true,
    pageWaitUntil: 'networkidle',
    requestTimeout: 2000,
    navigationOnly: true,
    useCache: true,
    maxConcurrency: 10,
    maxRequests: 100,
    maxRequestRetries: 2,
    ignore: [
        'www.google-analytics.com',
        '/gtag/js',
        'ga.js',
        'analytics.js'
    ],
    noFollow: ['^https?://atrium\\.umontreal\\.ca',
        '^https?://primo-test\\.bib\\.umontreal\\.ca',
        '^https?://bibres\\.bib\\.umontreal\\.ca',
        '^https?://pds\\.bib\\.umontreal\\.ca',
        '^https?://dx\\.doi\\.org',
        '^https?://calypso\\.bib\\.umontreal\\.ca'
    ],
    internLinks: [
        'http://localhost:3000[.*]'
    ],
}