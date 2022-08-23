import { URL } from 'url'
import EventEmitter from 'events'

import minimatch from 'minimatch'
import * as URI from 'uri-js'
import { pick, isRegExp, isFunction, isObject } from 'underscore'
import rp from 'request-promise-native'
import Apify, { BasicCrawler, PuppeteerCrawler, utils as apifyUtils } from 'apify'
import { launchPuppeteer } from 'apify/build/puppeteer'
import { computeUniqueKey } from 'apify/build/request'
import v from 'io-validate'
import assert from 'assert-plus'

import { getResponseData } from '../net/utils'
import { normalizeUrl, isValidUrl, getRandomUserAgent } from '../../../core'
import { cleanupFolderPromise } from './cleanup-folder-promise'
import { CorveeError, HttpError, PupResponseIsUndefinedError, PupResponseIsNullError, MailUnverifiedAddressError, UnsupportedSchemeError, MailInvalidSyntaxError, UrlInvalidUrlError } from '../errors'
import { humanDuration, displayUrl } from '../utils'
import { LinkStore, sessionStore } from '../storage'
import { Link } from '../link'
import { handleResponse, handleFailedRequest } from '../record'
import { RequestQueue } from '../request-queue'
import { PseudoUrls } from '../pseudoUrls'
import { console, inspect } from '../../../core'
import Notifier from '../utils/notifier'

import { defaultHarvesterOptions, defaultLaunchPuppeteerOptions, defaultPuppeteerPoolOptions, defaultAutoscaledPoolOptions, defaultLinkParser, BrowsingContextStore } from '.'
import { setRedirectChain, getPerformanceData, getTimingFor } from '.'

const extend = require('extend')
const pkg = require('../../package.json')

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

const UNHANDLED_ERROR = 'CV::UNHANDLED_ERROR';

const linkProps = new Set();

const defaultOptions = extend(true, {}, defaultHarvesterOptions, defaultLaunchPuppeteerOptions, defaultPuppeteerPoolOptions)

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

        super();

        this.version = pkg.version;
        this.isPaused = null;
        this._isRunning = false
        this._pausedAt = 0;

        this.config = Object.assign({}, defaultOptions, config);

        console.log(`Setting log level to ${this.config.logLevel}`)
        console.setLevel(this.config.logLevel)
        console.verbose('### THIS IS VERBOSE ###')

        if (!process.env.APIFY_LOCAL_STORAGE_DIR) {
            process.env.APIFY_LOCAL_STORAGE_DIR = this.config.storageDir;
        }

        this.linkParser = defaultLinkParser;

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

        this.launchPuppeteerOptions = extend(true, {}, pick(this.config, ['proxyUrl', 'stealth', 'userAgent', 'useChrome', 'args', 'headless', 'userDataDir', 'defaultViewport']))

        console.verbose(`this.launchPuppeteerOptions: ${inspect(this.launchPuppeteerOptions)}`)

        // if (this.config.proxy) {
        //     if (typeof this.launchPuppeteerOptions.args === 'undefined') {
        //         this.launchPuppeteerOptions.args = []
        //     }

        //     const proxyUrl = typeof this.config.proxy === 'object' ? (new URL(this.config.proxy)).href : this.config.proxy;

        //     this.launchPuppeteerOptions.args.push(`--proxy-server=${proxyUrl}`);

        // }

        this.autoscaledPoolOptions = {
            ...defaultAutoscaledPoolOptions,
            isTaskReadyFunction: function isTaskReady() {
                return true;
            },
            runTaskReadyFunction: function runTaskReady() {
                return true;
            }
        }

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
                    await this._addToRequestQueue(...urls.map(url => new Link(url)))
                    resolve()
                } else {
                    let addToRequestQueueHandle;
                    setInterval(async () => {
                        if (this._addToRequestQueue) {
                            await this._addToRequestQueue(...urls.map(url => new Link(url)))
                            clearInterval(addToRequestQueueHandle)
                            resolve()
                        }
                    }, 100)
                }
            } else {
                this.urlList.push(...urls.map(url => new Link(url)))
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

        this.browsingContextStore = new BrowsingContextStore();

        this.queue = new RequestQueue({
            concurrency: this.config.maxConcurrency,
            interval: this.config.waitInterval,
            intervalCap: 1
        });

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

            const puppeteerRequestQueue = await Apify.openRequestQueue('puppeteer');

            setInterval(async function () {
                const info = await puppeteerRequestQueue.getInfo();
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
                const info = await puppeteerRequestQueue.getInfo();
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

                                    puppeteerCrawler.basicCrawler.handledRequestsCount++;
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

                                            puppeteerCrawler.basicCrawler.handledRequestsCount++;
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

                const queue = which === 'basic' ? basicRequestQueue : puppeteerRequestQueue;

                const addRequestPromises = [];

                linkDataset.forEach(async data => {

                    assert.object(data)

                    const link = data.constructor.name === 'Link' ? data : new Link(data)
                    let uriObj;

                    assert.string(link.url)
                    assert.object(link.userData)

                    if (self.config.urlNormalizeFunction) {
                        try {
                            link.url = self.config.urlNormalizeFunction(link.url)
                        } catch (error) {
                            console.error(`config.urlNormalizeFunction error at link.url: ${link.url}. Error: ${inspect(error)}`)
                        }

                        if (link.userData.parent) {
                            try {
                                link.userData.parent = self.config.urlNormalizeFunction(link.userData.parent)
                            } catch (error) {
                                console.error(`config.urlNormalizeFunction error at link.userData.parent: ${link.userData.parent}. Error: ${inspect(error)}`)
                            }
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
                    const pageUrl = link.userData.parent;

                    if (!uniqueLinksPerPage.has(pageUrl)) {
                        uniqueLinksPerPage.set(pageUrl, new Set())
                    }

                    if (uniqueLinksPerPage.get(pageUrl).has(link.url)) {
                        return;
                    }

                    uniqueLinksPerPage.get(pageUrl).add(link.url);

                    if (!self.config.schemes.some(scheme => minimatch(uriObj.scheme, scheme))) {
                        console.warn(`Unsupported scheme: '${uriObj.scheme}' ${link.url ? `at uri ${link.url}` : ''}`)

                        return;
                    }

                    const trials = link.userData.trials || 1;
                    const extern = self.isExternLink(link.url)

                    const requestData = extend(true, {}, link, {
                        retryCount: trials,
                        extern
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
                        console.debug(`Ignoring this url based on config.ignore rule \`${ignoreRule}\`: ${requestData.userData.parent} -> ${requestData.url}`);
                        return;
                    }

                    // This should not occur
                    if (self.isExternLink(requestData.userData.parent)) {
                        console.todo(`Intercepted an URL hosted on an external page that was submitted to fetch queue: ${requestData.userData.parent} -> ${requestData.url}.`)
                        return;
                    }

                    self.session.counts.activeRequests++

                    self.emit('add-link', link);

                    if (uriObj.scheme === 'http' || uriObj.scheme === 'https') {

                        // Check if URL has a valid syntax
                        if (!isValidUrl(link.url)) {

                            console.warn(`Bad URL: ${link.userData.urlData}`)

                            const urlError = new UrlInvalidUrlError(link.userData.urlData)

                            link.userData.reports.push(urlError);

                            const record = handleFailedRequest(link, {
                                _from: 'gotoFunction'
                            })

                            await addRecord(record);

                            self.session.counts.fail++

                            puppeteerCrawler.basicCrawler.handledRequestsCount++;

                            return
                        }
                    }

                    if (uriObj.scheme === 'mailto') {

                        if (uriObj.error) {
                            link.userData.reports.push(new MailInvalidSyntaxError())
                            self.session.counts.fail++
                        } else {
                            link.userData.reports.push(new MailUnverifiedAddressError())
                            self.session.counts.success++
                        }

                        const record = handleResponse(link)

                        await addRecord(record);

                        puppeteerCrawler.basicCrawler.handledRequestsCount++;

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

                await addToRequestQueue('pup', new Link(self.config.startUrl, {
                    parent: 'corvee:startpage',
                    isNavigationRequest: true
                }))
            }

            await addToRequestQueue('pup', self.urlList)

            await addToRequestQueue('basic', new Link('corvee:dummy-url', {
                parent: 'corvee:startpage'
            }))

            async function addRecord(record) {

                return new Promise(async (resolve, reject) => {

                    if (self.isMaxRequestExceeded()) {
                        console.info('Maximum requests reached.')
                        return reject('Maximum requests reached.');
                    }

                    self.session.recordCount++;
                    self.session.counts.activeRequests--
                    self.session.counts.finishedRequests++

                    record.id = self.session.recordCount;
                    record.extern = self.isExternLink(record.url); // ??? parfois la propriété est absente

                    const browsingContextStack = self.browsingContextStore.getContext(record.parent)
                    if (browsingContextStack) {
                        record.browsingContextStack = browsingContextStack
                    }

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

                const parent = normalizeUrl(page.url());

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

                links
                    .map(link => {
                        // type validation
                        v(link).has('url').isString().not.isEmpty()
                        return link;
                    })
                    // .map(link => (Object.assign(link, {
                    //     url: normalizeUrl(link.url),
                    //     parent,
                    //     isNavigationRequest: true
                    // })))
                    .map(({ url, ...urlData }) => {
                        return new Link(url, { ...urlData, parent, isNavigationRequest: true })
                    })
                    .filter(link => {

                        if (self.shouldIgnoreUrl(link.url)) {
                            return false;
                        }

                        if (self.config.checkExtern) {
                            return true;
                        }

                        // else, return only internal links

                        return !self.isExternLink(link.url);
                    })
                    .filter(link => link.url !== parent) // exclude internal links (href="#some-anchor")
                    .forEach(link => {

                        // const req = {
                        //     url: link.url,
                        //     uniqueKey: link.url,
                        //     userData: Object.assign(link, {
                        //         _from: 'parseLinksInPage',
                        //         parent,
                        //         extern: self.isExternLink(link.url),
                        //         reports: [],
                        //         level: nextLevel
                        //     })
                        // };

                        // ret.push(req);

                        ret.push({
                            url: link.url,
                            uniqueKey: link.url,
                            userData: {
                                ...link.userData,
                                _from: 'parseLinksInPage',
                                extern: self.isExternLink(link.url),
                                level: nextLevel
                            }
                        })
                    });

                return ret;
            }

            const basicCrawler = new BasicCrawler({
                requestQueue: basicRequestQueue,
                autoscaledPoolOptions: {
                    ...self.autoscaledPoolOptions,
                    loggingIntervalSecs: Infinity,
                    isFinishedFunction: async function isFinished() {
                        const puppeteerRequestQueueIsFinished = await puppeteerRequestQueue.isFinished();
                        const basicRequestQueueIsFinished = await basicRequestQueue.isFinished();

                        if (self.isMaxRequestExceeded()) {
                            return true;
                        }

                        if (!puppeteerRequestQueueIsFinished) {
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
                                    const record = handleResponse(request, response, {
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
                                    const record = handleResponse(request, response);
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
                handlePageTimeoutSecs: self.config.PageTimeout
            });

            basicCrawler.pause = function pause(timeout) {
                return basicCrawler.autoscaledPool.pause(timeout);
            }

            basicCrawler.resume = function resume() {
                return basicCrawler.autoscaledPool.resume();
            }

            self.crawlers.push(basicCrawler)

            //
            // Puppeteer crawler
            //

            const puppeteerCrawler = new PuppeteerCrawler({
                gotoFunction: async function gotoFunction({
                    request,
                    page
                }) {

                    return new Promise(async (resolve, reject) => {

                        self.queue.add(async () => {

                            if (request.userData._ignore) {
                                return reject()
                            }

                            request.userData.trials = request.retryCount;

                            self.emit('request', request)
                            console.todo(inspect(request))

                            // // Stop processing if filtering settings meet
                            // const ignoreRule = self.shouldIgnoreUrl(request.url)
                            // if (ignoreRule) {
                            //     console.debug(`Ignoring this url based on config.ignore rule \`${ignoreRule}\`: [${request.url}] -> ${url}`);

                            //     return reject()
                            // }

                            if (self.config.useRandomUserAgent) {
                                page.setUserAgent(getRandomUserAgent());
                            } else {
                                page.setUserAgent(self.config.userAgent)
                            }

                            page.setDefaultNavigationTimeout(self.config.requestTimeout)

                            page.setRequestInterception(true);

                            // don't request assets if this is an external page
                            if (self.isExternLink(request.url)) {
                                apifyUtils.puppeteer.blockRequests(page, {
                                    urlPatterns: self.config.blockRequestsFromUrlPatterns
                                })
                            }

                            await page._client.send('Network.enable', {
                                maxResourceBufferSize: 1024 * 1204 * 100,
                                maxTotalBufferSize: 1024 * 1204 * 400,
                            })

                            page.on('error', function onError(error) {

                                if (request.retryCount >= self.config.maxRequestRetries) {

                                    console.todo(`Page error at [try: ${request.retryCount}] ${request.url}. Error: ${inspect(error)} Request: ${inspect(request)}`)

                                    request.userData.reports.push(error);

                                    console.error(`[page.on('error')] Page crashed., Error: ${inspect(error)}`)
                                }

                                return reject(error)
                            })

                            page.on('dialog', async function onDialog(dialog) {
                                await dialog.dismiss();
                            });


                            // function getRequestData(req) {
                            //     if (req.isNavigationRequest()) {
                            //         req.userData.request = req.userData.request || [];
                            //         req.userData.request.push(((props) => {
                            //             return props.reduce((obj, prop) => {
                            //                 obj[prop] = req[prop]();
                            //                 return obj;
                            //             }, {})
                            //         })(['url', 'headers', 'isNavigationRequest', 'resourceType', 'redirectChain']));
                            //     }
                            // }

                            // page.on('requestfinished', getRequestData);
                            // page.on('requestfailed', getRequestData);

                            await apifyUtils.puppeteer.addInterceptRequestHandler(page, function onRequest(pupRequest) {

                                //
                                // Initialization of userData
                                //

                                // TODO: remove this test when it is stated that it will never be true
                                if ('userData' in pupRequest) {
                                    console.error('pupRequest already have a .userData property. Check why.')
                                    process.exit(1);
                                }

                                if (!pupRequest.isNavigationRequest() && self.config.navigationOnly) {
                                    // Don't initialize userData if this is an asset request AND settings say we are interrested only on navigation requests
                                    return pupRequest.continue()
                                }

                                if (!pupRequest.isNavigationRequest() && self.isExternLink(pupRequest.url())) {
                                    // Don't initialize userData if this is an asset request on an external page
                                    return pupRequest.continue()
                                }

                                const url = pupRequest.url();
                                const parent = page.url();

                                pupRequest.userData = Object.assign({ trials: 1 }, request.userData,
                                    {
                                        _from: 'onRequest',
                                        url,
                                        parent,
                                        reports: [],
                                    })

                                pupRequest.continue()
                            })

                            await apifyUtils.puppeteer.addInterceptRequestHandler(page, function onDocumentRequest(pupRequest) {
                                if (pupRequest.isNavigationRequest()) {

                                    // Don't request if extern setting meets
                                    if (!self.config.checkExtern && self.isExternLink(url)) {

                                        console.verbose(`Skipping external request ${displayUrl(parentUrl)} -> ${displayUrl(url)} from settings.`);

                                        return pupRequest.abort('blockedbyclient')
                                    }
                                }

                                pupRequest.continue()
                            })

                            await apifyUtils.puppeteer.addInterceptRequestHandler(page, function onAssetRequest(pupRequest) {

                                //
                                // Main asset request handler
                                //
                                // Here we process pages assets only, since they are not handled natively by apifyjs.
                                // Page requests are processesd via the puppeteerCrawler handlePageFunction
                                //

                                if (!pupRequest.isNavigationRequest() && !self.config.navigationOnly) {

                                    console.todo(`Request URL: ${inspect(pupRequest.url())}`)

                                    const url = pupRequest.url();
                                    const parentUrl = page.url();

                                    pupRequest.userData._from = 'onAssetRequest'

                                    // don't request assets if this is an external page 
                                    // this may be unnecessary since we use puppeteer.blockRequests()
                                    if (self.config.checkExtern && self.isExternLink(parentUrl)) {

                                        console.verbose(`Skipping loading assets for an external resource: ${displayUrl(parentUrl)} -> ${displayUrl(url)}`);

                                        return pupRequest.abort('blockedbyclient')
                                    }

                                    // Stop processing if filtering settings meet
                                    const ignoreRule = self.shouldIgnoreUrl(request.url)
                                    if (ignoreRule) {

                                        console.debug(`Ignoring this url based on config.ignore rule \`${ignoreRule}\`: ${request.url} -> ${url}`);

                                        const error = new CorveeError(msg, 'cv-skip-ignore')
                                        pupRequest.userData.reports.push(error)

                                        return pupRequest.abort('blockedbyclient')
                                    }
                                }

                                pupRequest.continue();
                            })

                            page.on('requestfailed', async function onDocumentDownload(pupRequest) {

                                if (request.userData._ignore) {
                                    return Promise.resolve()
                                }

                                //
                                // Here we process navigation downloads
                                // pdf, zip, docx, etc. documents
                                //

                                // Catch download navigation (pdf, zip, docx, etc.) occuring on first try before puppeteer throws an net::ERR_ABORTED error
                                if (pupRequest.isNavigationRequest() && pupRequest.failure().errorText === 'net::ERR_ABORTED') {

                                    const pupResponse = pupRequest.response();
                                    if (pupResponse) {

                                        let record;
                                        const meta = {
                                            _from: 'onDocumentDownload',
                                            resourceType: 'document',
                                            trials: request.retryCount,
                                            parent: request.userData.parent
                                        }

                                        try {
                                            record = handleResponse(pupRequest, pupResponse, meta)
                                            setRedirectChain(record, pupRequest.redirectChain())

                                        } catch (error) {
                                            console.error(inspect(error))
                                        }

                                        await addRecord(record);

                                        self.session.counts.success++

                                        request.userData._ignore = true

                                        return Promise.resolve()
                                    }

                                }
                            })

                            page.on('requestfailed', async function onDocumentRequestFailed(pupRequest) {

                                //
                                // Main document request failed handler is located at page.goto().catch()
                                //

                                if (pupRequest.failure() && pupRequest.failure().errorText.indexOf('net::ERR_BLOCKED_BY_CLIENT') > -1) {
                                    return;
                                }

                                if (pupRequest.isNavigationRequest()) {

                                    if (pupRequest.failure() && pupRequest.failure().errorText === 'net::ERR_ABORTED') {

                                        //
                                        // This is a navigation request error
                                        // Has been handled at 'onDocumentDownload'
                                        //

                                        return;
                                    }

                                    if (request.retryCount < self.config.maxRequestRetries) {
                                        return;
                                    }

                                    // This is not a navigation download
                                    // Retry count maxed out.

                                    if (pupRequest.failure() && !pupRequest.failure().errorText.startsWith('net::')) {
                                        // Chromium net errors are handled by the function captureError
                                        console.todo(`This request failure has not been handled at try [${request.retryCount}]. ${displayUrl(url)}, request: ${inspect(request)}. Failure: ${inspect(pupRequest.failure())}`)
                                    }

                                    // console.todo(`request: ${inspect(request)}
                                    // pupRequest: ${inspect(pupRequest)}`)
                                    // request.userData.reports.push(pupRequest.failure().errorText);
                                }
                            })

                            page.on('requestfailed', async function onAssetRequestFailed(pupRequest) {

                                //
                                // Main asset failed request handler
                                // Since they are not handled natively by apifyjs.
                                // Page requests are processesd via the puppeteerCrawler handlePageFunction
                                //

                                if (pupRequest.failure().errorText.indexOf('net::ERR_BLOCKED_BY_CLIENT') > -1) {
                                    return;
                                }

                                if (pupRequest.isNavigationRequest()) {
                                    return;
                                }

                                //
                                // Request failed start
                                //

                                const url = pupRequest.url();

                                console.verbose(`${pupRequest.isNavigationRequest() ? `[${request.retryCount}]` : ''} ${pupRequest.isNavigationRequest() ? 'IS' : 'IS NOT'} NAV, ${pupRequest.failure().errorText} at ${displayUrl(request.userData.parent)} -> ${displayUrl(url)}`)

                                if (!self.homeBasePUrl.matches(page.url())) {
                                    console.verbose(`Ignoring request error on external page asset. ${displayUrl(page.url())} -> ${displayUrl(url)}`);

                                    return Promise.resolve();
                                } else {
                                    if (['document', 'other'].includes(pupRequest.resourceType)) {
                                        console.warn(`This should be a page asset of the crawled website: ${displayUrl(pupRequest.url())}, resource type: ${pupRequest.resourceType()}`)
                                    }
                                }

                                //
                                // Asset request failed start
                                //

                                if (!self.config.navigationOnly) {

                                    if (pupRequest.failure().errorText === 'net::ERR_ABORTED') {
                                        console.verbose(`Silently ignoring failed 'net::ERR_ABORTED' request for ${displayUrl(url)}`)
                                        return Promise.resolve();
                                    }

                                    if (request.retryCount <= self.config.maxRequestRetries) {
                                        return Promise.reject();
                                    }

                                    pupRequest.userData.reports.push(pupRequest.failure().errorText)

                                    const record = handleFailedRequest(request, pupRequest, {
                                        _from: 'onAssetRequestFailed'
                                    });

                                    await addRecord(record);

                                    self.session.counts.fail++
                                }
                            })

                            page.on('response', async function onAssetResponse(pupResponse) {

                                //
                                // Main asset responses handler
                                //
                                // HANDLE ONLY NON DOCUMENT RESOURCES HERE
                                //

                                // Is this an asset request? and Do config allow to record assets?
                                if (!pupResponse.request().isNavigationRequest() && !self.config.navigationOnly) {

                                    const parentUrl = page.url();

                                    const meta = {
                                        _from: 'onAssetResponse',
                                    }

                                    //
                                    // This is an asset
                                    //

                                    // Is this asset on a page that is in the domain's website?
                                    if (self.homeBasePUrl.matches(parentUrl)) {

                                        try {
                                            meta.size = (await pupResponse.buffer()).length;
                                        } catch (error) {
                                            // pupResponse.buffer() is undefined
                                            meta.size = null
                                        }

                                        meta.timing = await getTimingFor(pupResponse.url(), page);
                                        meta.perfResponse = await getPerformanceData(page, pupResponse.url())

                                        // Is the asset loaded?
                                        if (pupResponse.ok()) {

                                            try {

                                                setRedirectChain(meta, pupResponse.request().redirectChain())

                                                const record = handleResponse(pupResponse.request(), pupResponse, meta)

                                                await addRecord(record);

                                                self.session.counts.success++

                                                return
                                            } catch (error) {
                                                console.error(inspect(error))
                                            }
                                        }

                                        // Log other http status
                                        if (pupResponse.status()) {
                                            const record = handleResponse(pupResponse.request(), pupResponse, meta)

                                            await addRecord(record);

                                            self.session.counts.success++

                                            return;
                                        }

                                        self.session.counts.fail++
                                        self.session.counts.activeRequests--
                                        self.session.counts.finishedRequests++

                                        console.error('This response is not handled:', pupResponse.url())
                                        console.error('Request url:', pupResponse.request().url())
                                        console.error('Parent:', request.url)
                                        console.error(pupResponse.headers())
                                        process.exit()

                                    }
                                }

                            })

                            page.on('response', async function onNavigationResponse(pupResponse) {

                                //
                                // Here we process some navigation responses only.
                                // The main navigation responses handler is in the puppeteerCrawler handlePageFunction
                                //

                                // Is this an navigation request?
                                if (pupResponse.request().isNavigationRequest()) {

                                    //
                                    // This is a navigation response
                                    //

                                    if (pupResponse.status() === 0) {

                                        // This is a Network error.
                                        // Will be handled in onNavigationRequest handler

                                        return;
                                    }

                                    function setResponseChain(pupResponse) {
                                        if (pupResponse.status() < 300) {
                                            return
                                        }

                                        pupResponse.request().userData.responseChain = pupResponse.request().userData.responseChain || [];

                                        const redirect = ((props) => {
                                            return props.reduce((obj, prop) => {
                                                try {
                                                    obj[prop] = pupResponse[prop]();
                                                    return obj;
                                                } catch (error) {
                                                    console.error(inspect(error))
                                                }
                                            }, {})
                                        })(['url', 'status', 'statusText', 'headers', 'fromCache', 'fromServiceWorker']);

                                        redirect.resourceType = pupResponse.request().resourceType();

                                        pupResponse.request().userData.responseChain.push(redirect);
                                    }

                                    setResponseChain(pupResponse);

                                    if (!pupResponse.ok()) {
                                        const statusCode = pupResponse.status()

                                        console.verbose(`[${request.retryCount}] got a status = ${statusCode} for ${pupResponse.request().url()}`)

                                        if (statusCode >= 400) {

                                            const httpError = new HttpError(statusCode, pupResponse.statusText())

                                            pupResponse.request().userData.reports.push(httpError);
                                        }

                                    }
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
                                    console.todo(request)

                                    if (request.userData._ignore || error.message.indexOf('net::ERR_ABORTED') > -1) {
                                        // This is handled at onDocumentDownload (pdf downloads)
                                        return resolve()
                                    }

                                    //
                                    // Main document failed request handler
                                    //

                                    if (request.retryCount < self.config.maxRequestRetries) {
                                        console.todo(`THIS SHOULD NOT APPEND: request.retryCount < self.config.maxRequestRetries at ${request.url}`)
                                        // Try again
                                        await addToRequestQueue('pup', new Link(request))

                                        return resolve()
                                    }

                                    //
                                    // Here we deal with network / browser errors
                                    //

                                    console.todo(`Request failed at page.goto().catch() after try [${request.retryCount}] ${request.url}. Error: ${inspect(error)}
Request: ${inspect(request)}`)

                                    request.userData.reports.push(error)

                                    const meta = {
                                        _from: 'page.goto().catch()'
                                    }

                                    const record = handleFailedRequest(request, meta)

                                    await addRecord(record);

                                    self.session.counts.fail++

                                    resolve()
                                });
                        })
                    }).catch(async error => {

                        if (request.retryCount >= self.config.maxRequestRetries) {

                            console.todo(`Unhandled error at gotoFunction at try [${request.retryCount}]. Error: ${inspect(error)}, request: ${inspect(request)}`)

                            // Function captureError handles chromium net errors, so we don't log thoses
                            if (!(error.errorText && error.errorText.indexOf('net::') > 0)) {
                                console.todo(`Unhandled error at gotoFunction after max request retries at ${request.url}. Error: ${inspect(error)}, request: ${inspect(request)}`)
                            }

                            request.userData.reports.push(error)
                        }
                    })
                },
                autoscaledPoolOptions: self.autoscaledPoolOptions,
                launchPuppeteerOptions: self.launchPuppeteerOptions,
                puppeteerPoolOptions: {
                    recycleDiskCache: self.config.useCache,
                    puppeteerOperationTimeoutSecs: self.config.puppeteerOperationTimeoutSecs
                },
                launchPuppeteerFunction: (launchPuppeteerOptions) => {
                    console.info(`launchPuppeteerOptions: ${inspect(launchPuppeteerOptions)}`)
                    return launchPuppeteer(launchPuppeteerOptions)
                },
                maxRequestRetries: self.config.maxRequestRetries,
                requestQueue: puppeteerRequestQueue,
                handlePageTimeoutSecs: self.config.pageTimeout / 1000,
                handlePageFunction: async function onNavigationResponse({
                    request,
                    response: pupResponse,
                    page
                }) {
                    console.debug(`[${request.retryCount}] Request URL: ${inspect(request.url)}
request: ${inspect(request)}
response: ${inspect(pupResponse)}`)

                    if (request.userData._ignore) {
                        return Promise.resolve()
                    }

                    //
                    // Main navigation responses handler
                    // Here we process navigation responses. Some handling is also done on a `onNavigationResponse` handler registered on page.on()
                    //

                    if (!pupResponse) {

                        if (request.retryCount >= self.config.maxRequestRetries) {

                            console.todo(`Response is ${pupResponse} at trial ${request.retryCount}, ${request.url}. Request: ${inspect(request)}`)

                            // TODO: This is a temporary fix
                            // request.userData should have a .reports[] property
                            if (typeof request.userData.reports === 'undefined') {
                                console.todo('request.userData should have a .reports[] property')
                                request.userData.reports = []
                            }

                            if (pupResponse === null) {
                                request.userData.reports.push(new PupResponseIsNullError('Response is null', request.url))
                            }
                            // else {
                            //     request.userData.reports.push(new PupResponseIsUndefinedError('Response is undefined', request.url))
                            // }
                        }

                        // throw `Response is ${pupResponse}`

                        request.userData._ignore = true

                        //
                        // These cases should be all handled at page.goto().catch()
                        //
                        return Promise.reject()

                        // return
                    }

                    try {
                        request.userData.timing = await getTimingFor(pupResponse.url(), page)
                    } catch (error) {
                        request.userData.timing = null
                    }

                    let data = {};

                    try {
                        data = await getResponseData(pupResponse.request()._requestId, pupResponse)
                    } catch (error) {
                        console.todo(`url: ${request.url}, error: ${inspect(error)}`)
                    }

                    try {
                        data.timing = await getTimingFor(pupResponse.url(), page)
                    } catch (error) {
                        data.timing = null
                    }

                    self.emit('response', {
                        type: 'navigation',
                        data,
                        request: pupResponse.request(),
                        response: pupResponse
                    })

                    // try {
                    //     if (!pupResponse.ok()) {

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
                        normalizeUrl(request.url, true);

                        try {
                            await page.exposeFunction('harvester', () => {
                                return self
                            });
                        } catch (error) {
                            // Sometimes Apify throws an error 'Error: Protocol error (Runtime.addBinding): Target closed.'
                            // Ignore error
                            console.verbose(error)
                        }

                        const meta = {
                            _from: 'onNavigationResponse'
                        }

                        try {
                            meta.size = (await pupResponse.buffer()).length;
                        } catch (error) {
                            // pupResponse.buffer() is undefined
                            meta.size = null
                        }

                        if (self.plugins.onNavigationResponse.length && pupResponse) {
                            self.plugins.onNavigationResponse.forEach(async plugin => {
                                try {
                                    console.verbose(`Processing plugin ${plugin.name}`)
                                    await plugin.fn.call(self, request, pupResponse, page)
                                } catch (error) {
                                    console.error(`[onNavigationResponse] plugin ${plugin.name}, failed. Error: ${inspect(error)}`)
                                }
                            })
                        }

                        const record = handleResponse(request, pupResponse, meta)

                        await addRecord(record);

                        self.session.counts.success++

                        //
                        // Should we parse further links in the resulting page?
                        //

                        const pageFinalUrl = normalizeUrl(record.finalUrl ? record.finalUrl : record.url, true)

                        const finalNavUrl = normalizeUrl(page.url(), true);

                        if (!self.isExternLink(finalNavUrl)) {

                            const links = await parseLinksInPage(page, {
                                currentLevel: request.userData.level,
                            });

                            await addToRequestQueue('pup', links)

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
                                        })

                                        await addToRequestQueue('pup', link)
                                    }

                                }
                            } catch (error) {
                                console.error(inspect(error))
                            }

                        }
                    } catch (error) {
                        console.error(`Got an error while trying to get the record of the link ${request.url}
Error: ${inspect(error)}
Exiting now...`)
                        process.exit();
                    }
                },
                // This function is called if the page processing failed more than (maxRequestRetries + 1) times.
                handleFailedRequestFunction: async function onNavigationRequestFailed({
                    request,
                    error
                }) {

                    //
                    //
                    //

                    if (request.userData._ignore) {
                        return;
                    }

                    console.todo(`[${request.retryCount}] url: ${request.url},
typeof error: ${typeof error}
error.name: ${error.name}
error: ${inspect(error)},
Request: ${inspect(request)}`)

                    const url = normalizeUrl(request.url);

                    console.info(`[try: ${request.retryCount}] url: ${displayUrl(url)}`)

                    //
                    // This is a navigation error
                    //

                    console.verbose(`Navigation failed. Error: ${inspect(error)}, Request: ${inspect(request)}`)

                    if (typeof request.userData.reports === 'undefined') {
                        console.todo(`THIS SHOULD NOT APPEND: Request userData dont have a 'reports' property. [${request.retryCount}] url: ${request.url},
error: ${inspect(error)},
Request: ${inspect(request)}`)

                        request.userData.reports = []

                    }

                    request.userData.reports.push(error)

                    const record = handleFailedRequest(request, {
                        _from: 'onNavigationRequestFailed',
                        resourceType: 'document',
                        trials: request.retryCount,
                    })

                    await addRecord(record);

                    self.session.counts.fail++

                    return;
                },
                maxRequestsPerCrawl: self.config.maxRequests,
                maxConcurrency: self.config.maxConcurrency,
            });

            puppeteerCrawler.pause = function pause(timeout) {
                return puppeteerCrawler.basicCrawler.autoscaledPool.pause(timeout);
            }

            puppeteerCrawler.resume = function resume() {
                return puppeteerCrawler.basicCrawler.autoscaledPool.resume();
            }

            self.crawlers.push(puppeteerCrawler)

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

                    const statsLoggerHandle = setInterval(() => {
                        try {
                            basicCrawler.stats.stopLogging();
                            clearInterval(statsLoggerHandle);
                            console.verbose('Canceled basicCrawler stats logging.')
                        } catch (error) {
                            console.error(inspect(error))
                        }
                    }, 100)

                })
                    .catch(error => {
                        console.error(inspect(error))
                    })
            }

            await Promise.all([
                puppeteerCrawler
                    .run()
                    .then(() => {
                        console.info('Puppeteer crawler is done.')
                        return Promise.resolve();
                    })
                    .catch(error => {
                        console.error('Puppeteer crawler ended with error.')
                        throw error;
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