import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

export default {
    apifyLocalStorageDir: join(DIRNAME, './.storage'),
    puppeteerCacheDir: join(DIRNAME, './.cache'),
    //headless: true,
    //useChrome: true,
    //startUrl: 'https://badssl.com',
    // checking: {
    checkExtern: true,
    cookies: true,
    pageWaitUntil: 'networkidle',
    requestTimeout: 3000,
    navigationOnly: true,
    useCache: true,
    maxConcurrency: 10,
    maxRequests: 100,
    maxRequestRetries: 3,
    // },
    // filtering: {
    ignore: ['www.google-analytics.com', '/gtag/js', 'ga.js', 'analytics.js'],
    noFollow: [
        '^https?://atrium\\.umontreal\\.ca',
        '^https?://primo-test\\.bib\\.umontreal\\.ca',
        '^https?://bibres\\.bib\\.umontreal\\.ca',
        '^https?://pds\\.bib\\.umontreal\\.ca',
        '^https?://dx\\.doi\\.org',
        '^https?://calypso\\.bib\\.umontreal\\.ca'
    ],
    internLinks: [
        'http://localhost:3000[.*]'
        // /https:\/\/[^\/]*badssl\.com(:\d+)?\/?/
    ],
    // }

    /**
     * Node.js URL class.
     * @external URL
     * @see {@link https://nodejs.org/api/url.html#url_class_url}
     */

    /** @member {(string|external:URL)} [proxy] - Url of a web proxy server (string or URL object) */
    // proxy: 'some-url'
};