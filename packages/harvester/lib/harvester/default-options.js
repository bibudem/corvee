import { readFile } from 'node:fs/promises';
import { join } from 'node:path'

const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url)))
const tmpDir = join(process.env.TEMP, 'corvee');

/*
 * Corvée options
 */

export const defaultHarvesterOptions = {

    /**
     * @typedef {'domcontentloaded' | 'load' | 'networkidle'} WaitUntilProperty
    */

    /**
     * A string or an object.
     * @typedef { { intern: WaitUntilProperty, extern: WaitUntilProperty } | WaitUntilProperty } WaitUntilType
     */

    //
    // Intern options. Do not use
    //

    /*
     * Wether to use defaultHarvesterOptions.ignoreDefaults or not
     * @private
     */
    useIgnoreDefaults: true,

    /*
     * Wether to use defaultHarvesterOptions.schemesDefaults or not
     * @private
     */
    useSchemesDefaults: true,

    /*
     * Wether to use defaultHarvesterOptions.noFollowDefaults or not
     * @private
     */
    useNoFollowDefaults: true,

    //
    // Public options
    //

    // URL patterns that will be blocked from external requests
    blockRequestsFromUrlPatterns: ['.bmp', '.css', '.cur', '.gif', '.gzip', '.jpeg', '.jpg', '.mp4', '.png', '.svg', '.ttf', '.webp', '.woff', '.woff2', '.zip', 'googleadservices.com'],
    /*
     * Which browser to use
     * @type {'chromium' | 'firefox' | 'webkit'} browserType
    */
    browser: 'chromium',
    // Wether to check extern links or not
    checkExtern: true,
    fetchLinksOnce: true,
    getPerfData: false,
    // URLs matching the given strings / regular expression will be ignored and not checked.
    ignore: [],
    ignoreDefaults: ['www.google-analytics.com', '/gtag/js', 'ga.js', 'analytics.js', 'https://www.googleadservices.com/', 'doubleclick.net'],
    // Array of URLs matching the given strings / regular expressions. These URLs define the scope of the crawling ("intern" links)
    internLinks: [],
    linkParserDelay: 0,
    logLevel: 'info',
    maxDepth: Infinity,
    navigationOnly: true,
    // Check but do not recurse into URLs matching the given strings / regular expressions.
    noFollow: [],
    noFollowDefaults: [],
    normalizeUrlFunction: null,
    notify: true,
    notifyDelay: 10000,
    notifyLogLevel: 'info',

    /*
     * Wait for the page event before consider operation succeeded.
     * @property {WaitUntilType} pageWaitUntil
     */
    pageWaitUntil: {
        intern: 'domcontentloaded',
        extern: 'load'
    },

    /*
     * Proxy server URLs to use
     * @type {string | string[]}
    */
    proxyUrls: undefined,
    schemes: [],
    schemesDefaults: ['corvee', 'http', 'https'],
    startUrl: null,
    storageDir: join(tmpDir, '.storage'),
    useCache: true,
    waitInterval: 50,
}

export const defaultPlaywrightCrawlerOptions = {
    headless: true,
    maxRequestRetries: 3,
    maxRequestsPerCrawl: Infinity,
    navigationTimeoutSecs: 30,
    persistCookiesPerSession: true,
    requestHandlerTimeoutSecs: 30,
    useSessionPool: true
}

export const defaultBrowserPoolOptions = {
    /*
     * @type {boolean}
     */
    useFingerprints: true,

    /*
     * @see {link https://crawlee.dev/api/browser-pool/interface/FingerprintOptions}
     */
    fingerprintOptions: undefined
}

export const defaultLaunchContextOptions = {
    /*
     * Launch options of Playwright
     * @see {@link https://crawlee.dev/api/playwright-crawler/interface/PlaywrightLaunchContext}
     */

    /*
     * @type boolean
     */
    useChrome: false,

    /*
     * @type string
     */
    userAgent: undefined,

    /*
     * @type string
     */
    userDataDir: undefined,

    /*
     * Native Playwright options
     * @See {@link https://playwright.dev/docs/api/class-browsertype#browser-type-launch}
     */
    launchOptions: {

        /*
         * Browser launch argument options
         * @type array
         */
        args: ['--use-gl=egl'],

        /*
         * Puppeteer launch options
         * @type boolean
         * */
        headless: true,

        // /*
        //  * Sets the User Data Directory path
        //  * @type string
        //  */
        // userDataDir: join(tmpDir, '.userData'),

        /*
         * The `User-Agent` HTTP header used by the browser
         * @type string
         */
        userAgent: `Mozilla/5.0 (Corvee/${pkg.version})`,

        /*
         * Browser connect options
         * @see {@link https://pptr.dev/api/puppeteer.browserconnectoptions/}
         */
        viewport: {
            width: 1920,
            height: 1080
        }
    }


}

/*
 * Autoscaled pool options
 * @see {@link https://crawlee.dev/api/core/interface/AutoscaledPoolOptions}
 */
export const defaultAutoscaledPoolOptions = {
    minConcurrency: 1,
    maxConcurrency: 5,
    scaleUpStepRatio: .05,
    scaleDownStepRatio: .05,
    maybeRunIntervalSecs: .5,
    loggingIntervalSecs: 30,
    autoscaleIntervalSecs: 10,
    /*
     * SystemStatus Options
     * @see {@link https://crawlee.dev/api/core/interface/SystemStatusOptions}
     */
    systemStatusOptions: {
        maxCpuOverloadedRatio: .3,
        currentHistorySecs: 5
    }
}