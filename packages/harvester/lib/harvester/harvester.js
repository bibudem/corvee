import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter'
import process from 'node:process'
import { readFile } from 'node:fs/promises'
import os from 'node:os'
import minimatch from 'minimatch'
import { pick, omit, isRegExp, isFunction, isObject, isNull } from 'underscore'
import * as URI from 'uri-js'
import filenamifyUrl from 'filenamify-url'
import { Dataset, KeyValueStore, PlaywrightCrawler, ProxyConfiguration, RequestQueue, Request, Snapshotter, Configuration } from '@crawlee/playwright'
import playwright from 'playwright'
import v from 'io-validate'
import assert from 'assert-plus'
import extend from 'extend'
import { console, inspect, normalizeUrl, isValidUrl } from 'corvee-core'

import { computeUniqueKey } from '../index.js'
import { cleanupFolderPromise } from './cleanup-folder-promise.js'
import { PupResponseIsNullReport, MailUnverifiedAddressReport, MailInvalidSyntaxReport, UrlInvalidUrlReport } from '../reports/index.js'
import { humanDuration, displayUrl } from '../utils/index.js'
import { LinkStore, sessionStore } from '../storage/index.js'
import { Link } from '../link.js'
import { handleResponse, handleFailedRequest, handleFailedNavigationRequest } from '../record.js'
import { PseudoUrls } from '../PseudoUrls.js'
import Notifier from '../utils/notifier.js'

import { defaultBrowserPoolOptions, defaultHarvesterOptions, defaultPlaywrightCrawlerOptions, defaultLaunchContextOptions, defaultAutoscaledPoolOptions, defaultLinkParser, BrowsingContextStore, getPerformanceData, getTimingFor } from './index.js'

const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf-8'))

process.on('unhandledRejection', function onUnhandledRejection(reason, promise) {

    // Case: Error: Error removing file 'data' in directory 'D:\projets\corvee-bib\.storage\key_value_stores\session' referred by APIFY_LOCAL_STORAGE_DIR environment variable: ENOENT: no such file or directory, unlink 'D:\projets\corvee-bib\.storage\key_value_stores\session\data.json'
    if (reason && inspect(reason).indexOf('Error removing file \'data\' in directory') > 0) {
        // This is an unhandled rejected promise from the crawlee api.
        // Will silently ignore this
        return
    }

    // Case: Error: Error writing file 'data' in directory 'D:\projets\corvee-bib\.storage\key_value_stores\session' referred by APIFY_LOCAL_STORAGE_DIR environment variable: EPERM: operation not permitted, open 'D:\projets\corvee-bib\.storage\key_value_stores\session\data.json'
    if (reason && inspect(reason).indexOf('Error writing file \'data\' in directory') > 0) {
        // This is an unhandled rejected promise from the crawlee api.
        // Will silently ignore this
        return
    }

    console.todo(`Unhandled Rejection. Reason: ${inspect(reason)}\nPromise: ${inspect(promise)}`)
})

process.on('uncaughtException', function onUnhandledRejection(error, origin) {
    console.todo(`Uncaught Exception. Error: ${inspect(error)}\nOrigin: ${inspect(origin)}`)
})

/**
 * @typedef {defaultHarvesterOptions} userConfigType
 * @extends {defaultPlaywrightCrawlerOptions}
 * @extends {defaultBrowserPoolOptions}
 * @extends {defaultLaunchContextOptions}
 * @extends {defaultAutoscaledPoolOptions}
 */

/**
 * @typedef configType
 * @type defaultHarvesterOptions
 */

/**
 * Creates a new Harvester
 * @extends AsyncEventEmitter
 * @class
 */
export class Harvester extends AsyncEventEmitter {

    /**
     * 
     * @param {defaultHarvesterOptions | string | Array<string>} config 
     */
    constructor(config) {

        super()

        /**
         * @type {string}
         */
        this.version = pkg.version
        this.isPaused = false
        this._isRunning = false
        this._pausedAt = 0

        let startUrl

        if (typeof config === 'string') {
            startUrl = config
        }

        if (Array.isArray(config)) {
            startUrl = config
        }

        if (startUrl) {
            config = {
                startUrl
            }
        }

        /**
         * @type { configType } config
         */
        this.config = extend(true, {}, defaultHarvesterOptions, pick(omit(config, ['internLinks', 'proxyUrls']), Object.keys(defaultHarvesterOptions)))

        // Don't merge default configs with user configs
        if (typeof config.internLinks !== 'undefined') {
            this.config.internLinks = config.internLinks
        }

        this.autoscaledPoolOptions = extend(true, {}, defaultAutoscaledPoolOptions, pick(config, Object.keys(defaultAutoscaledPoolOptions)))
        this.browserPoolOptions = extend(true, {}, defaultBrowserPoolOptions, pick(config, Object.keys(defaultBrowserPoolOptions)))

        this.launchContextOptions = extend(true, {}, defaultLaunchContextOptions, pick(config, Object.keys(defaultLaunchContextOptions)))
        this.playwrightCrawlerOptions = extend(true, {}, defaultPlaywrightCrawlerOptions, pick(config, Object.keys(defaultPlaywrightCrawlerOptions)))

        this.launchContextOptions.launcher = playwright[this.config.browser]

        if (!process.env.CRAWLEE_STORAGE_DIR) {
            process.env.CRAWLEE_STORAGE_DIR = this.config.storageDir
            // This to prevent a WARN message from crawlee
            process.env.APIFY_LOCAL_STORAGE_DIR = this.config.storageDir
        }

        const crawleeConfig = Configuration.getGlobalConfig()
        crawleeConfig.set('systemInfoIntervalMillis', this.config.notifyDelay)

        // Fixing Crawlee not using our settings

        this.snapshotter = new Snapshotter()

        const totalmem = os.totalmem()

        this.snapshotter.events.on('systemInfo', ev => {

            /**
             * Emits system-info
             * @event Harvester#system-info
             * @type {object}
             */
            this.emit('system-info', {
                createdAt: (new Date()).toISOString(),
                currentRunTime: Date.now() - this.session.startTime,
                cpuCurrentUsage: ev.cpuCurrentUsage,
                memCurrentBytes: ev.memCurrentBytes,
                memCurrentUsage: ev.memCurrentBytes / totalmem * 100,
                memTotalUsage: os.freemem() / totalmem * 100,
                activePagesCount: this.crawler?.browserPool.pages.size,
                activeBrowsersCount: this.crawler?.browserPool.activeBrowserControllers.size
            })
        })

        this.autoscaledPoolOptions.systemStatusOptions.snapshotter = this.snapshotter

        if (typeof config.pageWaitUntil === 'string') {
            this.config.pageWaitUntil = {
                intern: config.pageWaitUntil,
                extern: config.pageWaitUntil
            }
        }

        if (typeof config.proxyUrls !== 'undefined') {
            const proxyUrls = typeof config.proxyUrls === 'string' ? [config.proxyUrls] : config.proxyUrls
            const proxyConfiguration = new ProxyConfiguration({ proxyUrls })
            this.playwrightCrawlerOptions.proxyConfiguration = proxyConfiguration
        }

        console.log(`Setting log level to ${this.config.logLevel}`)
        crawleeConfig.set('logLevel', 6)
        console.setLevel(this.config.logLevel)
        console.verbose('### THIS IS VERBOSE ###')

        this.linkParser = defaultLinkParser

        this.normalizeUrl = this.config.normalizeUrlFunction ? this.config.normalizeUrlFunction : normalizeUrl

        this.browsingContextStore = new BrowsingContextStore(this.normalizeUrl)

        this.notify = new Notifier([], {
            enable: this.config.notify,
            logger: console,
            logLevel: this.config.notifyLogLevel,
            delay: this.config.notifyDelay,
            autoStart: true
        })

        this.crawler = null

        this.plugins = {
            onNavigationResponse: []
        }

        /**
         * @type {{
         *  startTime?: number,
         *  recordCount?: number,
         *  counts?: {
         *      success: number,
         *      fail: number,
         *      activeRequests: number,
         *      finishedRequests: number
         *  }
         * }} sessionType
         */
        this.session = {} // will be initialized in the run() method

        if ('plugins' in this.config) {
            this.addPlugins(this.config.plugins)
        }

        ['schemes', 'noFollow', 'ignore'].forEach(key => {
            const arrayProp = config[key]
            const keepDefaultsProp = `use${key.charAt(0).toUpperCase()}${key.substring(1)}Defaults`
            const defaultProp = `${key}Defaults`
            if (keepDefaultsProp in this.config && this.config[keepDefaultsProp]) {
                let prop = defaultHarvesterOptions[defaultProp]
                if (arrayProp) {
                    prop = prop.concat(arrayProp)
                }
                this.config[key] = Array.from(new Set(prop))
                delete this.config[defaultProp]
            }

        })

        this.homeBasePUrl = new PseudoUrls(this.config.internLinks)

        /**
         * @type {Array<string | Link>}
         */
        this.urlList = []

        /**
         * @type {LinkStore}
         */
        this.linkStore
        this._handledRequests = undefined
    }

    /**
     * 
     * @param { string | object | Link | Array<string|Link|object>} urls 
     */
    async addUrl(urls) {
        return /** @type {Promise<void>} */(new Promise(async (resolve, reject) => {
            v(urls, 'urls').is('string', 'array', 'object')

            if (!Array.isArray(urls)) {
                urls = [urls]
            }
            if (this._isRunning) {
                if (this.addToRequestQueue) {
                    await this.addToRequestQueue(urls.map(url => new Link(url, this.normalizeUrl)))
                    resolve()
                } else {
                    const addToRequestQueueHandle = setInterval(async () => {
                        if (this.addToRequestQueue) {
                            await this.addToRequestQueue(urls.map(url => new Link(url, this.normalizeUrl)))
                            clearInterval(addToRequestQueueHandle)
                            resolve()
                        }
                    }, 100)
                }
            } else {
                this.urlList.push(...urls.map(url => new Link(url, this.normalizeUrl)))
                resolve()
            }

        }))
    }

    /**
     * @param {() => Array<{ url: import('corvee-core').UrlType; text: string | null; urlData: string | null; isNavigationRequest: boolean; }>} fn
     */
    setLinkParser(fn) {
        this.linkParser = fn
    }

    /**
     * @typedef {( { emits: [boolean], fn: function } | function )} PluginHandlerType
     */

    /**
     * @typedef {object} PluginType
     * @property {string} name
     * @property {boolean} [emits=false]
     * @property {PluginHandlerType} [onNavigationResponse]
     */

    /**
     * @param {PluginType[]} plugins
     */
    addPlugins(plugins) {
        if (!Array.isArray(plugins)) {
            plugins = [plugins]
        }

        plugins.forEach(plugin => {
            const name = plugin.name
            const defaultEmits = Reflect.has(plugin, 'emits') ? plugin.emits : false;

            ['onNavigationResponse'].forEach((/** @type {string} */ type) => {
                if (Reflect.has(plugin, type)) {
                    console.log(`Adding plugin \`${plugin.name}\` to \`${type}\< `)
                    const emits = Reflect.has(plugin[type], 'emits') ? plugin[type] : defaultEmits
                    const fn = isFunction(plugin[type]) ? plugin[type] : plugin[type].fn
                    this.plugins[type].push({ name, emits, fn })
                }
            })
        })
    }

    /**
     * 
     * @param {import('corvee-core').UrlType} url 
     * @returns {boolean}
     */
    shouldNotFollowUrl(url) {
        if (this.config.noFollow.length === 0) {
            return false
        }

        return this.config.noFollow.find(testUrl => typeof testUrl === 'string' ? url.includes(testUrl) : testUrl.test(url))
    }

    /**
     * @param {import('corvee-core').UrlType} url
     * @returns {boolean}
     */
    shouldIgnoreUrl(url) {
        const self = this

        /**
         * @param {import('corvee-core').UrlType} url
         */
        function doCheck(url) {
            if (self.config.ignore.length === 0) {
                return false
            }

            return self.config.ignore.find(testUrl => {
                if (typeof testUrl === 'string') {
                    return url.includes(testUrl)
                }
                if (isRegExp(testUrl)) {
                    return testUrl.test(url)
                }
                if (isFunction(testUrl)) {
                    return testUrl(url)
                }
            })
        }

        const shouldIgnore = doCheck(url)

        if (shouldIgnore) {
            console.verbose(`Ignoring url <${url}> based on rule ${shouldIgnore}`)
        }

        return shouldIgnore
    }

    /**
     * @param {import('corvee-core').UrlType} url
     * @returns {boolean}
     */
    isExternLink(url) {
        const isExtern = (() => {
            if (url) {
                return !this.homeBasePUrl.matches(url)
            }

            return true
        })()

        if (isExtern) {
            console.verbose(`This link is extern: ${url}`)
        }

        return isExtern
    }

    /**
     * @param {import('corvee-core').UrlType} url
     * @returns {boolean}
     */
    isInternLink(url) {
        return !this.isExternLink(url)
    }

    isMaxRequestExceeded() {
        return this.playwrightCrawlerOptions.maxRequestsPerCrawl !== -1 && this.session.counts.activeRequests > this.playwrightCrawlerOptions.maxRequestsPerCrawl && this.session.counts.finishedRequests >= this.playwrightCrawlerOptions.maxRequestsPerCrawl
    }

    /**
     * @param {number} [timeout]
     */
    async pause(timeout) {
        if (this.isPaused) {
            console.info('Harvester is already paused.')
            return
        }

        this._pausedAt = Date.now()

        console.info('Pausing harvester...')

        await this.crawler.autoscaledPool.pause(timeout)

        this.notify.pause()

        this.isPaused = true

        setTimeout(() => {
            console.info(`Harvester is paused.`)
        })
    }

    resume() {
        if (this.isPaused) {
            console.info('Harvester is already running.')
            return
        }
        this.crawler.autoscaledPool.resume()
        const pauseTime = Date.now() - this._pausedAt
        this.session.startTime = this.session.startTime + pauseTime
        this._pausedAt = 0
        this.isPaused = false

        this.notify.resume()

        console.info(`Harvester resumed crawling.`)
    }

    async stop() {
        await this.crawler.autoscaledPool.abort()
        process.exit()
    }

    /**
     * @param {object} [runOptions]
     * @param {boolean} [runOptions.resume=false]
     */
    async run(runOptions) {

        const self = this
        const defaultRunOptions = {
            resume: false
        }

        runOptions = Object.assign({}, defaultRunOptions, runOptions)

        this.runOptions = runOptions

        this._isRunning = true
        this.isPaused = false

        if (this.config.notify) {
            this.notify.addMessage(() => {
                const end = Date.now()
                const duration = humanDuration(end - this.session.startTime)
                return `[Execution time] ${duration}`
            })
        }

        const cleanupFolderPromises = []

        if (!runOptions.resume) {

            console.info(`Removing ${this.config.storageDir} and ${this.launchContextOptions.userDataDir} folders...`)

            cleanupFolderPromises.push(cleanupFolderPromise(this.config.storageDir))
            cleanupFolderPromises.push(cleanupFolderPromise(this.launchContextOptions.userDataDir))

        }

        self.session = await sessionStore({
            resume: runOptions.resume
        })

        self.session.startTime = Date.now()

        if (!runOptions.resume) {

            await Promise.all(cleanupFolderPromises)
                .then(() => {
                    console.info(`Done removing ${self.config.storageDir} and ${self.launchContextOptions.userDataDir} folders.`)
                })
                .catch(error => {
                    console.error(inspect(error))
                    process.exit()
                })
        }

        if (self.config.fetchLinksOnce) {
            self.linkStore = new LinkStore()
            await self.linkStore.init()
        }

        self.recordStore = await Dataset.open('records')

        self.session.recordCount = 0
        self.session.counts = {
            success: 0,
            fail: 0,
            activeRequests: 0,
            finishedRequests: 0
        }

        if (runOptions.resume) {
            // set the right record count
            self.session.recordCount = (await self.recordStore.getInfo()).itemCount
            self._handledRequests = new Set()

            await self.recordStore.forEach(async (item) => {
                self.session.counts.finishedRequests++
                self._handledRequests.add(`${item.parent}#${item.url}`)
            })
        }

        process.on('exit', function onExit() {
            self.notify.stop()
            const end = Date.now()
            const duration = humanDuration(end - self.session.startTime)

            /**
             * Emits browsing-contexts
             * @event Harvester#browsing-contexts
             * @type {object}
             */
            self.emit('browsing-contexts', self.browsingContextStore.entries())

            /**
             * Emits end
             * @event Harvester#end
             * @type {number} Duration of the Harvester#run process in ms.
             */
            self.emit('end', duration)

            console.info(`Total execution time: ${duration}`)

        })

        self.screenshotsStore = await KeyValueStore.open('screenshots')

        const requestQueue = await RequestQueue.open('playwright')

        setInterval(async function () {
            /**
             * @type {import('@crawlee/types').RequestQueueInfo}
             */
            const info = await requestQueue.getInfo()

            /**
             * Emits progress
             * @event Harvester#progress
             * @type {object}
             */
            self.emit('progress', {
                handled: info.handledRequestCount,
                handledPercent: info.handledRequestCount / info.totalRequestCount,
                total: info.totalRequestCount,
                pending: info.pendingRequestCount,
                startedAt: self.session.startTime,
                elapsed: Date.now() - self.session.startTime
            })
        }, self.config.notifyDelay)

        if (self.config.notify) {
            self.notify?.addMessage(async () => {
                const { totalRequestCount, handledRequestCount } = await requestQueue.getInfo()
                return `Request queue size: ${totalRequestCount} Handled: ${handledRequestCount}`
            })
        }

        /**
         * @param {import("@crawlee/playwright").RequestOptions} requestData
         */
        async function tryAddToRequestQueue(requestData) {

            /**
             * @param {{ (): Promise<boolean>; (): any; }} fn
             * @param {number} interval
             */
            function tryAgain(fn, interval) {
                return new Promise(async (resolve) => {
                    const handle = setInterval(async () => {
                        var done = await fn()
                        if (done) {
                            clearInterval(handle)
                            resolve()
                        }
                    }, interval)
                })
            }

            return /** @type {Promise<void>} */(new Promise(async resolve => {
                try {
                    if (runOptions.resume) {
                        // resuming previously fetched links
                        if (self._handledRequests.has(`${requestData.url}#${requestData.userData.parent}`)) {
                            return resolve()
                        }
                    }

                    const reqInfo = await requestQueue.addRequest(requestData)

                    if (self.config.fetchLinksOnce) {

                        if (self.linkStore.has(requestData.url)) {

                            const record = await self.linkStore.recordFromData(requestData.userData)

                            console.verbose(`This link has already been fetched. Will skip fetching. Record: ${inspect(record)}`)

                            try {
                                await addRecord(record)

                                self.session.counts.success++

                            } catch (error) {
                                console.error(inspect(error))
                            }

                            return resolve()

                        }

                        if (reqInfo.wasAlreadyHandled) {

                            if (runOptions.resume) {
                                // Resuming a previous harvest job. This link has already been treated.
                                return resolve()
                            }

                            console.todo(`This should not happpen: record wasAlreadyHandled, but is not in the linkStore. requestData: ${inspect(requestData)}, reqInfo: ${inspect(reqInfo)}`)
                            // process.exit()
                            requestData.userData.trials++

                            const request = new Request({
                                url: requestData.userData.url,
                                userData: requestData.userData
                            })

                            request.retryCount = requestData.userData.trials
                            request.id = reqInfo.requestId

                            await requestQueue.reclaimRequest(request)

                            return resolve()
                        }

                        if (reqInfo.wasAlreadyPresent) {

                            // The URL is in the request queue, but it has not yet been processed
                            let i = 0
                            tryAgain(async () => {
                                i++
                                if (self.linkStore.has(requestData.url)) {
                                    try {
                                        const record = await self.linkStore.recordFromData(requestData.userData)
                                        record._from = `linkStore#trial-${i}`

                                        await addRecord(record)

                                        self.session.counts.success++

                                    } catch (error) {

                                        console.error(inspect(error))

                                        return true
                                    }

                                    return true
                                }
                                return false
                            }, 1000)

                        }
                    }

                } catch (error) {
                    console.error(`Request data: ${inspect(requestData)}, error: ${inspect(error)}`)
                }

                resolve()

            }))
        }

        /**
         * @param {object|Array<object|Link>} linkDataset
         */
        async function addToRequestQueue(linkDataset) {

            if (!Array.isArray(linkDataset)) {
                linkDataset = [linkDataset]
            }

            if (linkDataset.length === 0) {
                return Promise.resolve()
            }

            /**
             * @type {Array<Link>}
             */
            const addRequestPromises = []

            linkDataset.forEach(async data => {

                assert.object(data)

                const link = data.constructor.name === 'Link' ? data : new Link(data, self.normalizeUrl)

                assert.string(link.url)
                assert.object(link.userData)

                /**
                 * Emits add-link
                 * @event Harvester#add-link
                 * @type {Link}
                 */
                self.emit('add-link', link)

                /**
                 * @type {URI.URIComponents}
                 */
                let uriObj

                try {
                    uriObj = URI.parse(link.url)
                } catch (error) {
                    console.error(`Missing url property: ${inspect(data)}. Error: ${inspect(error)}`)
                    process.exit()
                }

                if (link.userData.parent) {
                    try {
                        link.userData.parent = self.normalizeUrl(link.userData.parent)
                    } catch (error) {
                        console.error(`self.normalizeUrl error at link.userData.parent: ${link.userData.parent}. Error: ${inspect(error)}`)
                    }
                }

                if (!self.config.schemes.some((/** @type {string} */ scheme) => minimatch(uriObj.scheme, scheme))) {
                    console.warn(`Unsupported scheme: '${uriObj.scheme}' ${link.url ? `at uri ${link.userData.parent} -> ${link.url.substring(0, 100)}` : ''}`)

                    return
                }

                // Don't process links in current page if it's url satisfies one of the options.noFollow[] rules
                const noFollowUrl = self.shouldNotFollowUrl(link.userData.parent)
                if (noFollowUrl) {
                    console.debug(`Rejecting link ${link.url} in ${link.userData.parent} since a noFollow rule was detected: ${noFollowUrl}`)
                    return
                }

                // Stop processing if filtering settings meet
                const ignoreRule = self.shouldIgnoreUrl(link.url)
                if (ignoreRule) {
                    console.debug(`Ignoring this url based on config.ignore rule ${ignoreRule}: ${link.userData.parent} -> ${link.url}`)
                    return
                }

                // This should not occur
                if (self.isExternLink(link.userData.parent)) {
                    console.todo(`Intercepted an URL hosted on an external page that was submitted to fetch queue: ${link.userData.parent} -> ${link.url}.`)
                    return
                }

                self.session.counts.activeRequests++

                const trials = link.userData.trials || 1

                const requestData = extend(true, {}, link, {
                    retryCount: trials
                })

                if (uriObj.scheme === 'http' || uriObj.scheme === 'https') {

                    // Check if URL has a valid syntax
                    if (!isValidUrl(link.url)) {

                        console.warn(`Bad URL: ${link.userData.urlData}`)

                        const urlReport = new UrlInvalidUrlReport(link.userData.urlData)

                        link.userData.reports = [urlReport]

                        const record = await handleFailedRequest(link, null, {
                            _from: 'addToRequestQueue'
                        })

                        await addRecord(record)

                        self.session.counts.fail++

                        return
                    }
                }

                if (uriObj.scheme === 'mailto') {

                    if (uriObj.error) {
                        link.userData.reports = [new MailInvalidSyntaxReport(link.userData.urlData)]
                        self.session.counts.fail++
                    } else {
                        link.userData.reports = [new MailUnverifiedAddressReport()]
                        self.session.counts.success++
                    }

                    const record = await handleResponse(link)

                    await addRecord(record)

                    return
                }

                if (!self.config.fetchLinksOnce) {
                    requestData.uniqueKey = computeUniqueKey({
                        url: requestData.url,
                        method: 'GET',
                        payload: `${Date.now()}:${Math.floor(Math.random() * 1E6)}`,
                        keepUrlFragment: false,
                        useExtendedUniqueKey: true
                    })
                }

                addRequestPromises.push(tryAddToRequestQueue(requestData))
            })

            return Promise.all(addRequestPromises)
                .catch(error => {
                    console.error(inspect(error))
                })
        }

        self.addToRequestQueue = addToRequestQueue

        if (self.config.startUrl) {
            let startUrl = self.config.startUrl
            if (!Array.isArray(startUrl)) {
                console.info(`Start URL: ${startUrl}`)
                startUrl = [startUrl]
            } else {
                console.info(`Start URLs: ${self.config.startUrl.join(', ')}`)
            }

            startUrl.forEach(async url => {

                await addToRequestQueue(new Link(url, {
                    parent: 'corvee:startpage',
                    isNavigationRequest: true
                }, self.normalizeUrl))

            })
        }

        await addToRequestQueue(self.urlList)

        /**
         * @param {import('../record.js').RecordType} record
         */
        async function addRecord(record) {

            return new Promise(async (resolve, reject) => {

                if (self.isMaxRequestExceeded()) {
                    console.info('Maximum requests reached.')
                    return reject('Maximum requests reached.')
                }

                record.id = self.session.recordCount
                record.extern = self.isExternLink(record.url) // ??? parfois la propriété est absente
                record.browsingContextStack = self.browsingContextStore.getContext(record.parent)

                // @ts-ignore
                delete record._ignore

                self.session.recordCount++
                self.session.counts.activeRequests--
                self.session.counts.finishedRequests++

                try {
                    await self.recordStore.pushData(record)
                } catch (error) {
                    console.error(error)
                }

                if (self.config.fetchLinksOnce) {

                    try {
                        if (!self.linkStore.has(record.url)) {
                            console.verbose(`Adding link to link store: ${record.url}`)
                            await self.linkStore.set(record)
                        }
                    } catch (error) {
                        console.error(inspect(error))
                    }
                }

                /**
                 * Emits record
                 * @event Harvester#record
                 * @type {import('../record.js').RecordType}
                 */
                self.emit('record', record, self.session.recordCount)

                if (self.isExternLink(record.parent)) {
                    console.todo(`Parent is external. This should not happen. Record: ${inspect(record)}`)
                }

                resolve()
            }).catch(error => {
                console.error(`Error at addRecord. Error: ${inspect(error)}`)
            })
        }

        /**
         * @param {playwright.Page} page
         * @param {object} options
         * @param {number} options.currentLevel
         */
        async function parseLinksInPage(page, {
            currentLevel
        }) {
            /**
             * @type {any[]}
             */
            const ret = []

            /**
             * @type {Link[]}
             */
            let links = []

            if (typeof page === 'undefined') {
                return ret
            }

            const nextLevel = currentLevel + 1

            if (nextLevel > self.config.maxDepth) {
                return ret
            }

            const parent = self.normalizeUrl(page.url())

            const noFollowUrl = self.shouldNotFollowUrl(parent)
            if (noFollowUrl) {
                console.verbose(`Stop parsing links in ${parent} since a noFollow rule was detected: ${noFollowUrl}`)
                return ret
            }


            try {
                if (self.config.linkParserDelay) {
                    console.debug('waiting ' + self.config.linkParserDelay + 'ms before parsing links')
                    await page.waitFor(self.config.linkParserDelay)
                    // TODO
                    await page.screenshot({
                        path: 'D:/projets/corvee-bib/t.png',
                        fullPage: true
                    })
                    console.debug('waiting done')
                }

                links = await page.evaluate(self.linkParser)

            } catch (error) {
                console.todo(`Could not parse links in page ${page.url()}. Error: ${inspect(error)}`)
            }

            assert.ok(isObject(links) || Array.isArray(links), 'The return value from the parser function must be an object or an array.')

            if (!Array.isArray(links)) {
                links = [links]
            }

            return links
                .map(link => {
                    // type validation
                    v(link).has('url').isString().not.isEmpty()
                    return link
                })
                .map(({ url, ...urlData }) => {
                    return new Link(url, {
                        ...urlData,
                        parent,
                        isNavigationRequest: true,
                        extern: self.isExternLink(url),
                        level: nextLevel,
                        _from: 'parseLinksInPage'
                    }, self.normalizeUrl)
                })
                .filter(link => {

                    if (self.shouldIgnoreUrl(link.url)) {
                        return false
                    }

                    if (self.config.checkExtern) {
                        return true
                    }

                    // else, return only internal links

                    return !link.extern
                })
                // exclude internal links (href="#some-anchor")
                .filter(link => {
                    if (link.userData.urlData && link.userData.urlData.startsWith('#')) {
                        return false
                    }

                    return link.url !== parent
                })
        }

        //
        // crawler
        //

        const crawler = new PlaywrightCrawler({

            ...self.playwrightCrawlerOptions,

            autoscaledPoolOptions: self.autoscaledPoolOptions,
            browserPoolOptions: self.browserPoolOptions,
            // This function is called if the page processing failed more than (maxRequestRetries + 1) times.
            failedRequestHandler: async function onNavigationRequestFailed({
                request,
                response: pwResponse
            },
                error) {

                if (request.userData._ignore || error.message.indexOf('net::ERR_ABORTED') > -1) {

                    // This is handled at onDocumentDownload (pdf downloads)
                    return
                }

                //
                // Main document failed request handler
                // Here we deal with network / browser errors
                //

                console.debug(`Request failed at onNavigationRequestFailed after try [${request.retryCount}] ${request.url}\nError: ${inspect(error)}`)

                if (!request.userData.reports) {
                    request.userData.reports = []
                }
                request.userData.reports.push(error)

                const meta = {
                    _from: 'onNavigationRequestFailed'
                }

                try {

                    let record

                    if (pwResponse) {
                        record = await handleResponse(request, pwResponse, meta)
                    } else {
                        record = await handleFailedNavigationRequest(request, error, meta)
                    }

                    await addRecord(record)

                    self.session.counts.fail++
                } catch (error) {
                    console.todo(`onNavigationRequestFailed function failed at request ${request.url}.\nError: ${inspect(error)}`)
                }
            },
            launchContext: self.launchContextOptions,
            preNavigationHooks: [
                async function preNavigationHooksFunction({ crawler, request, session, page, browserController, proxyInfo }, gotoOptions) {

                    gotoOptions.waitUntil = self.isExternLink(request.url) ? self.config.pageWaitUntil.extern : self.config.pageWaitUntil.intern

                },
                async function pageEventsHandlers({ crawler, request, session, page, browser, proxyInfo }, gotoOptions) {


                    if (typeof request.userData._ignore === 'undefined') {

                        request.userData.trials = request.retryCount

                        /**
                         * Emits request
                         * @event Harvester#request
                         * @type {object}
                         */
                        self.emit('request', request)

                        page.on('error', function onError(error) {

                            if (request.retryCount >= self.config.maxRequestRetries) {

                                console.todo(`Page error at [try: ${request.retryCount}] ${request.url}. Error: ${inspect(error)} Request: ${inspect(request)}`)

                                if (!request.userData.reports) {
                                    request.userData.reports = []
                                }
                                request.userData.reports.push(error)
                            }

                            return reject(error)
                        })

                        page.on('dialog', async function onDialog(dialog) {
                            await dialog.dismiss()
                        })

                        page.on('request', async function onRequest(pwRequest) {

                            //
                            // Initialization of userData
                            //

                            // TODO: remove this test when it is stated that it will never be true
                            if ('userData' in pwRequest) {
                                console.error('pwRequest already have a .userData property. Check why.')
                                process.exit(1)
                            }

                            if (!pwRequest.isNavigationRequest() && self.config.navigationOnly) {
                                // Don't initialize userData if this is an asset request AND settings say we are interrested only on navigation requests
                                return
                            }

                            if (!pwRequest.isNavigationRequest() && self.isExternLink(pwRequest.url())) {
                                // Don't initialize userData if this is an asset request on an external page
                                return
                            }

                            request.userData.isNavigationRequest = pwRequest.isNavigationRequest()

                            const url = pwRequest.url()
                            const parent = page.url()

                            // @ts-ignore
                            pwRequest.userData = Object.assign({ trials: 1 }, request.userData,
                                {
                                    _from: 'onRequest',
                                    url,
                                    parent,
                                    id: request.id
                                })
                        })

                        page.on('request', async function onDocumentRequest(pwRequest) {
                            if (pwRequest.isNavigationRequest()) {

                                const url = pwRequest.url()
                                const parentUrl = page.url()

                                // Don't request if extern setting meets
                                if (!self.config.checkExtern && self.isExternLink(url)) {

                                    console.verbose(`Skipping external request ${displayUrl(parentUrl)} -> ${displayUrl(url)} from settings.`)

                                    // return pwRequest.abort('blockedbyclient')
                                    return
                                }
                            }
                        })

                        page.on('request', async function onAssetRequest(pwRequest) {

                            //
                            // Main asset request handler
                            //
                            // Here we process pages assets only, since they are not handled natively by crawlee.
                            // Page requests are processesd via the playwrightCrawler handlePageFunction
                            //

                            if (!pwRequest.isNavigationRequest() && !self.config.navigationOnly) {

                                if (self.isExternLink(pwRequest.url())) {
                                    // This is an asset of an external page
                                    return
                                }

                                console.debug(`Request URL: ${pwRequest.url()}`)

                                pwRequest.userData._from = 'onAssetRequest'
                            }
                        })

                        page.on('requestfailed', async function onDocumentRequestFailed(pwRequest) {

                            //
                            // Main document request failed handler is located at page.goto().catch()
                            //

                            if (pwRequest.isNavigationRequest()) {

                                if (pwRequest.failure() && pwRequest.failure().errorText.indexOf('net::ERR_BLOCKED_BY_CLIENT') > -1) {
                                    return
                                }

                                if (request.retryCount < self.config.maxRequestRetries) {
                                    return
                                }

                                if (pwRequest.failure() && pwRequest.failure().errorText === 'net::ERR_ABORTED') {

                                    //
                                    // This is a navigation request error
                                    // Has been handled at 'onDocumentDownload'
                                    //

                                    return
                                }

                                // Retry count maxed out.

                            }
                        })

                        page.on('requestfailed', async function onDocumentDownload(pwRequest) {

                            //
                            // Here we process navigation downloads
                            // pdf, zip, docx, etc. documents
                            //

                            // Catch download navigation (pdf, zip, docx, etc.) occuring on first try before puppeteer throws an net::ERR_ABORTED error
                            if (pwRequest.isNavigationRequest() && pwRequest.failure().errorText === 'net::ERR_ABORTED') {

                                if (request.retryCount === 1) {
                                    const pwResponse = await pwRequest.response()
                                    if (pwResponse) {

                                        let record
                                        const meta = {
                                            _from: 'onDocumentDownload',
                                            trials: request.retryCount,
                                            parent: request.userData.parent
                                        }

                                        try {
                                            record = await handleResponse(pwRequest, pwResponse, meta)
                                            await addRecord(record)
                                        } catch (error) {
                                            console.error(inspect(error))
                                        }

                                        self.session.counts.success++
                                    }
                                }

                                request.userData._ignore = true
                                pwRequest.userData._ignore = true

                                return Promise.resolve()

                            }
                        })

                        page.on('requestfailed', async function onAssetRequestFailed(pwRequest) {

                            //
                            // Main asset failed request handler
                            // Since they are not handled natively by crawlee.
                            // Page requests are processesd via the playwrightCrawler handlePageFunction
                            //

                            if (pwRequest.isNavigationRequest()) {
                                return
                            }

                            if (pwRequest.failure() && pwRequest.failure().errorText.indexOf('net::ERR_BLOCKED_BY_CLIENT') > -1) {
                                return
                            }

                            //
                            // Request failed start
                            //

                            const url = pwRequest.url()

                            console.verbose(`${pwRequest.isNavigationRequest() ? `[${request.retryCount}]` : ''} ${pwRequest.isNavigationRequest() ? 'IS' : 'IS NOT'} NAV, ${pwRequest.failure() ? `${pwRequest.failure().errorText} ` : ` `}at ${displayUrl(request.userData.parent)} -> ${displayUrl(url)}`)

                            if (!self.homeBasePUrl.matches(page.url())) {
                                console.verbose(`Ignoring request error on external page asset. ${displayUrl(page.url())} -> ${displayUrl(url)}`)

                                return Promise.resolve()
                            } else {
                                if (['document', 'other'].includes(pwRequest.resourceType())) {
                                    console.warn(`This should be a page asset of the crawled website: ${displayUrl(pwRequest.url())}, resource type: ${pwRequest.resourceType()}`)
                                }
                            }

                            //
                            // Asset request failed start
                            //

                            if (!self.config.navigationOnly) {

                                if (request.retryCount < self.config.maxRequestRetries) {
                                    return
                                }

                                const record = await handleFailedRequest(request, pwRequest, {
                                    _from: 'onAssetRequestFailed'
                                })

                                await addRecord(record)

                                self.session.counts.fail++
                            }
                        })

                        page.on('response', async function onResponse(pwResponse) {

                            //
                            // Here we process common navigation/asset responses.
                            //

                            if (self.config.navigationOnly && !pwResponse.request().isNavigationRequest()) {
                                return
                            }

                            if (request.retryCount >= self.config.maxRequestRetries) {

                                // Processing start

                                request.userData.httpStatusCode = pwResponse.status()
                                request.userData.httpStatusText = pwResponse.statusText()
                            }

                        })

                        page.on('response', async function onNavigationResponse(pwResponse) {

                            //
                            // Here we process some navigation responses only.
                            // The main navigation responses handler is in the playwrightCrawler handlePageFunction
                            //

                            // Is this an navigation request?
                            if (!pwResponse.request().isNavigationRequest()) {
                                return
                            }

                            if (request.retryCount >= self.config.maxRequestRetries) {

                                //
                                // This is a navigation response
                                //

                                // Nothing here
                            }
                        })

                        page.on('response', async function onAssetResponse(pwResponse) {

                            //
                            // Main asset responses handler
                            //
                            // HANDLE ONLY NON DOCUMENT RESOURCES HERE
                            //

                            if (
                                // Is this an asset request?
                                !pwResponse.request().isNavigationRequest() &&

                                // Do config allow to record assets?
                                !self.config.navigationOnly &&

                                // Is the asset an intern link?
                                !self.isExternLink(pwResponse.request().url())
                            ) {

                                //
                                // This is an asset
                                //

                                const statusCode = pwResponse.status()

                                if (statusCode >= 300 && statusCode < 400) {
                                    // This is a redirect response. 
                                    // Wait for the last response of the redirect chain
                                    return
                                }

                                // Is the asset loaded?
                                if (pwResponse.ok() || statusCode >= 400) {

                                    const meta = {
                                        _from: 'onAssetResponse',
                                    }

                                    const firstResponseUrl = (
                                        request => {
                                            while (!isNull(request.redirectedFrom())) {
                                                request = request.redirectedFrom()
                                            }
                                            return request.url()
                                        }
                                    )(pwResponse.request())

                                    meta.timing = await getTimingFor(firstResponseUrl, page)

                                    if (self.config.getPerfData) {
                                        meta.perfData = await getPerformanceData(firstResponseUrl, page)
                                    }

                                    try {

                                        const record = await handleResponse(pwResponse.request(), pwResponse, meta)
                                        await addRecord(record)

                                        self.session.counts.success++

                                    } catch (error) {
                                        console.error(inspect(error))
                                    }

                                    return
                                }

                                self.session.counts.fail++
                                self.session.counts.activeRequests--
                                self.session.counts.finishedRequests++

                                console.error('This response is not handled:', pwResponse.url())
                                console.todo('Response status: ', pwResponse.status())
                                console.todo('Response ok?: ', pwResponse.ok())
                                console.error('Request url:', pwResponse.request().url())
                                console.error('Parent:', request.url)
                                console.error(pwResponse.headers())
                                process.exit()


                            }

                        })

                    }
                },
            ],
            postNavigationHooks: [],
            requestHandler: async function onNavigationResponse({
                request,
                response: pwResponse,
                page
            }) {

                //
                // Main navigation responses handler
                // Here we process navigation responses. 
                // Some handling is also done on a `onNavigationResponse` handler registered on page.on()
                //

                if (!pwResponse) {

                    console.debug(`Response is ${pwResponse} at trial ${request.retryCount}, ${request.url}. Request: ${inspect(request)}`)

                    if (request.loadedUrl) {
                        if (!(request.loadedUrl.startsWith('about:') || request.loadedUrl.startsWith('chrome:') || request.loadedUrl.startsWith('chrome-error:'))) {
                            request.userData.finalUrl = request.loadedUrl
                        }
                    }

                    if (request.retryCount >= self.config.maxRequestRetries) {

                        if (pwResponse === null) {
                            if (!request.userData.reports) {
                                request.userData.reports = []
                            }
                            request.userData.reports.push(new PupResponseIsNullReport('Response is null', request.url))
                        }

                    }

                    //
                    // These cases should be all handled at page.goto().catch()
                    //

                    return Promise.reject()
                }

                /**
                 * @typedef { object } CrawlingContextType
                 * @property { import("playwright-core").Request } request
                 * @property { import("playwright-core").Response } response
                 * @property { import("playwright-core").Page } page
                 * @property { Harvester } harvester
                 */

                /**
                 * Emits response
                 * @event Harvester#response
                 * @type { CrawlingContextType } responseData
                 */
                self.emit('response', {
                    request: pwResponse.request(),
                    response: pwResponse,
                    page,
                    harvester: self
                })

                // try {

                //     const screenshotBuffer = await page.screenshot();

                //     const key = filenamifyUrl(request.url, { replacement: '_' })

                //     // The "key" argument must be at most 256 characters long and only contain the following characters: a-zA-Z0-9!-_.'()
                //     if (key.length > 256) {
                //         key = key.substring(0, 255)
                //     }

                //     await self.screenshotsStore.setValue(key, screenshotBuffer, {
                //         contentType: 'image/png'
                //     })
                // } catch (error) {
                //     console.todo(`Request url: ${request.url}`)
                //     console.todo(error)
                // }

                try {
                    self.normalizeUrl(request.url, true)

                    try {
                        request.userData.timing = await getTimingFor(pwResponse.url(), page)
                    } catch (error) {
                        request.userData.timing = null
                    }

                    const meta = {
                        _from: 'onNavigationResponse'
                    }

                    if (self.config.getPerfData) {
                        meta.perfData = await getPerformanceData(pwResponse.url(), page)
                    }

                    if (self.plugins.onNavigationResponse.length && pwResponse) {
                        for (const plugin of self.plugins.onNavigationResponse) {
                            try {
                                console.debug(`Processing plugin ${plugin.name}`)
                                const data = await plugin.fn.call(self, { page, request, response: pwResponse })
                                if (plugin.emits && data) {
                                    self.emit(plugin.name, data)
                                }
                            } catch (error) {
                                console.error(`[onNavigationResponse] plugin ${plugin.name}, failed at url: ${page.url()}. Error: ${inspect(error)}`)
                            }
                        }
                    }

                    const record = await handleResponse(request, pwResponse, meta)

                    await addRecord(record)

                    self.session.counts.success++

                    //
                    // Should we parse further links in the resulting page?
                    //

                    const pageFinalUrl = self.normalizeUrl(record.finalUrl ? record.finalUrl : record.url, true)

                    const finalNavUrl = self.normalizeUrl(page.url(), true)

                    if (!self.isExternLink(finalNavUrl) && pwResponse && pwResponse.ok()) {

                        const links = await parseLinksInPage(page, {
                            currentLevel: request.userData.level,
                        })

                        await addToRequestQueue(links)

                        try {
                            for (const frame of page.mainFrame().childFrames()) {
                                // TODO: find a better test to detect cross origin frames then !== ''
                                // Some frames' url could be chrome-error://chromewebdata/

                                const frameUrl = frame.url()

                                if (frameUrl && !frameUrl.startsWith('chrome')) {

                                    if (!self.isExternLink(frameUrl)) {
                                        self.browsingContextStore.addContext(frameUrl, pageFinalUrl)
                                    }

                                    const link = new Link(frameUrl, {
                                        parent: pageFinalUrl,
                                        level: request.userData.level,
                                        resourceIsEmbeded: true
                                    }, self.normalizeUrl)

                                    await addToRequestQueue(link)
                                }

                            }
                        } catch (error) {
                            console.error(inspect(error))
                        }

                    }
                } catch (error) {
                    console.error(`Got an error while trying to get the record of the link ${request.url}
Error: ${inspect(error)}`)
                }
            },
            requestQueue: requestQueue,
        })

        crawler.requestHandlerTimeoutMillis = self.playwrightCrawlerOptions.requestHandlerTimeoutSecs * 1000

        self.crawler = crawler

        /**
         * Emits start
         * @event Harvester#start
         */
        self.emit('start')

        console.log('Starting...')

        await crawler.run()

        console.info('Crawler is done.')

        await self.stop()
    }
}