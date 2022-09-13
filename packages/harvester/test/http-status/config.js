import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url';

const DIRNAME = dirname(fileURLToPath(import.meta.url))

const port = 3128;

export const server = {
    port,
}

export default {
    apifyLocalStorageDir: join(DIRNAME, './.storage'),
    puppeteerCacheDir: join(DIRNAME, './.cache'),
    startUrl: `http://intern.com/`,
    internLinks: [
        `http://intern.com[.*]`
    ],
    checkExtern: false,
    pageWaitUntil: 'networkidle',
    navigationOnly: true,
    useCache: true,
    maxConcurrency: 50,
    // maxRequests: 100,
    maxRequestRetries: 3,
    waitInterval: 100,
    notify: 5000,
    ignore: [],
    noFollow: [],

    /**
     * Node.js URL class.
     * @external URL
     * @see {@link https://nodejs.org/api/url.html#url_class_url}
     */

    /** @member {(string|external:URL)} [proxy] - Url of a web proxy server (string or URL object) */
    proxy: `http://localhost:${port}`
}