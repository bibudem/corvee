import path from "path";

export default {
    apifyLocalStorageDir: path.join(__dirname, "./.storage"),
    puppeteerCacheDir: path.join(__dirname, "./.cache"),
    //headless: true,
    //useChrome: true,
    //startUrl: "https://badssl.com",
    // checking: {
    checkExtern: true,
    cookies: true,
    pageWaitUntil: ["load", "domcontentloaded", "networkidle0"],
    requestTimeout: 3000,
    navigationOnly: true,
    userAgent: "Mozilla/5.0 (Corvee/1.0.0)",
    useCache: true,
    maxConcurrency: 10,
    maxRequests: 100,
    maxRequestRetries: 3,
    // },
    // filtering: {
    ignore: ["www.google-analytics.com", "/gtag/js", "ga.js", "analytics.js"],
    noFollow: [
        "^https?://atrium\\.umontreal\\.ca",
        "^https?://primo-test\\.bib\\.umontreal\\.ca",
        "^https?://bibres\\.bib\\.umontreal\\.ca",
        "^https?://pds\\.bib\\.umontreal\\.ca",
        "^https?://dx\\.doi\\.org",
        "^https?://calypso\\.bib\\.umontreal\\.ca"
    ],
    ignorewarnings: [
        "http-robots-denied",
        "file-missing-slash",
        "url-unnormed",
        "url-unicode-domain",
        "url-anchor-not-found",
        "http-cookie-store-error",
        "url-content-duplicate",
        "https-certificate-error"
    ],
    internLinks: [
        'http://localhost:3000[.*]'
        // /https:\/\/[^\/]*badssl\.com(:\d+)?\/?/
    ],
    // }

    /**
     * Node.js URL class.
     * @external URL
     * @see {@link https://nodejs.org/api/url.html#url_class_url}
     */

    /** @member {(string|external:URL)} [proxy] - Url of a web proxy server (string or URL object) */
    // proxy: 'some-url'
};