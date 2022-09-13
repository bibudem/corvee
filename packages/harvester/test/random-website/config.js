import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

export const server = {
    origin: 'http://www.site.com',
    proxyPort: 3128,
    depth: 5,
    spread: 2
}

export default {
    apifyLocalStorageDir: join(DIRNAME, './.storage'),
    puppeteerCacheDir: join(DIRNAME, './.cache'),
    startUrl: 'http://www.site.com/',
    internLinks: [
        'http://www.site.com[.*]'
    ],
    checkExtern: true,
    pageWaitUntil: 'networkidle',
    navigationOnly: true,
    useCache: true,
    maxConcurrency: 100,
    // maxRequests: 20,
    maxRequestRetries: 3,
    maxDepth: 2,
    // requestTimeout: 500,
    waitInterval: 0,
    notify: 1000,
    ignore: [],
    noFollow: [/other\-page/],

    /**
     * Node.js URL class.
     * @external URL
     * @see {@link https://nodejs.org/api/url.html#url_class_url}
     */

    /** @member {(string|external:URL)} [proxy] - Url of a web proxy server (string or URL object) */
    proxy: 'http://localhost:3128'
}