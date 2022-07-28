import { URL } from 'url';
import fs, { promises as fsPromises } from 'fs'
import EventEmitter from 'events'
import { promisify, inspect } from 'util'

import minimatch from 'minimatch'
import * as URI from 'uri-js'
import stringify from 'json-stringify-safe'

import _ from 'underscore'

import rp from 'request-promise-native'
import rimraf from 'rimraf';
import Apify, { BasicCrawler, PuppeteerCrawler, utils as apifyUtils } from 'apify';
import { launchPuppeteer } from 'apify/build/puppeteer'
import { computeUniqueKey } from 'apify/build/request'
import v from 'io-validate'
import assert from 'assert-plus'
const extend = require('extend')
import { responseData, requestData } from '../net'
import { normalizeUrl, isValidUrl, getRandomUserAgent } from '../../../core'
import { MemCache } from './cache'
import { CorveeError, HttpError } from '../errors'
import { humanDuration } from '../utils'
import { LinkStore, sessionStore } from '../storage'
import { Link } from '../link'
import { handleResponse, handleFailedRequest } from '../record'
import { RequestQueue } from '../request-queue'
import { PseudoUrls } from '../pseudoUrls'
import { console } from '../../../core';
import Notifier from '../utils/notifier'

import { defaultHarvesterOptions, defaultAutoscaledPoolOptions, defaultLinkParser, BrowsingContextStore } from '.'
import { setRedirectChain } from './redirection-pool';

console.setLevel(defaultHarvesterOptions.defaultLogLevel)

process.on('unhandledRejection', function onUnhandledRejection(reason, p) {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

const UNHANDLED_ERROR = 'CV::UNHANDLED_ERROR';

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
     * @param {boolean|number} config.notify - Notifies at `notify` interval
     * @param {function} config.plugins - TODO
     * @param {array<string>} config.schemes - What schemes to follow
     * @param {array<string|regex>} config.noFollow - TODO
     * @param {array<string|regex>} config.ignore - TODO
     * @param {array<string|regex>} internLinks
     */

    constructor(config = {}) {

        super();

        this.version = 'ALLO';
        this.isPaused = null;
        this._isRunning = false
        this._pausedAt = 0;

        this.config = Object.assign({}, defaultHarvesterOptions, config);

        this.linkParser = defaultLinkParser;

        if (this.config.notify) {
            this.notify = new Notifier([], {
                logger: console,
                logLevel: 'debug',
                delay: this.config.notify,
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
            if (key in config) {
                const arrayProp = Array.isArray(config[key]) ? config[key] : [config[key]];
                const keepDefaultsProp = `use${key.charAt(0).toUpperCase()}${key.substring(1)}Defaults`;
                if (keepDefaultsProp in this.config && this.config[keepDefaultsProp]) {
                    this.config[key] = Array.from(new Set(defaultHarvesterOptions[key].concat(arrayProp)))
                }
            }

        });

        this.homeBasePUrl = new PseudoUrls(this.config.internLinks)

        this.urlList = [];

        this.responseCache = new MemCache({
            logDir: this.config.apifyLocalStorageDir
        });

        this.launchPuppeteerOptions = extend(true, {}, _.pick(this.config, ['headless', 'useChrome', 'defaultViewport', 'stealth']), {
            userAgent: this.config.userAgent,
            userDataDir: this.config.puppeteerCacheDir
        })

        if (this.config.proxy) {
            if (typeof this.launchPuppeteerOptions.args === 'undefined') {
                this.launchPuppeteerOptions.args = []
            }

            const proxyUrl = typeof this.config.proxy === 'object' ? (new URL(this.config.proxy)).href : this.config.proxy;

            this.launchPuppeteerOptions.args.push(`--proxy-server=${proxyUrl}`);

        }

        this.autoscaledPoolOptions = {
            ...defaultAutoscaledPoolOptions,
            isTaskReadyFunction: function isTaskReady() {
                return true;
            },
            runTaskReadyFunction: function runTaskReady() {
                return true;
            }
        }
    }

    addUrl(urls) {
        v(urls, 'urls').is('string', 'array', 'object')
        if (!Array.isArray(urls)) {
            urls = [urls]
        }
        if (this._isRunning) {
            console.error('This feature is not yet implemented: addUrl after harvester has started!');
            process.exit();
        } else {
            this.urlList.push(...urls.map(url => new Link(url)))
        }
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
                if (_.isRegExp(testUrl)) {
                    return testUrl.test(url)
                }
                if (_.isFunction(testUrl)) {
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

    async pause(timeout) {
        if (this.isPaused) {
            console.info('Harvester is already paused.')
            return;
        }

        this._pausedAt = Date.now();

        console.info('Pausing harvester...')

        await Promise
            .all(this.crawlers.map(crawler => crawler.pause(timeout)))
            .catch(e => {
                console.error(e)
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

        if (!process.env.APIFY_LOCAL_STORAGE_DIR) {
            process.env.APIFY_LOCAL_STORAGE_DIR = self.config.apifyLocalStorageDir;
        }

        runOptions = Object.assign({}, defaultRunOptions, runOptions);

        self.runOptions = runOptions;

        console.info(`Running with config: ${inspect(this.config)}`);
        console.info(`Running with run options: ${inspect(runOptions)}`)

        const cleanupFolderPromises = [];

        if (!runOptions.resume) {

            console.debug(`Removing ${self.config.apifyLocalStorageDir} and ${self.config.puppeteerCacheDir} folders...`)

            const tmpDirSuffix = `${Date.now()}`;
            const tmpStorageDir = `${self.config.apifyLocalStorageDir}_${tmpDirSuffix}`;
            const tmpPuppeteerCacheDir = `${self.config.puppeteerCacheDir}_${tmpDirSuffix}`;
            const rimrafP = promisify(rimraf);

            function cleanupFolder(path, tmpPath) {
                return new Promise(async (resolve, reject) => {
                    if (fs.existsSync(path)) {
                        try {
                            await fsPromises.rename(path, tmpPath);
                        } catch (e) {
                            console.error(e)
                        }
                        rimrafP(tmpPath);
                    }

                    process.nextTick(() => {
                        fs.mkdir(path, {
                            recursive: true
                        }, (err) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve()
                        })
                    })
                })
                    .catch(e => {
                        console.error(e)
                    })
            }

            cleanupFolderPromises.push(cleanupFolder(self.config.apifyLocalStorageDir, tmpStorageDir));
            cleanupFolderPromises.push(cleanupFolder(self.config.puppeteerCacheDir, tmpPuppeteerCacheDir));

        }

        this._isRunning = true;
        this.isPaused = false;

        if (this.notify) {
            this.notify.addMessage(() => {
                const end = Date.now();
                const duration = humanDuration(end - this.session.startTime)
                return `[Execution time] ${duration}`;
            })
        }

        process.on('exit', function onExit() {
            this.notify.stop();
            const end = Date.now();
            const duration = humanDuration(end - this.session.startTime);

            this.emit('browsing-contexts', self.browsingContextStore.entries())

            this.emit('end')

            console.info(`link props: ${Array.from(linkProps.values()).join(', ')}`)

            console.info(`Total execution time: ${duration}`)

        });

        return async function run() {

            //const dedupLinks = new Set();

            function displayUrl(url) {
                if (!url) {
                    return url;
                }
                return url.startsWith('data:') ? `${url.slice(0, 60)}...` : url;
            }

            if (!runOptions.resume) {

                await Promise.all(cleanupFolderPromises)
                    .then(() => {
                        console.debug(`Done removing ${self.config.apifyLocalStorageDir} and ${self.config.puppeteerCacheDir} folders.`);
                    })
                    .catch(e => {
                        console.error(e)
                        process.exit()
                    })
            }

            self.session = await sessionStore({
                resume: runOptions.resume
            });

            self.session.startTime = Date.now();

            self.recordStore = await Apify.openDataset('records');

            if (!runOptions.resume) {
                self.session.recordCount = 0;
                self.session.counts = {
                    success: 0,
                    fail: 0
                }
            } else {
                // set the right record count
                self.session.recordCount = (await self.recordStore.getInfo()).itemCount;
                self._handledRequests = new Set();
                await self.recordStore.forEach(async (item) => {
                    self._handledRequests.add(`${item.parent}#${item.url}`)
                })
            }

            const parsedUrls = new Set();
            let activeRequestsCount = 0;
            let _activeRequestsCount = new Set();
            let finishedRequestsCount = 0;

            self.recordStore = await Apify.openDataset('records');

            self.browsingContextStore = new BrowsingContextStore();

            // self.notify.addMessage(() => {
            //     return `[browsingContextStore] size: ${self.browsingContextStore.size}`
            // })

            self.assetsLinksStore = await Apify.openDataset('assets-urls');
            // self.screenshotsStore = await Apify.openKeyValueStore('screenshots');
            const requestFailedData = await Apify.openDataset('request-failed');

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
            }, 500)

            if (self.config.fetchLinksOnce) {
                self.linkStore = new LinkStore();
                await self.linkStore.init();
            }

            self.queue = new RequestQueue({
                concurrency: self.config.maxConcurrency,
                interval: self.config.waitInterval,
                intervalCap: 1
            });

            const basicRequestQueue = await Apify.openRequestQueue('basic');

            self.notify.addMessage(async () => {
                const info = await puppeteerRequestQueue.getInfo();
                return `Request queue size: ${info.totalRequestCount} Handled: ${info.handledRequestCount}`
            })

            function isMaxPagesExceeded() {
                return self.config.maxRequests !== -1 && activeRequestsCount > self.config.maxRequests && finishedRequestsCount >= self.config.maxRequests;
            }

            const uniqueLinksPerPage = new Map();

            async function tryAddToRequestQueue(queue, requestData) {

                function tryAgain(fn, interval) {
                    return new Promise(async (res) => {
                        const handle = setInterval(async () => {
                            var done = await fn();
                            if (done) {
                                clearInterval(handle);
                                res();
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
                                record._from = 'linkStore#direct'

                                console.debug(`This link has already been fetched. Will skip fetching. Record: ${inspect(record)}`)

                                try {
                                    await addRecord(record);
                                    activeRequestsCount++;
                                    puppeteerCrawler.basicCrawler.handledRequestsCount++;
                                } catch (e) {
                                    console.error(e);
                                    process.exit();
                                }

                                return resolve();

                            }

                            if (reqInfo.wasAlreadyHandled) {

                                if (runOptions.resume) {
                                    // Resuming a previous harvest job. This link has already been treated.
                                    return resolve()
                                }

                                console.todo('This should not happpen: record wasAlreadyHandled, but is not in the linkStore')
                                console.todo(JSON.stringify(reqInfo, null, 2))
                            }

                            if (reqInfo.wasAlreadyPresent) {

                                // The URL is in the request queue, but it has not yet been processed
                                let i = 0;
                                tryAgain(async () => {
                                    i++;
                                    if (self.linkStore.has(requestData.url)) {
                                        try {
                                            const record = await self.linkStore.recordFromData(requestData.userData);
                                            record._from = `linkStore#${i}-trials`
                                            await addRecord(record);
                                            activeRequestsCount++;
                                            puppeteerCrawler.basicCrawler.handledRequestsCount++;
                                        } catch (e) {
                                            console.error(e);
                                            process.exit();
                                        }

                                        return true;
                                    }
                                    return false;
                                }, 1000)

                            }
                        }

                    } catch (e) {
                        console.error(e)
                        // process.exit();
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

                const queue = which === 'basic' ? basicRequestQueue : puppeteerRequestQueue;
                let uriObj;

                const addRequestPromises = [];

                linkDataset.forEach(async data => {

                    const link = new Link(data);
                    assert.object(data)
                    assert.string(link.url)
                    assert.object(link.userData)

                    try {
                        uriObj = URI.parse(link.url);
                    } catch (e) {
                        console.error(`Missing url property: ${stringify(data, null, 2)}`)
                        console.error(e);
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
                        console.verbose(`Unsupported scheme: ${uriObj.scheme} ${link.url ? `at uri <${link.url}>` : ''}`)
                        return;
                    }

                    const trials = link.userData.trials || 1;
                    const extern = self.isExternLink(link.url)

                    const requestData = extend(true, {}, link, {
                        retryCount: trials,
                        extern
                    })

                    // Don't process links in current page if it's url satisfies one of the options.noFollow rules
                    const noFollowUrl = self.shouldNotFollowUrl(requestData.userData.parent)
                    if (noFollowUrl) {
                        console.debug(`Rejecting link ${requestData.url} in ${requestData.userData.parent} since a noFollow rule was detected: ${noFollowUrl}`)
                        return;
                    }

                    // Stop processing if filtering settings meet
                    const ignoreRule = self.shouldIgnoreUrl(requestData.url)
                    if (ignoreRule) {
                        const msg = `Ignoring this url based on config.ignore rule \`${ignoreRule}\`: ${requestData.userData.parent} -> ${requestData.url}`;
                        console.debug(msg);
                        return;
                    }

                    // This should not occur
                    if (self.isExternLink(requestData.userData.parent)) {
                        console.todo(`Intercepted an URL hosted on an external page that was submitted to fetch queue: ${requestData.userData.parent} -> ${requestData.url}.`)
                        return;
                    }

                    self.emit('add-link', link);

                    if (uriObj.scheme === 'mailto') {
                        const record = handleResponse(link, {
                            userData: {
                                //parent,
                                reports: [{
                                    status: 'mail-unverified-address',
                                    description: 'Email link. Checking only syntax.'
                                }],
                                status: 'mail-unverified-address',
                                trials: 1
                            }
                        }, {
                            _from: 'parseLinksInPage'
                        })

                        await addRecord(record);
                        activeRequestsCount++;
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
                        console.error(e)
                    });
            }

            if (self.config.startUrl) {

                await addToRequestQueue('pup', new Link(self.config.startUrl, {
                    parent: 'corvee:startpage'
                }))
            }

            await addToRequestQueue('pup', self.urlList)

            await addToRequestQueue('basic', new Link('corvee:dummy-url', {
                parent: 'corvee:startpage'
            }))

            async function addRecord(record) {

                return new Promise(async (resolve, reject) => {

                    if (isMaxPagesExceeded()) {
                        console.info('Maximum requests reached.')
                        return reject('Maximum requests reached.');
                    }

                    self.session.recordCount++;
                    record.id = self.session.recordCount;
                    record.extern = self.isExternLink(record.url); // ??? parfois la propriété est absente

                    if (self.config.fetchLinksOnce) {
                        Object.keys(record).forEach(key => linkProps.add(key));
                        // console.log(record);
                        try {
                            if (!self.linkStore.has(record.url)) {
                                console.verbose(`Adding link to link store: ${record.url}`);
                                await self.linkStore.set(record);
                            }
                        } catch (e) {
                            console.error(e);
                            process.exit();
                        }
                    }

                    const browsingContextStack = self.browsingContextStore.getContext(record.parent)
                    if (browsingContextStack) {
                        record.browsingContextStack = browsingContextStack
                    }

                    await self.recordStore.pushData(record);

                    if (self.config.fetchLinksOnce) {
                        await self.linkStore.set(record);
                    }

                    finishedRequestsCount++;
                    self.emit('record', record, self.session.recordCount)

                    if (self.isExternLink(record.parent)) {
                        console.todo('Parent is external. This should not happen.')
                        console.todo(record)
                        process.exit()
                    }

                    resolve();
                }).catch(e => {
                    console.error(e)
                })
            }

            async function getPerformanceData(page, name) {
                if (typeof page === 'undefined') {
                    return null;
                }

                async function logConsole(msg) {
                    for (let i = 0; i < msg.args().length; ++i) {
                        console.warn(`${i}: ${msg.args()[i]}`);
                    }
                }

                page.on('console', logConsole)

                const perf = await page.evaluate(
                    (name) => {
                        var data;
                        try {
                            data = name ? window.performance.getEntriesByName(name) : window.performance.getEntries();
                            data = JSON.stringify(data)
                        } catch (e) {
                            console.warn(`Failed to get ${name ? `window.performance.getEntriesByName(${name})` : 'window.performance.getEntries()'} from ${location.href}`)
                            console.warn(e)
                            return ''
                        }
                        return data
                    }, name
                )

                page.removeListener('console', logConsole)
                return perf ? JSON.parse(perf) : perf;
            }

            async function getTimingFor(resource, page) {
                const perfData = await getPerformanceData(page, resource);

                if (!perfData) {
                    return null;
                }


                switch (perfData.length) {
                    case 0:
                        return null;
                    case 1:
                        return Math.round(perfData[0].duration * 1E3) / 1E3;
                    default:
                        return perfData.map(p => Math.round(p.duration * 1E3) / 1E3)
                }
            }

            async function parseLinksInPage(page, {
                currentLevel
            }) {
                const ret = [];
                const nextLevel = currentLevel + 1;
                if (nextLevel > self.config.maxDepth) {
                    return ret;
                }

                const parent = normalizeUrl(page.url());

                const noFollowUrl = self.shouldNotFollowUrl(parent)
                if (noFollowUrl) {
                    console.debug(`Stop parsing links in ${parent} since a noFollow rule was detected: ${noFollowUrl}`)
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

                    links = await page.evaluate(self.linkParser, { version: 'toto' })

                } catch (e) {
                    console.error(`Could not parse links in page ${page.url()}. Error: ${inspect(e)}`)
                }

                assert(_.isObject(links) || Array.isArray(links), 'The return value from the parser function muse be an object or an array.')

                if (!Array.isArray(links)) {
                    links = [links];
                }

                links
                    .map(link => {
                        // type validation
                        v(link).has('url').isString().not.isEmpty()
                        return link;
                    })
                    .map(link => (Object.assign(link, {
                        url: normalizeUrl(link.url),
                        parent,
                        isNavigationRequest: true
                    })))
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
                    .forEach(async link => {

                        parsedUrls.add(link.url);

                        const req = {
                            url: link.url,
                            uniqueKey: link.url,
                            userData: Object.assign(link, {
                                _from: 'parseLinksInPage',
                                parent,
                                extern: self.isExternLink(link.url),
                                reports: [],
                                level: nextLevel
                            })
                        };

                        ret.push(req);
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

                        if (isMaxPagesExceeded()) {
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
                    console.verbose(`# Processing [${request.retryCount}] ${request.url}`)

                    if (request.url === 'corvee:dummy-url') {
                        return Promise.reject();
                    }

                    // Stop processing if filtering settings meet
                    const ignoreRule = self.shouldIgnoreUrl(request.url)
                    if (ignoreRule) {
                        const msg = `Ignoring this url based on config.ignore rule \`${ignoreRule}\`: [${request.url}] -> ${url}`;
                        console.debug(msg);
                        const e = new CorveeError(msg, 'skip-ignore')
                        request.userData.reports.push(e)
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
                                    return resolve();
                                }

                                if (!(/^2/.test('' + response.statusCode))) { // Status codes other than 2xx
                                    reject(new Error('test'));
                                    return;
                                }

                                if (!isMaxPagesExceeded()) {
                                    const record = handleResponse(request, response);
                                    console.info(record)
                                    await addRecord(record);
                                }
                                resolve(response)
                            })
                            .catch(e => {
                                console.todo(e)
                                reject(e)
                                throw e;
                            });

                    }

                    ).catch(e => {
                        console.error(e)
                    })
                },
                handleFailedRequestFunction: function onNavigationRequestFailed({
                    request,
                    error
                }) {

                    if (request.url.startsWith('corvee:')) {
                        return;
                    }

                    console.degub(request)
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
                gotoFunction: async ({
                    request,
                    page
                }) => {

                    return new Promise(async (resolve, reject) => {
                        self.queue.add(async () => {

                            self.emit('request', request)

                            request.userData.trials = request.retryCount;

                            activeRequestsCount++;

                            try {
                                // To validate URL, those 2 tests must pass

                                // [1]
                                new URL(request.url);

                                // [2]
                                if (!isValidUrl(request.url)) {
                                    const urlErr = {
                                        name: 'UrlError',
                                        message: `Invalid URL: ${request.url}`,
                                        code: 'url-invalid-url',
                                        input: request.url,
                                        level: 'error'
                                    };

                                    requestFailedData.pushData({
                                        url: request.url,
                                        error: urlErr,
                                        _from: 'gotoFunction'
                                    });

                                    request.userData.reports.push(urlErr);
                                    // TODO: This seams to be working...
                                    try {
                                        const req = await puppeteerRequestQueue.getRequest(request.id);
                                    } catch (e) {
                                        console.todo('fix me')
                                        console.todo(request)
                                        console.todo(e)
                                    }

                                    return reject(urlErr);
                                }

                            } catch (e) {
                                console.info(e)
                                request.userData.reports.push(e)
                                request.noRetry = true;
                                return resolve();
                            }

                            // Stop processing if filtering settings meet
                            const ignoreRule = self.shouldIgnoreUrl(request.url)
                            if (ignoreRule) {
                                const msg = `Ignoring this url based on config.ignore rule \`${ignoreRule}\`: [${request.url}] -> ${url}`;
                                console.debug(msg);
                                const e = new CorveeError(msg, 'skip-ignore')
                                request.userData.reports.push(e)
                                return Promise.reject();
                            }

                            page.setUserAgent(getRandomUserAgent());

                            page.setDefaultNavigationTimeout(self.config.requestTimeout)

                            await page._client.send('Network.enable', {
                                maxResourceBufferSize: 1024 * 1204 * 100,
                                maxTotalBufferSize: 1024 * 1204 * 400,
                            })

                            page.on('error', function onError(err) {
                                request.userData.reports.push(err);
                                console.error(`Page crashed at ${request.url}`)
                                console.error(err)
                                return reject(err)
                            })

                            page.setRequestInterception(true);

                            // don't request assets if this is an external page
                            if (self.isExternLink(request.url)) {
                                apifyUtils.puppeteer.blockRequests(page, {
                                    urlPatterns: self.config.blockRequestsFromUrlPatterns
                                })
                            }

                            page.on('dialog', async function onDialog(dialog) {
                                await dialog.dismiss();
                            });


                            function getRequestData(req) {
                                if (req.isNavigationRequest()) {
                                    req.userData.request = req.userData.request || [];
                                    req.userData.request.push(((props) => {
                                        return props.reduce((obj, prop) => {
                                            obj[prop] = req[prop]();
                                            return obj;
                                        }, {})
                                    })(['url', 'headers', 'isNavigationRequest', 'resourceType', 'redirectChain']));
                                }
                            }

                            page.on('requestfinished', getRequestData);
                            page.on('requestfailed', getRequestData);

                            await apifyUtils.puppeteer.addInterceptRequestHandler(page, function onAssetRequest(pupRequest) {

                                //
                                // Main asset request handler
                                //
                                // Here we process pages assets only, since they are not handled natively by apifyjs.
                                // Page requests are processesd via the puppeteerCrawler handlePageFunction
                                //

                                // TODO: remove this test when it is stated that it will never be true
                                if ('userData' in pupRequest) {
                                    console.error('pupRequest already have a .userData property. Check why.')
                                    process.exit(1);
                                }

                                const url = pupRequest.url();
                                const parentUrl = page.url();

                                pupRequest.userData = Object.assign({}, request.userData, {
                                    _from: 'onAssetRequest',
                                    url: url,
                                    reports: []
                                })

                                // don't request assets if this is an external page (2)
                                // this may be unnecessary since we use puppeteer.blockRequests()
                                if (!pupRequest.isNavigationRequest() && self.config.checkExtern && self.isExternLink(parentUrl)) {
                                    const msg = `Skipping loading assets for an external resource: ${displayUrl(parentUrl)} -> ${displayUrl(url)}`
                                    console.verbose(msg);

                                    return pupRequest.abort('blockedbyclient')
                                }

                                // don't request if extern setting meets
                                if (pupRequest.isNavigationRequest() && !self.config.checkExtern && self.isExternLink(url)) {
                                    const msg = `Skipping external request ${displayUrl(parentUrl)} -> ${displayUrl(url)} from settings.`
                                    console.debug(msg);
                                    const e = new CorveeError(msg, 'skip-extern')
                                    pupRequest.userData.reports.push(e)

                                    return pupRequest.abort('blockedbyclient')
                                }

                                // Stop processing if filtering settings meet
                                const ignoreRule = self.shouldIgnoreUrl(request.url)
                                if (ignoreRule) {
                                    const msg = `Ignoring this url based on config.ignore rule \`${ignoreRule}\`: [${request.url}] -> ${url}`;
                                    console.debug(msg);
                                    const e = new CorveeError(msg, 'skip-ignore')
                                    pupRequest.userData.reports.push(e)
                                    return pupRequest.abort('blockedbyclient')
                                }

                                if (!pupRequest.isNavigationRequest()) {
                                    activeRequestsCount++;
                                    pupRequest.userData.trials = 1;
                                    pupRequest.userData.parent = parentUrl;
                                }

                                console.verbose(`[${pupRequest.isNavigationRequest() ? 'IS NAV' : 'IS NOT NAV'}] ${displayUrl(url)}`);

                                pupRequest.continue();
                            })

                            page.on('requestfailed', async function onAssetRequestFailed(pupRequest) {

                                //
                                // Main asset failed request handler
                                //
                                // Here we process pages assets only, since they are not handled natively by apifyjs.
                                // Page requests are processesd via the puppeteerCrawler handlePageFunction
                                //

                                if (pupRequest.failure().errorText.indexOf('net::ERR_BLOCKED_BY_CLIENT') > -1) {
                                    return;
                                }

                                //
                                // Request failed start
                                //

                                const url = pupRequest.url();

                                console.verbose(`${pupRequest.isNavigationRequest() ? `[${request.retryCount}]` : ''} ${pupRequest.isNavigationRequest() ? 'IS' : 'IS NOT'} NAV, ${pupRequest.failure().errorText} at ${displayUrl(request.userData.parent)} -> ${displayUrl(url)}`)

                                if (pupRequest.isNavigationRequest()) {

                                    //
                                    // This is a navigation error
                                    //

                                    // Catch download navigation (pdf, zip, docx, etc.) occuring on first try before puppeteer throws an net::ERR_ABORTED error
                                    if (pupRequest.failure().errorText === 'net::ERR_ABORTED') {
                                        const pupResponse = pupRequest.response();
                                        if (pupResponse) {

                                            let record;
                                            const meta = {
                                                _from: 'onAssetRequestFailed',
                                                resourceType: 'document',
                                                trials: request.retryCount
                                            }

                                            try {

                                                record = handleResponse(pupRequest, pupResponse, meta)
                                                setRedirectChain(record, pupRequest.redirectChain())

                                            } catch (e) {
                                                console.error(e)
                                                process.exit()
                                            }

                                            await addRecord(record);

                                            request.ignore = true;
                                            request.noRetry = true;

                                            return Promise.resolve()
                                        }
                                    }

                                    if (request.retryCount < self.config.maxRequestRetries) {
                                        return;
                                    }

                                    // Retry count maxed out.
                                    console.todo(`This request failure has not been handled: ${displayUrl(url)}`)
                                    console.todo(pupRequest.failure())
                                    request.userData.reports.push(pupRequest.failure().errorText);
                                }

                                parsedUrls.add(url);

                                if (!self.homeBasePUrl.matches(page.url())) {
                                    console.verbose(`Ignoring request error on external page asset. ${displayUrl(page.url())} -> ${displayUrl(url)}`);
                                    return Promise.resolve();
                                } else {
                                    if (['document', 'other'].includes(pupRequest.resourceType)) {
                                        console.warn(`This should be a page asset of the crawled website OR a request error: ${displayUrl(pupRequest.url())}`)
                                        console.warn(`resource type: ${pupRequest.resourceType()}`)
                                    }
                                }

                                self.session.counts.fail++;

                                if (pupRequest.failure().errorText === 'net::ERR_ABORTED') {
                                    console.verbose(`Silently ignoring failed 'net::ERR_ABORTED' request for ${displayUrl(url)}`)
                                    return Promise.resolve();
                                }

                                if (request.retryCount <= self.config.maxRequestRetries) {
                                    return Promise.reject();
                                }

                                console.log(pupRequest.userData)

                                pupRequest.userData.reports.push(pupRequest.failure().errorText)

                                requestFailedData.pushData({
                                    url,
                                    error: pupRequest.failure().errorText,
                                    _from: 'onAssetRequestFailed'
                                });

                                const record = handleFailedRequest(request, pupRequest, {
                                    _from: 'onAssetRequestFailed'
                                });

                                await addRecord(record);
                            })

                            page.on('response', async function onAssetResponse(pupResponse) {

                                //
                                // Main asset responses handler
                                //
                                // HANDLE ONLY NON DOCUMENT RESOURCES HERE
                                //

                                // Is this an asset request?
                                if (!pupResponse.request().isNavigationRequest()) {

                                    // const requestEnd = Date.now();
                                    const parentUrl = page.url();

                                    const meta = {
                                        _from: 'onAssetResponse',
                                        //timing_: requestEnd - pupResponse.request().requestStart,
                                    }

                                    //
                                    // This is an asset
                                    //

                                    // Is this asset on a page that is in the domain's website?
                                    if (self.homeBasePUrl.matches(parentUrl)) {
                                        // Do config allow to record assets?
                                        if (!self.config.navigationOnly) {

                                            parsedUrls.add(pupResponse.request().userData.url);

                                            try {
                                                meta.size = (await pupResponse.buffer()).length;
                                            } catch (e) {
                                                console.todo(`Can not get pupResponse.buffer().length at ${pageUrl}`)
                                                console.todo(e)
                                            }

                                            meta.timing = await getTimingFor(pupResponse.url(), page);
                                            meta.perfResponse = await getPerformanceData(page, pupResponse.url())

                                            // Is the asset loaded?
                                            if (pupResponse.ok()) {
                                                try {

                                                    setRedirectChain(meta, pupResponse.request().redirectChain())

                                                    const record = handleResponse(pupResponse.request(), pupResponse, meta)

                                                    await addRecord(record);
                                                    return;
                                                } catch (e) {
                                                    console.error(e)
                                                    process.exit()
                                                }
                                            }

                                            // Log other http status
                                            if (pupResponse.status()) {
                                                const record = handleResponse(pupResponse.request(), pupResponse, meta)
                                                await addRecord(record);
                                                return;
                                            }
                                            console.error('This response is not handled:', pupResponse.url())
                                            console.error('Request url:', pupResponse.request().url())
                                            console.error('Parent:', request.url)
                                            console.error(pupResponse.headers())
                                            process.exit()
                                        }

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

                                        // This is a Network error. See https://developer.mozilla.org/en-US/docs/Web/API/Response/type
                                        // Will be handled in onNavigationRequest handler

                                        return;
                                    }

                                    function setResponseChain(pupResponse) {
                                        pupResponse.request().userData.responseChain = pupResponse.request().userData.responseChain || [];
                                        const redirect = ((props) => {
                                            return props.reduce((obj, prop) => {
                                                try {
                                                    obj[prop] = pupResponse[prop]();
                                                    return obj;
                                                } catch (e) {
                                                    console.error(e)
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

                                            const httpError = HttpError(pupResponse)

                                            pupResponse.request().userData.reports.push(httpError);
                                        }

                                    }
                                }

                            })

                            console.verbose('Request begin:', request.url)

                            page.goto(request.url, {
                                waitUntil: self.config.pageWaitUntil
                            })
                                .then(response => {
                                    resolve(response);
                                }).catch(error => {
                                    console.warn(`page.goto() failed at try [${request.retryCount}] ${request.url}`)
                                    console.warn(error)

                                    if (request.retryCount >= self.config.maxRequestRetries) {
                                        console.verbose(`Request failed after ${request.retryCount} tries: ${request.url}`)
                                    }

                                    reject(error)
                                });
                        })
                    }).catch(e => {
                        console.todo('Unhandled error:')
                        console.todo(e)
                        console.todo(request)
                    })
                },
                autoscaledPoolOptions: self.autoscaledPoolOptions,
                launchPuppeteerOptions: self.launchPuppeteerOptions,
                puppeteerPoolOptions: {
                    recycleDiskCache: self.config.useCache,
                    maxConcurrency: self.config.maxConcurrency
                },
                launchPuppeteerFunction: (launchPoppeteerOptions) => {
                    return launchPuppeteer(launchPoppeteerOptions)
                },
                maxRequestRetries: self.config.maxRequestRetries,
                requestQueue: puppeteerRequestQueue,
                handlePageTimeoutSecs: self.config.pageTimeout / 1000,
                handlePageFunction: async function onNavigationResponse({
                    request,
                    response: pupResponse,
                    page
                }) {

                    // page.on('console', function onConsole(msg) {
                    //     if (msg.text().indexOf('ERR_BLOCKED_BY_CLIENT') > 0) {
                    //         return
                    //     }

                    //     if (msg.text().indexOf('Preflight request for request with keepalive specified is currently not supported') > 0) {
                    //         return
                    //     }

                    //     for (let i = 0; i < msg.args().length; ++i) {
                    //         console[msg.type()](msg.args()[i]);
                    //     }
                    //     console[msg.type()](msg.text())
                    // });

                    await page.exposeFunction('harvester', () => {
                        return self
                    });

                    //
                    // Main navigation responses handler
                    // Here we process navigation responses. Some handling is also done on a `onNavigationResponse` handler registered on page.on()
                    //

                    if (typeof pupResponse === 'undefined') {
                        if (self.shouldIgnoreUrl(request.url)) {
                            return
                        }
                        console.todo(`Response is undefined at [${request.userData.trials}] ${request.url}`)
                        console.todo(`${request}`)
                        throw '';
                    }

                    if (typeof pupResponse === null) {
                        console.todo(`Response is null at [${request.userData.trials}] ${request.url}`)
                        console.todo(request)
                        throw '';
                    }

                    if (pupResponse.status() >= 500 && request.userData.trials < self.config.maxRequestRetries) {
                        // Let's try it again until the max trials is reatched

                        try {
                            pupResponse.request().userData.httpStatusCode = pupResponse.status();
                        } catch (e) {
                            console.error(e)
                        }

                        throw '';
                    }

                    parsedUrls.add(request.url);
                    _activeRequestsCount.add(request.url)

                    try {
                        request.userData.timing = await getTimingFor(pupResponse.url(), page)
                    } catch (e) {
                        console.todo(`getTimingFor() failed. Request url: ${request.url}`)
                        console.toto(`request: ${inspect(request)}`)
                        console.todo(`response: ${inspect(pupResponse)}`)
                        console.todo(e)
                    }

                    const data = await responseData(pupResponse.request()._requestId, pupResponse)

                    try {
                        data.timing = await getTimingFor(pupResponse.url(), page)
                    } catch (e) {
                        console.todo(`getTimingFor() failed. Request url: ${request.url}`)
                        console.toto(`request: ${inspect(request)}`)
                        console.todo(`response: ${inspect(pupResponse)}`)
                        console.todo(e)
                    }

                    self.emit('response', {
                        type: 'navigation',
                        data,
                        request: pupResponse.request(),
                        response: pupResponse
                    })

                    self.session.counts.success++;

                    // try {
                    //     if (!pupResponse.ok()) {

                    //         const screenshotBuffer = await page.screenshot();

                    //         // The "key" of a KeyValueStore must be at most 256 characters long and only contain the following characters: a-zA-Z0-9!-_.
                    //         const key = filenamifyUrl(request.url)

                    //         await self.screenshotsStore.setValue(key, screenshotBuffer, {
                    //             contentType: 'image/png'
                    //         })
                    //     }
                    // } catch (e) {
                    //     console.todo(`Request url: ${request.url}`)
                    //     console.todo(e)
                    // }

                    try {
                        const pageUrl = normalizeUrl(request.url, true);

                        const meta = {
                            _from: 'onNavigationResponse'
                        }

                        try {
                            meta.size = (await pupResponse.buffer()).length;
                        } catch (e) {
                            console.todo(`${UNHANDLED_ERROR} at ${pageUrl}`)
                            console.todo(request)
                            console.todo(pupResponse)
                            console.todo(`error: ${inspect(e)}`)
                        }

                        if (self.plugins.onNavigationResponse.length) {
                            self.plugins.onNavigationResponse.forEach(async plugin => {
                                try {
                                    await plugin.fn.call(self, request, pupResponse, page)
                                } catch (e) {
                                    console.error(e)
                                }
                            })
                        }

                        const record = handleResponse(request, pupResponse, meta)


                        await addRecord(record);

                        //
                        // Should we parse further links in the resulting page?
                        //

                        const pageFinalUrl = normalizeUrl(record.finalUrl ? record.finalUrl : record.url, true)

                        const finalNavUrl = normalizeUrl(page.url(), true);

                        if (!self.isExternLink(finalNavUrl)) {

                            const links = await parseLinksInPage(page, {
                                currentLevel: request.userData.level,
                                // _bwowsingContextStack: request.userData.resourceIsEmbeded ? [] : request.userData._bwowsingContextStack
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
                            } catch (e) {
                                console.error(e)
                                process.exit()
                            }

                        } else {
                            console.verbose('Page is NOT on website')
                        }
                    } catch (e) {
                        console.error(`Got an error while trying to get the record of the link ${request.url}`)
                        console.error(e);
                        console.error(`Exiting now...`)
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

                    const url = normalizeUrl(request.url);

                    console.info(`[try: ${request.retryCount}] url: ${displayUrl(url)}`)

                    _activeRequestsCount.delete(request.url)

                    if (request.ignore) {
                        return;
                    }

                    //
                    // This is a navigation error
                    //

                    const record = handleFailedRequest(request, error, {
                        _from: 'onNavigationRequestFailed',
                        resourceType: 'document',
                        trials: request.retryCount,
                    })

                    await addRecord(record);

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
                        .catch(e => {
                            console.error('Basic crawler ended with error.')
                            reject(e)
                        })

                    const statsLoggerHandle = setInterval(() => {
                        try {
                            basicCrawler.stats.stopLogging();
                            clearInterval(statsLoggerHandle);
                            console.debug('Canceled basicCrawler stats logging.')
                        } catch (e) {
                            console.error(e)
                        }
                    }, 100)

                })
                    .catch(e => {
                        console.error(e)
                    })
            }

            await Promise.all([
                puppeteerCrawler
                    .run()
                    .then(() => {
                        console.info('Puppeteer crawler is done.')
                        return Promise.resolve();
                    })
                    .catch(e => {
                        console.error('Puppeteer crawler ended with error.')
                        throw e;
                    }),
                launchBasicCrawler()
            ])
                .catch(e => {
                    console.error(e)
                });

            const sortedparsedUrls = Array.from(parsedUrls.values()).sort();
            console.log(`counts: `, self.session.counts);
            // console.log(`parsedUrls (${Array.from(parsedUrls.values()).length}): ${stringify(sortedparsedUrls, null, 2)}`)

            //console.log([...parentsStore.get('http://localhost:3000/common-page.html').values()])

            // await waitFor(1000)


        }
    }
};