import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

export default {
    apifyLocalStorageDir: join(DIRNAME, './.storage'),
    puppeteerCacheDir: join(DIRNAME, './.cache'),
    startUrl: 'http://www.site.com/',
    checkExtern: true,
    pageWaitUntil: 'networkidle',
    navigationOnly: true,
    useCache: true,
    maxConcurrency: 1,
    maxRequestRetries: 3,
    requestTimeout: 30000,
    internLinks: [
        'http://www.site.com[.*]'
    ],

    /**
     * Node.js URL class.
     * @external URL
     * @see {@link https://nodejs.org/api/url.html#url_class_url}
     */

    /** @member {(string|external:URL)} [proxy] - Url of a web proxy server (string or URL object) */
    proxy: 'http://localhost:3128'
}