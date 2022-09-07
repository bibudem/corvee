import { join } from 'path'
const pkg = require('../../package.json')

const tmpDir = join(process.env.TEMP, 'corvee');

//
// Corvée options
//

export const defaultHarvesterOptions = {

    //
    // Intern options. Do not use
    //

    // Wether to use defaultHarvesterOptions.ignoreDefaults or not
    useIgnoreDefaults: true,
    // Wether to use defaultHarvesterOptions.schemesDefaults or not
    useSchemesDefaults: true,
    // Wether to use defaultHarvesterOptions.noFollowDefaults or not
    useNoFollowDefaults: true,

    //
    // Public options
    //

    // URL patterns that will be blocked from external requests
    blockRequestsFromUrlPatterns: ['.bmp', '.css', '.cur', '.gif', '.gzip', '.jpeg', '.jpg', '.mp4', '.png', '.svg', '.ttf', '.webp', '.woff', '.woff2', '.zip', 'googleadservices.com'],
    /*
     * Which browser to use
     * @type {'chromium' | 'firefox' | 'webkit'}
    */
    browser: 'chromium',
    // Wether to check extern links or not
    checkExtern: true,
    fetchLinksOnce: true,
    getPerfData: false,
    handlePageTimeout: 30000,
    // URLs matching the given strings / regular expression will be ignored and not checked.
    ignore: [],
    ignoreDefaults: ['www.google-analytics.com', '/gtag/js', 'ga.js', 'analytics.js', 'https://www.googleadservices.com/', 'doubleclick.net'],
    // Array of URLs matching the given strings / regular expressions. These URLs define the scope of the crawling ("intern" links)
    internLinks: [],
    linkParserDelay: 0,
    logLevel: 'info',
    maxDepth: Infinity,
    maxRequestRetries: 3,
    maxRequests: Infinity,
    navigationOnly: true,
    navigationTimeout: 30000,
    // Check but do not recurse into URLs matching the given strings / regular expressions.
    noFollow: [],
    noFollowDefaults: [],
    notify: true,
    notifyDelay: 10000,
    notifyLogLevel: 'info',
    pageWaitUntil: ['domcontentloaded'],
    requestTimeout: 30000,
    schemes: [],
    schemesDefaults: ['corvee', 'http', 'https'],
    storageDir: join(tmpDir, '.storage'),
    normalizeUrlFunction: null,
    useRandomUserAgent: false,
    waitInterval: 50,
}

export const defaultLaunchContextOptions = {
    /*
     * Apify.launchPLaywright() options
     * @see https://sdk.apify.com/docs/1.3/typedefs/playwright-launch-context
     */

    /*
     * @type string
     */
    proxyUrl: undefined,

    /*
     * @type boolean
     */
    useChrome: false,

    // /*
    //  * @type boolean
    //  */
    // stealth: true,

    /*
     * Native Playwright options
     * @See https://playwright.dev/docs/api/class-browsertype#browser-type-launch
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

        // Browser connect options
        // see https://pptr.dev/api/puppeteer.browserconnectoptions/
        viewport: {
            width: 1920,
            height: 1080
        }
    }


}

export const defaultAutoscaledPoolOptions = {
    // Autoscaled pool options
    // se https://sdk.apify.com/docs/typedefs/autoscaled-pool-options
    minConcurrency: 1,
    maxConcurrency: 10,
    scaleUpStepRatio: .05,
    scaleDownStepRatio: .08,
    maybeRunIntervalSecs: .05,
    loggingIntervalSecs: 30,
    autoscaleIntervalSecs: 10,
    systemStatusOptions: {
        maxCpuOverloadedRatio: .3,
        currentHistorySecs: 3
    }
}