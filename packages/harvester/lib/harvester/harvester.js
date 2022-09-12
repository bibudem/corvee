import EventEmitter from 'node:events'
import { readFile } from 'node:fs/promises'

import minimatch from 'minimatch'
import { pick, isRegExp, isFunction, isObject, isNull } from 'underscore'
import * as URI from 'uri-js'
import rp from 'request-promise-native'
import Apify, { BasicCrawler, PlaywrightCrawler } from 'apify'
import playwright from 'playwright'
import v from 'io-validate'
import assert from 'assert-plus'
import extend from 'extend'

import { computeUniqueKey } from '../index.js'
import { cleanupFolderPromise } from './cleanup-folder-promise.js'
import { PupResponseIsNullError, MailUnverifiedAddressError, MailInvalidSyntaxError, UrlInvalidUrlError } from '../errors/index.js'
import { humanDuration, displayUrl } from '../utils/index.js'
import { LinkStore, sessionStore } from '../storage/index.js'
import { Link } from '../link.js'
import { handleResponse, handleFailedRequest } from '../record.js'
import { PseudoUrls } from '../pseudoUrls.js'
import Notifier from '../utils/notifier.js'
import { console, inspect, normalizeUrl, isValidUrl, getRandomUserAgent } from '../../../core/index.js'

import { defaultHarvesterOptions, defaultLaunchContextOptions, defaultAutoscaledPoolOptions, defaultLinkParser, BrowsingContextStore, getPerformanceData, getTimingFor } from './index.js'

const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url)))

process.on('unhandledRejection', function onUnhandledRejection(reason, promise) {

    // Case: Error: Error removing file 'data' in directory 'D:\projets\corvee-bib\.storage\key_value_stores\session' referred by APIFY_LOCAL_STORAGE_DIR environment variable: ENOENT: no such file or directory, unlink 'D:\projets\corvee-bib\.storage\key_value_stores\session\data.json'
    if (reason && inspect(reason).indexOf('Error removing file \'data\' in directory') > 0) {
        // This is an unhandled rejected promise from the apify api.
        // Will silently ignore this
        return
    }

    // Case: Error: Error writing file 'data' in directory 'D:\projets\corvee-bib\.storage\key_value_stores\session' referred by APIFY_LOCAL_STORAGE_DIR environment variable: EPERM: operation not permitted, open 'D:\projets\corvee-bib\.storage\key_value_stores\session\data.json'
    if (reason && inspect(reason).indexOf('Error writing file \'data\' in directory') > 0) {
        // This is an unhandled rejected promise from the apify api.
        // Will silently ignore this
        return
    }

    console.todo(`Unhandled Rejection. Reason: ${inspect(reason)}. Promise: ${inspect(promise)}`);
});

process.on('uncaughtException', function onUnhandledRejection(error, origin) {
    console.todo(`Uncaught Exception. Error: ${inspect(error)}. Origin: ${inspect(origin)}`);
});

const linkProps = new Set();

/**
 * Creates a new Harvester
 * @class
 * @extends EventEmitter
 * @property {boolean} isPaused - Indicates if the harvester is harvesting or paused
 * @property
 */

export class Harvester extends EventEmitter {

    /**
     * 
     * @param {object} config 
     * @param {boolean|number} config.notifyDelay - Notifies at `notify` interval
     * @param {function} config.plugins - TODO
     * @param {array<string>} config.schemes - What schemes to follow
     * @param {array<string|regex>} config.noFollow - TODO
     * @param {array<string|regex>} config.ignore - TODO
     * @param {array<string|regex>} internLinks
     */

    constructor(config = {}) {

        const defaultOptions = extend(true, {}, defaultHarvesterOptions, defaultLaunchContextOptions, defaultAutoscaledPoolOptions)

        super();

        this.version = pkg.version;
        this.isPaused = null;
        this._isRunning = false
        this._pausedAt = 0;

        this.config = extend(true, {}, defaultOptions, config);

        console.log(`Setting log level to ${this.config.logLevel}`)
        console.setLevel(this.config.logLevel)
        console.verbose('### THIS IS VERBOSE ###')

        if (!process.env.APIFY_LOCAL_STORAGE_DIR) {
            process.env.APIFY_LOCAL_STORAGE_DIR = this.config.storageDir;
        }

        this.linkParser = defaultLinkParser;

        this.normalizeUrl = this.config.normalizeUrlFunction ? this.config.normalizeUrlFunction : normalizeUrl

        this.browsingContextStore = new BrowsingContextStore(this.normalizeUrl);

        if (this.config.notify) {
            this.notify = new Notifier([], {
                logger: console,
                logLevel: this.config.notifyLogLevel,
                delay: this.config.notifyDelay,
                autoStart: true
            })
        }

        this.crawlers = [];

        this.plugins = {
            onNavigationResponse: []
        }

        this.session = null; // will be initialized in the run() method

        if ('plugins' in this.config) {
            this.setPlugins(this.config.plugins)
        }

        ['schemes', 'noFollow', 'ignore'].forEach(key => {
            const arrayProp = config[key];
            const keepDefaultsProp = `use${key.charAt(0).toUpperCase()}${key.substring(1)}Defaults`;
            const defaultProp = `${key}Defaults`;
            if (keepDefaultsProp in this.config && this.config[keepDefaultsProp]) {
                let prop = defaultHarvesterOptions[defaultProp];
                if (arrayProp) {
                    prop = prop.concat(arrayProp)
                }
                this.config[key] = Array.from(new Set(prop))
                delete this.config[defaultProp]
            }

        });

        this.homeBasePUrl = new PseudoUrls(this.config.internLinks)

        this.urlList = [];

        this.launchContextOptions = extend(true, {}, pick(this.config, Object.keys(defaultLaunchContextOptions)))

        this.launchContextOptions.launcher = playwright[this.config.browser]

        console.verbose(`this.launchContextOptions: ${inspect(this.launchContextOptions)}`)

        this.autoscaledPoolOptions = extend(true, {}, pick(this.config, Object.keys(defaultAutoscaledPoolOptions)))

        console.verbose(`this.autoscaledPoolOptions: ${inspect(this.autoscaledPoolOptions)}`)
    }

    async addUrl(urls) {
        return new Promise(async (resolve, reject) => {
            v(urls, 'urls').is('string', 'array', 'object')

            if (!Array.isArray(urls)) {
                urls = [urls]
            }
            if (this._isRunning) {
                if (this._addToRequestQueue) {
                    await this._addToRequestQueue(...urls.map(url => new Link(url, this.normalizeUrl)))
                    resolve()
                } else {
                    let addToRequestQueueHandle;
                    setInterval(async () => {
                        if (this._addToRequestQueue) {
                            await this._addToRequestQueue(...urls.map(url => new Link(url, tis.normalizeUrl)))
                            clearInterval(addToRequestQueueHandle)
                            resolve()
                        }
                    }, 100)
                }
            } else {
                this.urlList.push(...urls.map(url => new Link(url, this.normalizeUrl)))
                resolve()
            }

        })
    }

    setLinkParser(fn) {
        this.linkParser = fn;
    }

    setPlugins(plugins) {
        if (!Array.isArray(plugins)) {
            plugins = [plugins];
        }

        plugins.forEach(p => {
            ['onNavigationResponse'].forEach(type => {
                if (type in p) {
                    console.log(`Adding plugin ${p.name} to ${type}`)
                    this.plugins[type].push({
                        name: p.name,
                        fn: p[type]
                    })
                }
            })
        })
    }

    shouldNotFollowUrl(url) {
        if (this.config.noFollow.length === 0) {
            return false;
        }

        return this.config.noFollow.find(testUrl => typeof testUrl === 'string' ? url.includes(testUrl) : testUrl.test(url))
    }

    shouldIgnoreUrl(url) {
        const self = this;

        function doCheck(url) {
            if (self.config.ignore.length === 0) {
                return false;
            }

            return self.config.ignore.find(testUrl => {
                if (typeof testUrl === 'string') {
                    return url.includes(testUrl);
                }
                if (isRegExp(testUrl)) {
                    return testUrl.test(url)
                }
                if (isFunction(testUrl)) {
                    return testUrl(url)
                }
            })
        }

        const shouldIgnore = doCheck(url);

        if (shouldIgnore) {
            console.verbose(`Ignoring url <${url}> based on rule ${shouldIgnore}`)
        }

        return shouldIgnore;
    }

    isExternLink(url) {
        const isExtern = (() => {
            if (url) {
                return !this.homeBasePUrl.matches(url);
            }

            return true;
        })();

        if (isExtern) {
            console.verbose(`This link is extern: ${url}`)
        }

        return isExtern;
    }

    isMaxRequestExceeded() {
        return this.config.maxRequests !== -1 && this.session.counts.activeRequests > this.config.maxRequests && this.session.counts.finishedRequests >= this.config.maxRequests;
    }

    async pause(timeout) {
        if (this.isPaused) {
            console.info('Harvester is already paused.')
            return;
        }

        this._pausedAt = Date.now();

        console.info('Pausing harvester...')

        await Promise
            .all(this.crawlers.map(crawler => crawler.pause(timeout)))
            .catch(error => {
                console.error(inspect(error))
            })

        if (this.notify) {
            this.notify.pause();
        }

        this.isPaused = true;

        setTimeout(() => {
            console.info(`Harvester is paused.`)
        })
    }

    resume() {
        if (!this.isPaused) {
            console.info('Harvester is already running.')
            return;
        }
        this.crawlers.forEach(crawler => crawler.resume())
        const pauseTime = Date.now() - this._pausedAt;
        this.session.startTime = this.session.startTime + pauseTime;
        this._pausedAt = 0;
        this.isPaused = false;

        if (this.notify) {
            this.notify.resume();
        }

        console.info(`Harvester resumed crawling.`)
    }

    stop() {
        process.exit();
    }

    resume() {
        return this.run({
            resume: true
        })
    }

    run(runOptions) {

        const self = this;
        const defaultRunOptions = {
            resume: false
        }

        runOptions = Object.assign({}, defaultRunOptions, runOptions);

        this.runOptions = runOptions;

        this._isRunning = true;
        this.isPaused = false;

        if (this.notify) {
            this.notify.addMessage(() => {
                const end = Date.now();
                const duration = humanDuration(end - this.session.startTime)
                return `[Execution time] ${duration}`;
            })
        }

        console.info(`Running with config: ${inspect(this.config)}`);
        console.info(`Running with run options: ${inspect(this.runOptions)}`)

        const cleanupFolderPromises = [];

        if (!runOptions.resume) {

            console.info(`Removing ${this.config.storageDir} and ${this.config.userDataDir} folders...`)

            const tmpDirSuffix = `${Date.now()}`;
            const tmpStorageDir = `${this.config.storageDir}_${tmpDirSuffix}`;
            const tmpUserDataDir = `${this.config.userDataDir}_${tmpDirSuffix}`;

            cleanupFolderPromises.push(cleanupFolderPromise(this.config.storageDir, tmpStorageDir));
            cleanupFolderPromises.push(cleanupFolderPromise(this.config.userDataDir, tmpUserDataDir));

        }

        return async function run() {

            self.session = await sessionStore({
                resume: runOptions.resume
            });

            self.session.startTime = Date.now();

            if (!runOptions.resume) {

                await Promise.all(cleanupFolderPromises)
                    .then(() => {
                        console.info(`Done removing ${self.config.storageDir} and ${self.config.userDataDir} folders.`);
                    })
                    .catch(error => {
                        console.error(inspect(error))
                        process.exit()
                    })
            }

            self.assetsLinksStore = await Apify.openDataset('assets-urls');

            if (self.config.fetchLinksOnce) {
                self.linkStore = new LinkStore();
                await self.linkStore.init();
            }

            self.recordStore = await Apify.openDataset('records');

            self.session.recordCount = 0;
            self.session.counts = {
                success: 0,
                fail: 0,
                activeRequests: 0,
                finishedRequests: 0
            }

            if (runOptions.resume) {
                // set the right record count
                self.session.recordCount = (await self.recordStore.getInfo()).itemCount;
                self._handledRequests = new Set();

                await self.recordStore.forEach(async (item) => {
                    self.session.counts.finishedRequests++
                    self._handledRequests.add(`${item.parent}#${item.url}`)
                })
            }

            process.on('exit', function onExit() {
                if (self.notify) {
                    self.notify.stop();
                }
                const end = Date.now();
                const duration = humanDuration(end - self.session.startTime);

                self.emit('browsing-contexts', self.browsingContextStore.entries())

                self.emit('end')

                console.info(`Link props: ${Array.from(linkProps.values()).join(', ')}`)

                console.info(`Total execution time: ${duration}`)

            });

            // self.screenshotsStore = await Apify.openKeyValueStore('screenshots');

            const requestQueue = await Apify.openRequestQueue('playwright');

            setInterval(async function () {
                const info = await requestQueue.getInfo();
                self.emit('progress', {
                    handled: info.handledRequestCount,
                    handledPercent: info.handledRequestCount / info.totalRequestCount,
                    total: info.totalRequestCount,
                    pending: info.pendingRequestCount,
                    startedAt: self.session.startTime,
                    elapsed: Date.now() - self.session.startTime
                })
            }, self.config.notifyDelay)

            const basicRequestQueue = await Apify.openRequestQueue('basic');

            self.notify.addMessage(async () => {
                const info = await requestQueue.getInfo();
                return `Request queue size: ${info.totalRequestCount} Handled: ${info.handledRequestCount}`
            })

            const uniqueLinksPerPage = new Map();

            async function tryAddToRequestQueue(queue, requestData) {

                function tryAgain(fn, interval) {
                    return new Promise(async (resolve) => {
                        const handle = setInterval(async () => {
                            var done = await fn();
                            if (done) {
                                clearInterval(handle);
                                resolve();
                            }
                        }, interval)
                    });
                }

                return new Promise(async resolve => {
                    try {
                        if (runOptions.resume) {
                            // resuming previously fetched links
                            if (self._handledRequests.has(`${requestData.url}#${requestData.userData.parent}`)) {
                                return resolve();
                            }
                        }

                        const reqInfo = await queue.addRequest(requestData);

                        if (self.config.fetchLinksOnce) {

                            if (self.linkStore.has(requestData.url)) {

                                const record = await self.linkStore.recordFromData(requestData.userData)

                                console.verbose(`This link has already been fetched. Will skip fetching. Record: ${inspect(record)}`)

                                try {
                                    await addRecord(record);

                                    self.session.counts.success++

                                } catch (error) {
                                    console.error(inspect(error));
                                }

                                return resolve();

                            }

                            if (reqInfo.wasAlreadyHandled) {

                                if (runOptions.resume) {
                                    // Resuming a previous harvest job. This link has already been treated.
                                    return resolve()
                                }

                                console.todo(`This should not happpen: record wasAlreadyHandled, but is not in the linkStore. requestData: ${inspect(requestData)}, reqInfo: ${inspect(reqInfo)}`)
                                // process.exit()
                                requestData.userData.trials++

                                const request = new Apify.Request({
                                    url: requestData.userData.url,
                                    userData: requestData.userData,
                                    retryCount: requestData.userData.trials
                                })

                                request.id = requestData.userData.id

                                await queue.reclaimRequest(request)

                                return resolve()
                            }

                            if (reqInfo.wasAlreadyPresent) {

                                // The URL is in the request queue, but it has not yet been processed
                                let i = 0;
                                tryAgain(async () => {
                                    i++;
                                    if (self.linkStore.has(requestData.url)) {
                                        try {
                                            const record = await self.linkStore.recordFromData(requestData.userData);
                                            record._from = `linkStore#trial-${i}`

                                            await addRecord(record);

                                            self.session.counts.success++

                                        } catch (error) {

                                            console.error(inspect(error));

                                            return true
                                        }

                                        return true;
                                    }
                                    return false;
                                }, 1000)

                            }
                        }

                    } catch (error) {
                        console.error(`Request data: ${inspect(requestData)}, error: ${inspect(error)}`)
                    }

                    resolve();

                })
            }

            async function addToRequestQueue(which, linkDataset) {

                if (typeof linkDataset === 'undefined') {
                    linkDataset = which;
                    which = 'pup'
                }

                assert.string(which)

                if (!Array.isArray(linkDataset)) {
                    linkDataset = [linkDataset]
                }

                if (linkDataset.length === 0) {
                    return Promise.resolve()
                }

                const queue = which === 'basic' ? basicRequestQueue : requestQueue;

                const addRequestPromises = [];

                linkDataset.forEach(async data => {

                    assert.object(data)

                    const link = data.constructor.name === 'Link' ? data : new Link(data, self.normalizeUrl)
                    let uriObj;

                    assert.string(link.url)
                    assert.object(link.userData)

                    if (link.userData.parent) {
                        try {
                            link.userData.parent = self.normalizeUrl(link.userData.parent)
                        } catch (error) {
                            console.error(`self.normalizeUrl error at link.userData.parent: ${link.userData.parent}. Error: ${inspect(error)}`)
                        }
                    }

                    try {
                        uriObj = URI.parse(link.url);
                    } catch (error) {
                        console.error(`Missing url property: ${inspect(data)}. Error: ${inspect(error)}`)
                        process.exit();
                    }

                    //
                    // Don't collect the same link twice per page
                    //
                    const pageUrl = link.userData.parent;

                    if (!uniqueLinksPerPage.has(pageUrl)) {
                        uniqueLinksPerPage.set(pageUrl, new Set())
                    }

                    if (uniqueLinksPerPage.get(pageUrl).has(link.url)) {
                        return;
                    }

                    uniqueLinksPerPage.get(pageUrl).add(link.url);

                    if (!self.config.schemes.some(scheme => minimatch(uriObj.scheme, scheme))) {
                        console.warn(`Unsupported scheme: '${uriObj.scheme}' ${link.url ? `at uri <${link.url}>` : ''}`)

                        return;
                    }

                    const trials = link.userData.trials || 1;

                    const requestData = extend(true, {}, link, {
                        retryCount: trials
                    })

                    // Don't process links in current page if it's url satisfies one of the options.noFollow[] rules
                    const noFollowUrl = self.shouldNotFollowUrl(requestData.userData.parent)
                    if (noFollowUrl) {
                        console.debug(`Rejecting link ${requestData.url} in ${requestData.userData.parent} since a noFollow rule was detected: ${noFollowUrl}`)
                        return;
                    }

                    // Stop processing if filtering settings meet
                    const ignoreRule = self.shouldIgnoreUrl(requestData.url)
                    if (ignoreRule) {
                        console.debug(`Ignoring this url based on config.ignore rule ${ignoreRule}: ${requestData.userData.parent} -> ${requestData.url}`);
                        return;
                    }

                    // This should not occur
                    if (self.isExternLink(requestData.userData.parent)) {
                        console.todo(`Intercepted an URL hosted on an external page that was submitted to fetch queue: ${requestData.userData.parent} -> ${requestData.url}.`)
                        return;
                    }

                    if (link.url !== 'corvee:dummy-url') {

                        self.session.counts.activeRequests++

                        self.emit('add-link', link);
                    }

                    if (uriObj.scheme === 'http' || uriObj.scheme === 'https') {

                        // Check if URL has a valid syntax
                        if (!isValidUrl(link.url)) {

                            console.warn(`Bad URL: ${link.userData.urlData}`)

                            const urlError = new UrlInvalidUrlError(link.userData.urlData)

                            link.userData.reports = [urlError];

                            const record = await handleFailedRequest(link, {
                                _from: 'addToRequestQueue'
                            })

                            await addRecord(record);

                            self.session.counts.fail++

                            return
                        }
                    }

                    if (uriObj.scheme === 'mailto') {

                        if (uriObj.error) {
                            link.userData.reports = [new MailInvalidSyntaxError()]
                            self.session.counts.fail++
                        } else {
                            link.userData.reports = [new MailUnverifiedAddressError()]
                            self.session.counts.success++
                        }

                        const record = await handleResponse(link)

                        await addRecord(record);

                        return;
                    }

                    if (!self.config.fetchLinksOnce) {
                        requestData.uniqueKey = computeUniqueKey({
                            url: requestData.url,
                            method: 'GET',
                            payload: `${Date.now()}:${Math.floor(Math.random() * 1E6)}`,
                            keepUrlFragment: false,
                            useExtendedUniqueKey: true
                        });
                    }

                    addRequestPromises.push(tryAddToRequestQueue(queue, requestData))
                })

                return Promise.all(addRequestPromises)
                    .catch(e => {
                        console.error(inspect(error))
                    });
            }

            self._addToRequestQueue = addToRequestQueue

            if (self.config.startUrl) {

                console.info(`Start URL: ${self.config.startUrl}`)

                await addToRequestQueue(new Link(self.config.startUrl, {
                    parent: 'corvee:startpage',
                    isNavigationRequest: true
                }, self.normalizeUrl))
            }

            await addToRequestQueue(self.urlList)

            await addToRequestQueue('basic', new Link('corvee:dummy-url', {
                parent: 'corvee:startpage'
            }, self.normalizeUrl))

            async function addRecord(record) {

                return new Promise(async (resolve, reject) => {

                    if (self.isMaxRequestExceeded()) {
                        console.info('Maximum requests reached.')
                        return reject('Maximum requests reached.');
                    }

                    record.id = self.session.recordCount;
                    record.extern = self.isExternLink(record.url); // ??? parfois la propriété est absente
                    record.browsingContextStack = self.browsingContextStore.getContext(record.parent)

                    self.session.recordCount++;
                    self.session.counts.activeRequests--
                    self.session.counts.finishedRequests++

                    try {
                        await self.recordStore.pushData(record);
                    } catch (error) {
                        console.error(error)
                    }

                    if (self.config.fetchLinksOnce) {
                        Object.keys(record).forEach(key => linkProps.add(key));

                        try {
                            if (!self.linkStore.has(record.url)) {
                                console.verbose(`Adding link to link store: ${record.url}`);
                                await self.linkStore.set(record);
                            }
                        } catch (error) {
                            console.error(inspect(error));
                        }
                    }

                    self.emit('record', record, self.session.recordCount)

                    if (self.isExternLink(record.parent)) {
                        console.todo(`Parent is external. This should not happen. Record: ${inspect(record)}`)
                    }

                    resolve();
                }).catch(error => {
                    console.error(`Error at addRecord. Error: ${inspect(error)}`)
                })
            }

            async function parseLinksInPage(page, {
                currentLevel
            }) {
                const ret = [];

                if (typeof page === 'undefined') {
                    return ret
                }

                const nextLevel = currentLevel + 1;

                if (nextLevel > self.config.maxDepth) {
                    return ret
                }

                const parent = self.normalizeUrl(page.url());

                const noFollowUrl = self.shouldNotFollowUrl(parent)
                if (noFollowUrl) {
                    console.verbose(`Stop parsing links in ${parent} since a noFollow rule was detected: ${noFollowUrl}`)
                    return ret;
                }

                let links = []

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

                assert(isObject(links) || Array.isArray(links), 'The return value from the parser function must be an object or an array.')

                if (!Array.isArray(links)) {
                    links = [links];
                }

                return links
                    .map(link => {
                        // type validation
                        v(link).has('url').isString().not.isEmpty()
                        return link;
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
                            return false;
                        }

                        if (self.config.checkExtern) {
                            return true;
                        }

                        // else, return only internal links

                        return !link.extern;
                    })
                    // exclude internal links (href="#some-anchor")
                    .filter(link => {
                        if (link.userData.urlData && link.userData.urlData.startsWith('#')) {
                            return false
                        }

                        return link.url !== parent
                    })
            }

            const basicCrawler = new BasicCrawler({
                requestQueue: basicRequestQueue,
                autoscaledPoolOptions: {
                    ...self.autoscaledPoolOptions,
                    loggingIntervalSecs: Infinity,
                    isFinishedFunction: async function isFinished() {
                        const requestQueueIsFinished = await requestQueue.isFinished();
                        const basicRequestQueueIsFinished = await basicRequestQueue.isFinished();

                        if (self.isMaxRequestExceeded()) {
                            return true;
                        }

                        if (!requestQueueIsFinished) {
                            return false;
                        }

                        return basicRequestQueueIsFinished;
                    }
                },
                handleRequestFunction: async function handleBasicRequest({
                    request,
                    autoscaledPool
                }) {
                    console.verbose(`Processing [${request.retryCount}] ${request.url}`)

                    if (request.url === 'corvee:dummy-url') {
                        return Promise.reject();
                    }

                    // Stop processing if filtering settings meet
                    const ignoreRule = self.shouldIgnoreUrl(request.url)
                    if (ignoreRule) {
                        console.debug(`Ignoring this url based on config.ignore rule \`${ignoreRule}\`: [${request.url}] -> ${url}`);
                        return Promise.reject();
                    }

                    return new Promise(async function handleBasicRequestPromise(resolve, reject) {
                        rp({
                            url: request.url,
                            resolveWithFullResponse: true,
                            simple: false,
                            followAllRedirects: true
                        })
                            .then(async response => {
                                console.log('---> response from basic crawler. Status: ', response.statusCode)

                                if (request.retryCount >= self.config.maxRequestRetries) {
                                    const record = await handleResponse(request, response, {
                                        _from: 'handleBasicRequest'
                                    })
                                    await addRecord(record)

                                    self.session.counts.success++

                                    return resolve();
                                }

                                if (!(/^2/.test('' + response.statusCode))) { // Status codes other than 2xx
                                    reject(new Error('test'));
                                    return;
                                }

                                if (!self.isMaxRequestExceeded()) {
                                    const record = await handleResponse(request, response);
                                    console.info(record)
                                    await addRecord(record);

                                    self.session.counts.success++
                                }
                                resolve(response)
                            })
                            .catch(error => {
                                console.todo(inspect(error))
                                reject(error)
                                throw error;
                            });

                    }

                    ).catch(error => {
                        console.error(inspect(error))
                    })
                },
                handleFailedRequestFunction: function onNavigationRequestFailed({
                    request,
                    error
                }) {

                    if (request.url.startsWith('corvee:')) {
                        return;
                    }

                    console.debug(inspect(request))
                },
                maxRequestRetries: self.config.maxRequestRetries,
                handleRequestTimeoutSecs: self.config.requestTimeout
            });

            basicCrawler.pause = function pause(timeout) {
                return basicCrawler.autoscaledPool.pause(timeout);
            }

            basicCrawler.resume = function resume() {
                return basicCrawler.autoscaledPool.resume();
            }

            self.crawlers.push(basicCrawler)

            //
            // PLaywright crawler
            //

            const playwrightCrawler = new PlaywrightCrawler({
                handlePageFunction: async function onNavigationResponse({
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
                                request.userData.reports.push(new PupResponseIsNullError('Response is null', request.url))
                            }

                        }

                        //
                        // These cases should be all handled at page.goto().catch()
                        //

                        return Promise.reject()
                    }

                    self.emit('response', {
                        type: 'navigation',
                        request: pwResponse.request(),
                        response: pwResponse
                    })

                    // try {
                    //     if (!pwResponse.ok()) {

                    //         const screenshotBuffer = await page.screenshot();

                    //         // The "key" of a KeyValueStore must be at most 256 characters long and only contain the following characters: a-zA-Z0-9!-_
                    //         const key = filenamifyUrl(request.url)

                    //         await self.screenshotsStore.setValue(key, screenshotBuffer, {
                    //             contentType: 'image/png'
                    //         })
                    //     }
                    // } catch (error) {
                    //     console.todo(`Request url: ${request.url}`)
                    //     console.todo(error)
                    // }

                    try {
                        self.normalizeUrl(request.url, true);

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
                            self.plugins.onNavigationResponse.forEach(async plugin => {
                                try {
                                    console.verbose(`Processing plugin ${plugin.name}`)
                                    await plugin.fn.call(self, request, pwResponse, page)
                                } catch (error) {
                                    console.error(`[onNavigationResponse] plugin ${plugin.name}, failed. Error: ${inspect(error)}`)
                                }
                            })
                        }

                        const record = await handleResponse(request, pwResponse, meta)

                        await addRecord(record);

                        self.session.counts.success++

                        //
                        // Should we parse further links in the resulting page?
                        //

                        const pageFinalUrl = self.normalizeUrl(record.finalUrl ? record.finalUrl : record.url, true)

                        const finalNavUrl = self.normalizeUrl(page.url(), true);

                        if (!self.isExternLink(finalNavUrl) && pwResponse && pwResponse.ok()) {

                            const links = await parseLinksInPage(page, {
                                currentLevel: request.userData.level,
                            });

                            await addToRequestQueue(links)

                            try {
                                for (const frame of page.mainFrame().childFrames()) {
                                    // TODO: find a better test to detect cross origin frames then !== ''
                                    // Some frames' url could be chrome-error://chromewebdata/

                                    const frameUrl = frame.url();

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
                navigationTimeoutSecs: self.config.navigationTimeout / 1000,
                // This function is called if the page processing failed more than (maxRequestRetries + 1) times.
                handleFailedRequestFunction: async function onNavigationRequestFailed({
                    request,
                    error
                }) {
                    // Nothing here
                },
                preNavigationHooks: [
                    async function preNavigationHooksFunction({ crawler, request, session, page, browserController, proxyInfo }, gotoOptions) {

                        const extraHTTPHeaders = {
                            // 'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                            // 'accept-encoding': 'gzip, deflate, br',
                            // 'cache-control': 'no-cache',
                            // 'connection': 'keep-alive',
                            // 'accept-language': 'en-CA,en;q=0.9,fr-CA;q=0.8,fr;q=0.7,en-US;q=0.6,la;q=0.5',
                            // 'pragma': 'no-cache',
                            // 'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
                            // 'sec-ch-ua-mobile': '?0',
                            // 'sec-ch-ua-platform': 'Windows',
                            // 'sec-ch-dest': 'document',
                            // 'sec-fetch-site': 'none',
                            // 'sec-fetch-user': '?1',
                            // 'upgrade-insecure-requests': '1'
                        }

                        if (self.config.useRandomUserAgent) {
                            extraHTTPHeaders['user-agent'] = getRandomUserAgent()
                        } else {
                            extraHTTPHeaders['user-agent'] = self.config.userAgent
                        }

                        await page.setExtraHTTPHeaders(extraHTTPHeaders)

                    }

                ],
                postNavigationHooks: [],
                gotoFunction: async function gotoFunction({
                    request,
                    page
                }) {

                    return new Promise(async (resolve, reject) => {

                        if (request.userData._ignore) {
                            return resolve()
                        }

                        // self.queue.add(async () => {

                        request.userData.trials = request.retryCount;

                        self.emit('request', request)

                        // await page._client.send('Network.enable', {
                        //     maxResourceBufferSize: 1024 * 1204 * 100,
                        //     maxTotalBufferSize: 1024 * 1204 * 400,
                        // })

                        page.on('error', function onError(error) {

                            if (request.retryCount >= self.config.maxRequestRetries) {

                                console.todo(`Page error at [try: ${request.retryCount}] ${request.url}. Error: ${inspect(error)} Request: ${inspect(request)}`)

                                if (!request.userData.reports) {
                                    request.userData.reports = []
                                }
                                request.userData.reports.push(error);
                            }

                            return reject(error)
                        })

                        page.on('dialog', async function onDialog(dialog) {
                            await dialog.dismiss();
                        });

                        page.on('request', async function onRequest(pwRequest) {

                            //
                            // Initialization of userData
                            //

                            // TODO: remove this test when it is stated that it will never be true
                            if ('userData' in pwRequest) {
                                console.error('pwRequest already have a .userData property. Check why.')
                                process.exit(1);
                            }

                            if (!pwRequest.isNavigationRequest() && self.config.navigationOnly) {
                                // Don't initialize userData if this is an asset request AND settings say we are interrested only on navigation requests
                                return
                            }

                            if (!pwRequest.isNavigationRequest() && self.isExternLink(pwRequest.url())) {
                                // Don't initialize userData if this is an asset request on an external page
                                return
                            }

                            const url = pwRequest.url();
                            const parent = page.url();

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

                                // Don't request if extern setting meets
                                if (!self.config.checkExtern && self.isExternLink(url)) {

                                    console.verbose(`Skipping external request ${displayUrl(parentUrl)} -> ${displayUrl(url)} from settings.`);

                                    return pwRequest.abort('blockedbyclient')
                                }
                            }
                        })

                        page.on('request', async function onAssetRequest(pwRequest) {

                            //
                            // Main asset request handler
                            //
                            // Here we process pages assets only, since they are not handled natively by apifyjs.
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

                        page.on('requestfailed', async function onDocumentDownload(pwRequest) {

                            //
                            // Here we process navigation downloads
                            // pdf, zip, docx, etc. documents
                            //

                            // Catch download navigation (pdf, zip, docx, etc.) occuring on first try before puppeteer throws an net::ERR_ABORTED error
                            if (pwRequest.isNavigationRequest() && pwRequest.failure().errorText === 'net::ERR_ABORTED') {

                                if (request.retryCount === 1) {
                                    const pwResponse = await pwRequest.response();
                                    if (pwResponse) {

                                        let record;
                                        const meta = {
                                            _from: 'onDocumentDownload',
                                            trials: request.retryCount,
                                            parent: request.userData.parent
                                        }

                                        try {
                                            record = await handleResponse(pwRequest, pwResponse, meta)
                                        } catch (error) {
                                            console.error(inspect(error))
                                        }

                                        await addRecord(record);

                                        self.session.counts.success++
                                    }
                                }

                                request.userData._ignore = true
                                pwRequest.userData._ignore = true

                                return Promise.resolve()

                            }
                        })

                        page.on('requestfailed', async function onDocumentRequestFailed(pwRequest) {

                            //
                            // Main document request failed handler is located at page.goto().catch()
                            //

                            if (pwRequest.isNavigationRequest()) {

                                if (pwRequest.failure() && pwRequest.failure().errorText.indexOf('net::ERR_BLOCKED_BY_CLIENT') > -1) {
                                    return;
                                }

                                if (request.retryCount < self.config.maxRequestRetries) {
                                    return;
                                }

                                if (pwRequest.failure() && pwRequest.failure().errorText === 'net::ERR_ABORTED') {

                                    //
                                    // This is a navigation request error
                                    // Has been handled at 'onDocumentDownload'
                                    //

                                    return;
                                }

                                // Retry count maxed out.

                            }
                        })

                        page.on('requestfailed', async function onAssetRequestFailed(pwRequest) {

                            //
                            // Main asset failed request handler
                            // Since they are not handled natively by apifyjs.
                            // Page requests are processesd via the playwrightCrawler handlePageFunction
                            //

                            if (pwRequest.isNavigationRequest()) {
                                return;
                            }

                            if (pwRequest.failure() && pwRequest.failure().errorText.indexOf('net::ERR_BLOCKED_BY_CLIENT') > -1) {
                                return;
                            }

                            //
                            // Request failed start
                            //

                            const url = pwRequest.url();

                            console.verbose(`${pwRequest.isNavigationRequest() ? `[${request.retryCount}]` : ''} ${pwRequest.isNavigationRequest() ? 'IS' : 'IS NOT'} NAV, ${pwRequest.failure() ? `${pwRequest.failure().errorText} ` : ` `}at ${displayUrl(request.userData.parent)} -> ${displayUrl(url)}`)

                            if (!self.homeBasePUrl.matches(page.url())) {
                                console.verbose(`Ignoring request error on external page asset. ${displayUrl(page.url())} -> ${displayUrl(url)}`);

                                return Promise.resolve();
                            } else {
                                if (['document', 'other'].includes(pwRequest.resourceType)) {
                                    console.warn(`This should be a page asset of the crawled website: ${displayUrl(pwRequest.url())}, resource type: ${pwRequest.resourceType()}`)
                                }
                            }

                            //
                            // Asset request failed start
                            //

                            if (!self.config.navigationOnly) {

                                if (pwRequest.failure() && pwRequest.failure().errorText === 'net::ERR_ABORTED') {
                                    console.verbose(`Silently ignoring failed 'net::ERR_ABORTED' request for ${displayUrl(url)}`)
                                    return Promise.resolve();
                                }

                                if (request.retryCount <= self.config.maxRequestRetries) {
                                    return Promise.reject();
                                }

                                if (pwRequest.failure()) {

                                    if (!pwRequest.userData.reports) {
                                        pwRequest.userData.reports = []
                                    }

                                    pwRequest.userData.reports.push(pwRequest.failure().errorText)

                                }

                                const record = await handleFailedRequest(request, pwRequest, {
                                    _from: 'onAssetRequestFailed'
                                });

                                await addRecord(record);

                                self.session.counts.fail++
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
                                !self.isExternLink(pwResponse.request().url()) &&

                                // Is this asset on a page that is in the domain's website?
                                self.homeBasePUrl.matches(page.url())
                            ) {

                                //
                                // This is an asset
                                //

                                const statusCode = pwResponse.status()

                                if (statusCode >= 300 && statusCode < 400) {
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

                                    meta.timing = await getTimingFor(firstResponseUrl, page);

                                    if (self.config.getPerfData) {
                                        meta.perfData = await getPerformanceData(firstResponseUrl, page)
                                    }

                                    try {

                                        const record = await handleResponse(pwResponse.request(), pwResponse, meta)

                                        await addRecord(record);

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

                        page.on('response', async function onNavigationResponse(pwResponse) {

                            //
                            // Here we process some navigation responses only.
                            // The main navigation responses handler is in the playwrightCrawler handlePageFunction
                            //

                            // Is this an navigation request?
                            if (pwResponse.request().isNavigationRequest()) {

                                //
                                // This is a navigation response
                                //

                                if (pwResponse.status() === 0) {

                                    // This is a Network error.
                                    // Will be handled in onNavigationRequest handler

                                    return;
                                }

                                // if (!pwResponse.ok() && request.retryCount >= self.config.maxRequestRetries) {

                                //     const statusCode = pwResponse.status()

                                //     console.debug(`[${request.retryCount}] got a status = ${statusCode} for ${pwResponse.request().url()}`)
                                //     if (statusCode >= 300 && statusCode < 400) {

                                //         if (isNull(request.userData.redirectChain)) {
                                //             request.userData.redirectChain = []
                                //         }

                                //         request.userData.redirectChain.push({
                                //             url: pwResponse.url(),
                                //             status: statusCode,
                                //             statusText: pwResponse.statusText(),
                                //             fromServiceWorker: pwResponse.fromServiceWorker()
                                //         })
                                //     }

                                //     if (statusCode >= 400) {

                                //         const httpError = new HttpError(statusCode, pwResponse.statusText())

                                //         if (!request.userData.reports) {
                                //             request.userData.reports = []
                                //         }

                                //         request.userData.reports.push(httpError);
                                //     }

                                // }
                            }

                        })

                        page
                            .goto(request.url, {
                                waitUntil: self.config.pageWaitUntil
                            })
                            .then(response => {
                                resolve(response);
                            })
                            .catch(async function onDocumentRequestFailed(error) {

                                if (request.userData._ignore || error.message.indexOf('net::ERR_ABORTED') > -1) {

                                    // This is handled at onDocumentDownload (pdf downloads)
                                    return resolve()
                                }

                                if (request.userData.trials >= self.config.maxRequestRetries) {

                                    //
                                    // Main document failed request handler
                                    // Here we deal with network / browser errors
                                    //

                                    console.todo(`Request failed at page.goto().catch() after try [${request.retryCount}] ${request.url}. Error: ${inspect(error)}
Request: ${inspect(request)}`)

                                    if (!request.userData.reports) {
                                        request.userData.reports = []
                                    }
                                    request.userData.reports.push(error)

                                    const meta = {
                                        _from: 'page.goto().catch()'
                                    }

                                    const record = await handleFailedRequest(request, meta)

                                    await addRecord(record);

                                    self.session.counts.fail++
                                }

                                resolve()
                            });
                        // })
                    }).catch(async error => {

                        if (request.retryCount >= self.config.maxRequestRetries) {

                            console.todo(`Unhandled error at gotoFunction at try [${request.retryCount}]. Error: ${inspect(error)}, request: ${inspect(request)}`)

                            // Function captureError handles chromium net errors, so we don't log thoses
                            if (!(error.errorText && error.errorText.indexOf('net::') > 0)) {
                                console.todo(`Unhandled error at gotoFunction after max request retries at ${request.url}. Error: ${inspect(error)}, request: ${inspect(request)}`)
                            }

                            if (!request.userData.reports) {
                                request.userData.reports = []
                            }
                            request.userData.reports.push(error)
                        }
                    })
                },
                handlePageTimeoutSecs: self.config.handlePageTimeout,
                launchContext: self.launchContextOptions,
                // handlePageTimeoutSecs: 60,
                // browserPoolOptions: {},
                requestQueue: requestQueue,
                maxRequestRetries: self.config.maxRequestRetries,
                maxRequestsPerCrawl: self.config.maxRequests,
                autoscaledPoolOptions: self.autoscaledPoolOptions,
                useSessionPool: true,
            });

            playwrightCrawler.pause = async function pause(timeout) {
                return playwrightCrawler.autoscaledPool.pause(timeout);
            }

            playwrightCrawler.resume = async function resume() {
                return playwrightCrawler.autoscaledPool.resume();
            }

            self.crawlers.push(playwrightCrawler)

            async function launchBasicCrawler() {
                return new Promise((resolve, reject) => {
                    basicCrawler
                        .run()
                        .then(() => {
                            console.info('Basic crawler is done.')
                            resolve();
                        })
                        .catch(error => {
                            console.error('Basic crawler ended with error.')
                            reject(error)
                        })

                })
                    .catch(error => {
                        console.error(inspect(error))
                    })
            }

            await Promise.all([
                playwrightCrawler
                    .run()
                    .then(() => {
                        console.info('Puppeteer crawler is done.')
                        return Promise.resolve();
                    })
                    .catch(error => {
                        console.error(`Puppeteer crawler ended with error: ${inspect(error)}`)
                    }),
                launchBasicCrawler()
            ])
                .catch(error => {
                    console.error(inspect(error))
                });

            console.log(`counts: `, self.session.counts);


        }
    }
};