import path from 'path'

const port = 3128;

export const server = {
    port,
}

export default {
    apifyLocalStorageDir: path.join(__dirname, './.storage'),
    puppeteerCacheDir: path.join(__dirname, './.cache'),
    startUrl: `http://intern.com/`,
    internLinks: [
        `http://intern.com[.*]`
    ],
    checkExtern: false,
    pageWaitUntil: ['load', 'domcontentloaded', 'networkidle0'],
    navigationOnly: true,
    userAgent: 'Mozilla/5.0 (Corvee/1.0.0)',
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