import path from 'path'
import {
    utils
} from 'apify'

export const server = {
    origin: 'http://www.site.com',
    proxyPort: 3128,
    depth: 5,
    spread: 2
}

export default {
    apifyLocalStorageDir: path.join(__dirname, './.storage'),
    puppeteerCacheDir: path.join(__dirname, './.cache'),
    startUrl: 'http://www.site.com/',
    internLinks: [
        'http://www.site.com[.*]'
    ],
    checkExtern: true,
    pageWaitUntil: ['load', 'domcontentloaded', 'networkidle0'],
    navigationOnly: true,
    userAgent: utils.getRandomUserAgent(),
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