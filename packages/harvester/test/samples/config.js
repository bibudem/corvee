import path from 'path'

export default {
    apifyLocalStorageDir: path.join(__dirname, './.storage'),
    puppeteerCacheDir: path.join(__dirname, './.cache'),
    startUrl: 'http://132.204.52.60:8080/samples.html',
    checkExtern: true,
    pageWaitUntil: ['load', 'domcontentloaded', 'networkidle0'],
    navigationOnly: true,
    userAgent: 'Mozilla/5.0 (Corvee/1.0.0)',
    useCache: true,
    maxConcurrency: 10,
    maxRequests: 100,
    maxRequestRetries: 2,
    waitInterval: 3000,
    noFollow: [
        '^https?://atrium\\.umontreal\\.ca',
        '^https?://primo-test\\.bib\\.umontreal\\.ca',
        '^https?://bibres\\.bib\\.umontreal\\.ca',
        '^https?://pds\\.bib\\.umontreal\\.ca',
        '^https?://calypso\\.bib\\.umontreal\\.ca'
    ],
    internLinks: [
        'http://132.204.52.60:8080[.*]'
    ],

    /**
     * Node.js URL class.
     * @external URL
     * @see {@link https://nodejs.org/api/url.html#url_class_url}
     */

    /** @member {(string|external:URL)} [proxy] - Url of a web proxy server (string or URL object) */
    // proxy: 'http://auto:thNA6xtebguaZ9yQbtGmQa4n5@proxy.apify.com:8000'
}