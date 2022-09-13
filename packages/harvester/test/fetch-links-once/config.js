import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

export default {
    apifyLocalStorageDir: join(DIRNAME, './.storage'),
    puppeteerCacheDir: join(DIRNAME, './.cache'),
    startUrl: 'https://www.bib.umontreal.ca/CS/expositions/livres-heures/default.htm',
    internLinks: [
        // 'https://www.bib.umontreal.ca/CS/expositions/livres-heures/[.*]'
        /^https:\/\/www\.bib\.umontreal\.ca\/cs\/expositions\/livres\-heures\//i
    ],
    fetchLinksOnce: true,
    checkExtern: true,
    pageWaitUntil: 'networkidle',
    navigationOnly: true,
    useCache: true,
    maxConcurrency: 100,
    // maxRequests: 100,
    maxRequestRetries: 2,
    // maxDepth: 2,
    // requestTimeout: 500,
    waitInterval: 50,
    notify: 5000,
    ignore: [
        'https://www.bib.umontreal.ca/une-question',
        'https://bib.umontreal.ca'
    ],
    noFollow: [/other\-page/],
}