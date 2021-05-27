import path from 'path'

export default {
    apifyLocalStorageDir: path.join(__dirname, './.storage'),
    puppeteerCacheDir: path.join(__dirname, './.cache'),
    //startUrl: 'http://localhost:3000/',
    checkExtern: false,
    cookies: true,
    pageWaitUntil: ['load', 'domcontentloaded', 'networkidle0'],
    navigationOnly: true,
    userAgent: 'Mozilla/5.0 (Corvee/1.0.0)',
    useCache: true,
    maxConcurrency: 100,
    maxRequests: 100,
    maxRequestRetries: 3,
    requestTimeout: 5000,
    ignore: [
        'www.google-analytics.com',
        '/gtag/js',
        'ga.js',
        'analytics.js'
    ],
    noFollow: ['^https?://atrium\\.umontreal\\.ca',
        '^https?://primo-test\\.bib\\.umontreal\\.ca',
        '^https?://bibres\\.bib\\.umontreal\\.ca',
        '^https?://pds\\.bib\\.umontreal\\.ca',
        '^https?://dx\\.doi\\.org',
        '^https?://calypso\\.bib\\.umontreal\\.ca'
    ],
    ignorewarnings: ['http-robots-denied', 'file-missing-slash', 'url-unnormed', 'url-unicode-domain', 'url-anchor-not-found', 'http-cookie-store-error', 'url-content-duplicate', 'https-certificate-error'],
    // internLinks: [
    //     'http://localhost:3000[.*]'
    // ],
    // },

    /**
     * Node.js URL class.
     * @external URL
     * @see {@link https://nodejs.org/api/url.html#url_class_url}
     */

    /** @member {(string|external:URL)} [proxy] - Url of a web proxy server (string or URL object) */
    proxy: 'http://localhost:3128'
}