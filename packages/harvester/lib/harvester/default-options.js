import { tmpdir } from 'node:os'
import { readFile } from 'node:fs/promises';
import { join } from 'node:path'

const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf-8'))
const tmpDir = join(process.env.TEMP || tmpdir(), 'corvee');

/**
 * Corvée options
 * @typedef
 */

export const defaultHarvesterOptions = {

    //
    // Intern options. Do not use
    //

    /**
     * Wether to use defaultHarvesterOptions.ignoreDefaults or not
     * @private
     * @default
     */
    useIgnoreDefaults: true,

    /**
     * Wether to use defaultHarvesterOptions.schemesDefaults or not
     * @private
     * @default
     */
    useSchemesDefaults: true,

    /**
     * Wether to use defaultHarvesterOptions.noFollowDefaults or not
     * @private
     * @default
     */
    useNoFollowDefaults: true,

    //
    // Public options
    //

    /**
     * URL patterns that will be blocked from external requests
     * @type {Array<string>}
     */
    blockRequestsFromUrlPatterns: ['.bmp', '.css', '.cur', '.gif', '.gzip', '.jpeg', '.jpg', '.mp4', '.png', '.svg', '.ttf', '.webp', '.woff', '.woff2', '.zip', 'googleadservices.com'],

    /**
     * Which browser to use
     * @type {'chromium' | 'firefox' | 'webkit'} browserType
     */
    browser: 'chromium',

    /**
     * Wether to check extern links or not
     */
    checkExtern: true,
    fetchLinksOnce: true,
    getPerfData: false,

    /**
     * URLs matching the given strings / regular expression will be ignored and not checked.
     * @type {Array<string|RegExp>}
     */
    ignore: [],

    /**
     * @type {Array<string|RegExp>}
     */
    ignoreDefaults: ['www.google-analytics.com', '/gtag/js', 'ga.js', 'analytics.js', 'https://www.googleadservices.com/', 'doubleclick.net'],

    /**
     * Array of URLs matching the given strings / regular expressions. These URLs define the scope of the crawling ("intern" links)
     * @type {Array.<string|RegExp>}
     */
    internLinks: [/^$/],
    linkParserDelay: 0,
    logLevel: 'info',
    maxDepth: Infinity,
    navigationOnly: true,

    /**
     * Check but do not recurse into URLs matching the given strings / regular expressions.
     * @type {Array<string|RegExp>}
     */
    noFollow: [],

    /**
     * @type {Array<string|RegExp>}
     */
    noFollowDefaults: [],

    /**
     * @type {null | Function}
     */
    normalizeUrlFunction: null,

    /**
     * Sets the notifications `on` or `off`
     */
    notify: true,

    notifyDelay: 10_000,
    notifyLogLevel: 'info',

    /**
     * @typedef {'domcontentloaded' | 'load' | 'networkidle'} WaitUntilProperty
    */

    /**
     * A string or an object.
     * @typedef { { intern: WaitUntilProperty, extern: WaitUntilProperty } | WaitUntilProperty } WaitUntilType
     */

    /**
     * Wait for the page event before consider operation succeeded.
     * @type {WaitUntilType} pageWaitUntil
     */
    pageWaitUntil: {
        intern: 'networkidle',
        extern: 'load'
    },

    /**
     * Proxy server URLs to use
     * @type {string | string[]}
     */
    proxyUrls: undefined,

    /**
     * @type {Array<string>} config.schemes - What schemes to follow
     */
    schemes: [],

    /**
     * @type {Array<string>}
     */
    schemesDefaults: ['corvee', 'http', 'https'],

    /**
     * @type {string | Array<string> }
     */
    startUrl: undefined,
    storageDir: join(tmpDir, '.storage'),
    useCache: true,
    waitInterval: 50,
}

/**
 * Autoscaled pool options
 * @typedef
 * @see {@link https://crawlee.dev/api/core/interface/AutoscaledPoolOptions}
 */
export const defaultAutoscaledPoolOptions = {
    minConcurrency: 1,
    maxConcurrency: 10,
    scaleUpStepRatio: .05,
    scaleDownStepRatio: .05,
    maybeRunIntervalSecs: .5,
    loggingIntervalSecs: 10,
    autoscaleIntervalSecs: 10,
    /**
     * SystemStatus Options
     * @see {@link https://crawlee.dev/api/core/interface/SystemStatusOptions}
     */
    systemStatusOptions: {
        maxCpuOverloadedRatio: .3,
        currentHistorySecs: 5
    }
}

/**
 * @typedef
 */
export const defaultBrowserPoolOptions = {

    /**
     * @type {boolean}
     */
    useFingerprints: true,

    /**
     * @type {object | undefined}
     * @see {@link https://crawlee.dev/api/browser-pool/interface/FingerprintOptions}
     */
    fingerprintOptions: undefined
}

/**
 * Launch options of Playwright
 * @typedef
 * @see {@link https://crawlee.dev/api/playwright-crawler/interface/PlaywrightLaunchContext}
 */
export const defaultLaunchContextOptions = {

    /**
     * @type boolean
     */
    useChrome: false,

    /**
     * @type { string | undefined }
     */
    userAgent: undefined,

    /**
     * @type { string | undefined }
     */
    userDataDir: join(tmpDir, '.userDataDir'),

    /**
     * Native Playwright options
     * @See {@link https://playwright.dev/docs/api/class-browsertype#browser-type-launch}
     */
    launchOptions: {

        /**
         * Browser launch argument options
         * @type {Array<string>}
         */
        args: ['--use-gl=egl'],

        /**
         * Puppeteer launch options
         * @type {boolean}
         * */
        headless: true,

        // /*
        //  * Sets the User Data Directory path
        //  * @type string
        //  */
        // userDataDir: join(tmpDir, '.userData'),

        /**
         * The `User-Agent` HTTP header used by the browser
         * @type {string}
         */
        userAgent: `Mozilla/5.0 (Corvee/${pkg.version})`,

        /**
         * Browser connect options
         * @see {@link https://pptr.dev/api/puppeteer.browserconnectoptions/}
         */
        viewport: {
            width: 1920,
            height: 1080
        }
    },

    /**
     * @private
     * @type {import('playwright').BrowserType} BrowserType
     */
    launcher: undefined


}

/**
 * @typedef
 */
export const defaultPlaywrightCrawlerOptions = {
    headless: true,
    maxRequestRetries: 3,
    maxRequestsPerCrawl: Infinity,
    navigationTimeoutSecs: 60,
    persistCookiesPerSession: true,
    requestHandlerTimeoutSecs: 60,
    useSessionPool: true
}