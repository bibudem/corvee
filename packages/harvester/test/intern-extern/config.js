import path from 'path'

export default {
    apifyLocalStorageDir: path.join(__dirname, './.storage'),
    puppeteerCacheDir: path.join(__dirname, './.cache'),
    startUrl: 'http://www.site.com/',
    checkExtern: true,
    pageWaitUntil: ['load', 'domcontentloaded', 'networkidle0'],
    navigationOnly: true,
    userAgent: 'Mozilla/5.0 (Corvee/1.0.0)',
    useCache: true,
    maxConcurrency: 1,
    maxRequests: 10,
    maxRequestRetries: 3,
    requestTimeout: 30000,
    ignore: [],
    noFollow: [/other\-page/],
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