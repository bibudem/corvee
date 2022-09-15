import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

export default {
    apifyLocalStorageDir: join(DIRNAME, './.storage'),
    puppeteerCacheDir: join(DIRNAME, './.cache'),
    startUrl: 'http://localhost:3000/',
    checkExtern: false,
    cookies: true,
    pageWaitUntil: 'networkidle',
    requestTimeout: 5000,
    navigationOnly: true,
    useCache: true,
    maxConcurrency: 50,
    maxRequests: 100,
    maxRequestRetries: 3,
    internLinks: [
        'http://localhost:3000[.*]'
    ],

    /**
     * Node.js URL class.
     * @external URL
     * @see {@link https://nodejs.org/api/url.html#url_class_url}
     */

    /** @member {(string|external:URL)} [proxy] - Url of a web proxy server (string or URL object) */
    // proxy: 'some-url'
}