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

    blockRequestsFromUrlPatterns: ['.bmp', '.css', '.cur', '.gif', '.gzip', '.jpeg', '.jpg', '.mp4', '.png', '.svg', '.ttf', '.webp', '.woff', '.woff2', '.zip', 'googleadservices.com'],
    // Wether to check extern links or not
    checkExtern: true,
    fetchLinksOnce: true,
    // URLs matching the given strings / regular expression will be ignored and not checked.
    ignore: [],
    ignoreDefaults: ['www.google-analytics.com', '/gtag/js', 'ga.js', 'analytics.js', 'https://www.googleadservices.com/', 'doubleclick.net'],
    // Array of URLs matching the given strings / regular expressions. These URLs define the scope of the crawling
    internLinks: [],
    linkParserDelay: 0,
    logLevel: 'info',
    maxDepth: Infinity,
    maxRequestRetries: 3,
    maxRequests: Infinity,
    navigationOnly: true,
    // Check but do not recurse into URLs matching the given strings / regular expressions.
    noFollow: [],
    noFollowDefaults: [],
    notify: true,
    notifyDelay: 10000,
    notifyLogLevel: 'info',
    pageTimeout: 60000,
    pageWaitUntil: ['load'],
    requestTimeout: 45000,
    schemes: [],
    schemesDefaults: ['corvee', 'http', 'https'],
    storageDir: join(tmpDir, '.storage'),
    waitInterval: 50,
}

export const defaultLaunchPuppeteerOptions = {
    //
    // Apify.launchPuppeteer() options
    //

    // Apify specific options
    // see https://sdk.apify.com/docs/typedefs/launch-puppeteer-options
    // proxyUrl: '',
    stealth: true,
    // stealthOptions: {},
    userAgent: `Mozilla/5.0 (Corvee/${pkg.version})`,
    useChrome: false,

    // Puppeteer launch options
    // see https://pptr.dev/api/puppeteer.puppeteerlaunchoptions

    // Browser launch argument options
    // see https://pptr.dev/api/puppeteer.browserlaunchargumentoptions/
    // args: [],
    headless: true,
    userDataDir: join(tmpDir, '.userData'),

    // Browser connect options
    // see https://pptr.dev/api/puppeteer.browserconnectoptions/
    defaultViewport: {
        width: 1920,
        height: 1080
    }
}

export const defaultPuppeteerPoolOptions = {
    //
    // Puppeteer pool options
    // see https://sdk.apify.com/docs/typedefs/puppeteer-pool-options
    useCache: true,
    puppeteerOperationTimeoutSecs: 60
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