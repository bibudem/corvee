import path from 'path'

const tmpDir = path.join(process.env.TEMP, 'corvee');

export const defaultHarvesterOptions = {
    notify: 5000,
    apifyLocalStorageDir: path.join(tmpDir, '.storage'),
    puppeteerCacheDir: path.join(tmpDir, '.cache'),
    schemes: ['corvee', 'http', 'https'],
    useSchemesDefaults: true,
    // URLs matching the given regular expression will be ignored and not checked.
    ignore: ['www.google-analytics.com', '/gtag/js', 'ga.js', 'analytics.js', 'https://www.googleadservices.com/', 'doubleclick.net'],
    fetchLinksOnce: true,
    useIgnoreDefaults: true,
    // Check but do not recurse into URLs matching the given regular expression. 
    noFollow: [],
    useNoFollowDefaults: true,
    // internLinks: [
    //     // /.*/
    // ],
    internLinks: null,
    checkExtern: true,
    cookies: true,
    pageTimeout: 60000,
    pageWaitUntil: ['load'],
    requestTimeout: 45000,
    navigationOnly: true,
    useCache: true,
    maxConcurrency: 30,
    maxDepth: Infinity,
    maxRequests: Infinity,
    maxRequestRetries: 3,
    waitInterval: 50,
    linkParserDelay: 0,

    //
    // Apify.launchPuppeteer options
    userAgent: 'Mozilla/5.0 (Corvee/1.0.0)',
    useChrome: false,
    headless: true,
    defaultViewport: {
        width: 1920,
        height: 1080
    },
    // proxyUrl -> proxy,
    stealth: true,
    // stealthOptions: {

    // }

    // ---
    //

}

export const defaultAutoscaledPoolOptions = {
    //maxConcurrency: 1,
    loggingIntervalSecs: 10,
    scaleUpStepRatio: .08,
    scaleDownStepRatio: .08,
    autoscaleIntervalSecs: 6,
    // maybeRunIntervalSecs: .5,
    systemStatusOptions: {
        maxCpuOverloadedRatio: .4,
        currentHistorySecs: 3
    },
    // useLiveView: true,
}

export function defaultLinkParser() {
    return Array
        .from(document.querySelectorAll('a[href]'))
        .map(link => ({
            url: link.href,
            text: link.innerText,
            urlData: link.getAttribute('href'),
            isNavigationRequest: true
        }))
}