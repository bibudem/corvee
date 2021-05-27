import path from 'path'

export default {
    apifyLocalStorageDir: path.join(__dirname, './.storage'),
    puppeteerCacheDir: path.join(__dirname, './.cache'),
    startUrl: 'http://localhost:3000/',
    checkExtern: false,
    cookies: true,
    pageWaitUntil: ['load', 'domcontentloaded', 'networkidle0'],
    requestTimeout: 5000,
    navigationOnly: true,
    userAgent: 'Mozilla/5.0 (Corvee/1.0.0)',
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