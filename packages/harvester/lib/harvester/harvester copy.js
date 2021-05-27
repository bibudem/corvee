import {
    URL
} from 'url';
import fs, {
    promises as fsPromises
} from 'fs'
import EventEmitter from 'events'
import util from 'util'

import minimatch from 'minimatch'
import * as URI from 'uri-js'
import stringify from 'json-stringify-safe'

import _ from 'underscore'

import rp from 'request-promise-native'
// import createHttpError from 'http-errors'
import rimraf from 'rimraf';
import Apify, {
    BasicCrawler,
    PuppeteerCrawler,
    utils as apifyUtils
} from 'apify';

import {
    launchPuppeteer
}
from 'apify/build/puppeteer'

import {
    computeUniqueKey
} from 'apify/build/request'

import v from 'io-validate'
// import dotProp from 'dot-prop'
import assert from 'assert-plus'
const extend = require('extend')

import {
    normalizeUrl,
    isValidUrl,
    filenamifyUrl,
    idFromUrl
} from '../../../core'

import {
    MemCache
} from './cache'

import {
    CorveeError,
    HttpError
} from '../errors'

import {
    humanDuration,
    getUa
} from '../utils'
import {
    Link
} from '../link'

import {
    handleResponse,
    handleFailedRequest
} from '../record'

import {
    RequestQueue
} from '../request-queue'
import {
    PseudoUrls
} from '../pseudoUrls'

import {
    console
} from '../core/lib/logger';

import Notifier from '../utils/notifier'

console.setLevel('verbose')

import {
    defaultHarvesterOptions,
    defaultAutoscaledPoolOptions,
    defaultLinkParser
} from './'

import {
    setRedirectChain
} from './redirection-pool';

const UNHANDLED_ERROR = '# unhandled error #';

export class Harvester extends EventEmitter {
    //return new Promise(async (resolve, reject) => {

    constructor(config = {}) {
        // config validation

        //v(config.proxy, 'config.proxy').is('string', 'object', 'undefined')

        super();

        this.isPaused = null;
        this._isRunning = false
        this._pausedAt = 0;

        this.config = Object.assign({}, defaultHarvesterOptions, config);

        this.linkParser = defaultLinkParser;

        // this.notifyHandle = null;
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

        if ('plugins' in this.config) {
            this.setPlugins(this.config.plugins)
        }

        // try {
        //     this.requestThrottler = new ThrottleRequests({
        //         maxConcurrency: this.config.maxConcurrency
        //     })
        // } catch (e) {
        //     console.z(e)
        // }

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
                //return requestHandler.ready;
                // return requestHandler.size  < self.config.maxConcurrency;
                console.me('########### autoscaled pool isTaskReadyFunction')
                return true;
            },
            runTaskReadyFunction: function runTaskReady() {
                //return requestHandler.ready;
                // return requestHandler.size  < self.config.maxConcurrency;
                console.me('########### autoscaled pool runTaskReadyFunction')
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
            console.error('This feature is not yet implemented: addUrl after harvester is started!');
            process.exit();
        } else {
            this.urlList.push(...urls.map(url => new Link(url)))
        }
        return this;
    }

    setLinkParser(fn) {
        this.linkParser = fn;
    }

    setPlugins(plugins) {
        v(plugins, 'plugins').isArray();

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
        if (this.config.ignore.length === 0) {
            return false;
        }

        return this.config.ignore.find(testUrl => {
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

    isExternLink(url) {
        if (url) {
            return !this.homeBasePUrl.matches(url);
        }

        return true;
    }

    async pause(timeout) {
        if (this.isPaused) {
            console.info('Harvester is already paused.')
            return;
        }

        this._pausedAt = Date.now();

        console.info('Pausing harvester...')

        await Promise.all(this.crawlers.map(crawler => crawler.pause(timeout)))

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
        this._startTime = this._startTime + pauseTime;
        this._pausedAt = 0;
        this.isPaused = false;

        // if (this.config.notify) {
        //     notify.call(this)
        // }

        if (this.notify) {
            this.notify.resume();
        }

        console.info(`Harvester resumed crawling.`)
    }

    run() {
        const self = this;
        console.info(this.config)
        this._startTime = Date.now();
        this._isRunning = true;
        this.isPaused = false;
        // this.redirectionPool = new RedirectionPool();

        const counts = {
            success: 0,
            fail: 0
        }

        var lastRequest = Date.now();

        if (!process.env.APIFY_LOCAL_STORAGE_DIR) {
            process.env.APIFY_LOCAL_STORAGE_DIR = self.config.apifyLocalStorageDir;
        }

        if (this.notify) {
            this.notify.addMessage(() => {
                const end = Date.now();
                const duration = humanDuration(end - this._startTime)
                return `[Execution time] ${duration}`;
            })
        }

        process.on('exit', () => {
            this.notify.stop();
            const end = Date.now();
            const duration = humanDuration(end - this._startTime);

            console.info(`Total execution time: ${duration}`)

            this.emit('end')

        });

        return async function run() {

            //const dedupLinks = new Set();

            function displayUrl(url) {
                if (!url) {
                    return url;
                }
                return url.startsWith('data:') ? `${url.slice(0, 60)}...` : url;
            }

            const parsedUrls = new Set();

            console.debug(`Removing ${self.config.apifyLocalStorageDir} and ${self.config.puppeteerCacheDir} folders...`)

            const tmpDirSuffix = `${Date.now()}`;
            const tmpStorageDir = `${self.config.apifyLocalStorageDir}_${tmpDirSuffix}`;
            const tmpPuppeteerCacheDir = `${self.config.puppeteerCacheDir}_${tmpDirSuffix}`;
            const rimrafP = util.promisify(rimraf);

            function cleanupFolder(path, tmpPath) {
                return new Promise(async (resolve, reject) => {
                    if (fs.existsSync(path)) {
                        await fsPromises.rename(path, tmpPath);
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
            }

            Promise.all([
                    cleanupFolder(self.config.apifyLocalStorageDir, tmpStorageDir),
                    cleanupFolder(self.config.puppeteerCacheDir, tmpPuppeteerCacheDir)
                ])
                .then(() => {
                    console.debug(`Done removing ${self.config.apifyLocalStorageDir} and ${self.config.puppeteerCacheDir} folders.`);
                })
                .catch(e => {
                    console.error(e)
                    process.exit()
                })

            const recordData = await Apify.openDataset('records');

            if (self.fetchLinksOnce) {
                self._linkStore = await Apify.openKeyValueStore('links');
            }

            self.assetsLinksStore = await Apify.openDataset('assets-urls');
            self.screenshotsStore = await Apify.openKeyValueStore('screenshots');
            const requestFailedData = await Apify.openDataset('request-failed');

            const puppeteerRequestQueue = await Apify.openRequestQueue('puppeteer');

            // self.notify.addMessage(() => {
            //     return `${finishedRequestsCount} requests processed`;
            // });

            self.queue = new RequestQueue({
                concurrency: self.config.maxConcurrency,
                interval: self.config.waitInterval,
                intervalCap: 1
            });

            const basicRequestQueue = await Apify.openRequestQueue('basic');

            let recordCount = 0;
            let activeRequestsCount = 0;
            let _activeRequestsCount = new Set();
            let finishedRequestsCount = 0;
            let currentMinimumLevel = 0;
            const activeLevels = [];

            // self.notify.addMessage(() => {
            //     return `${finishedRequestsCount - Array.from(_activeRequestsCount.values()).length} active requests.`;
            // })

            self.notify.addMessage(() => {
                return `Request queue size: ${self.queue.size} Pending: ${self.queue.pending}`
            })

            function isMaxPagesExceeded() {
                // console.log(activeRequestsCount)
                return self.config.maxRequests !== -1 && activeRequestsCount > self.config.maxRequests && finishedRequestsCount >= self.config.maxRequests;
            }

            const uniqueLinksPerPage = new Map();

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

                    data = new Link(data);
                    assert.object(data)
                    assert.string(data.url)
                    assert.object(data.userData)

                    if (data.constructor.name !== 'Link') {
                        console.error('data should be of Link class:', data);
                        process.exit()
                    }

                    try {
                        uriObj = URI.parse(data.url);
                    } catch (e) {
                        console.error(`Missing url property: ${stringify(data, null, 2)}`)
                        console.error(e);
                        process.exit();
                    }

                    self.emit('add-link', data);

                    //
                    // Don't collect the same link twice per page
                    const pageUrl = data.parent;

                    if (!uniqueLinksPerPage.has(pageUrl)) {
                        uniqueLinksPerPage.set(pageUrl, new Set())
                    }

                    if (uniqueLinksPerPage.get(pageUrl).has(data.url)) {
                        return;
                    }

                    uniqueLinksPerPage.get(pageUrl).add(data.url)
                    // end
                    //

                    // if (dedupLinks.has(data.url)) {
                    //     return;
                    // }

                    // dedupLinks.add(data.url);

                    if (!self.config.schemes.some(scheme => minimatch(uriObj.scheme, scheme))) {
                        console.verbose(`Unsupported scheme: ${uriObj.scheme} ${data.url ? `at uri <${data.url}>`: ''}`)
                        return;
                    }

                    if (uriObj.scheme === 'mailto') {
                        const record = handleResponse(data, {
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

                    const trials = data.trials || 1;
                    const extern = self.isExternLink(data.url)

                    const requestData = extend(true, {}, data, {
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
                        const msg = `Ignoring this url based on config.ignore rule \`${ignoreRule}\`: [${requestData.userData.parent}] -> ${requestData.url}`;
                        console.debug(msg);
                        return;
                    }

                    // This should not occur
                    if (self.isExternLink(requestData.userData.parent)) {
                        console.warn(`[TODO] Intercepted an URL hosted on an external page that was submitted to fetch queue: [${requestData.userData.parent}] -> ${requestData.url}.`)
                        return;
                    }

                    if (!self.fetchLinksOnce) {
                        requestData.uniqueKey = computeUniqueKey({
                            url: requestData.url,
                            method: 'GET',
                            payload: `${Date.now()}:${Math.floor(Math.random() * 1E6)}`,
                            keepUrlFragment: false,
                            useExtendedUniqueKey: true
                        });
                    }

                    const reqInfo = await queue.addRequest(requestData);

                    if (self.config.fetchLinksOnce && reqInfo.wasAlreadyPresent) {

                        // This URL has already checked, so skip fetching and
                        // create a record with the previously obtained data
                        const linkId = idFromUrl(requestData.url);

                        const linkData = await self._linkStore.getValue(linkId);

                        if (linkData) {
                            if (!linkData.parents.includes(requestData.userData.parent)) {

                                // console.me('linkId:', linkId)
                                // console.me('linkData:', linkData)
                                // console.me('requestData', requestData)

                                // process.exit();

                                linkData.parents.push(requestData.userData.parent);

                                const newRecord = extend(true, {}, _.omit(linkData.record, ['id', 'created', 'timing']), _.pick(requestData.userData, ['level', 'parent', 'text', 'trials']), {
                                    _from: 'parseLinksInPage#wasAlreadyPresent',
                                    created: new Date().toISOString(),
                                    trials: 1
                                })

                                await addRecord(newRecord);

                                activeRequestsCount++;
                                puppeteerCrawler.basicCrawler.handledRequestsCount++;
                            }
                        }

                        // if (!parentsStore.has(requestData.url)) {
                        //     parentsStore.set(requestData.url, new Set())
                        // }
                        // parentsStore.get(requestData.url).add(requestData.userData.parent)

                        return
                    } else {
                        addRequestPromises.push(reqInfo)
                    }
                })

                return Promise.all(addRequestPromises);
                // .then(queueOperationInfos => {
                //     console.info(stringify(queueOperationInfos, null, 2))
                // })
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

                    recordCount++;
                    record.id = recordCount;

                    // if (parentsStore.has(record.url)) {
                    //     record.parents.push(...Array.from(parentsStore.get(record.url).values()))
                    // }

                    if (self.fetchLinksOnce) {
                        const urlId = idFromUrl(record.url);
                        let linkData = await self._linkStore.getValue(urlId);
                        if (linkData === null) {
                            linkData = {
                                url: record.url,
                                parents: [record.parent],
                                record
                            }
                        } else {
                            linkData.parents = [...new Set([...linkData.parents, record.parent])]
                        }

                        console.verbose(`Adding link to link store: ${record.url}`);

                        await self._linkStore.setValue(urlId, linkData);
                    }

                    recordData.pushData(record);
                    finishedRequestsCount++;
                    self.emit('record', record, recordCount)

                    if (self.isExternLink(record.parent)) {
                        console.me('Parent is external. This should not happen.')
                        console.me(record)
                        process.exit()
                    }

                    resolve();
                })
            }

            async function getPerformanceData(page, name) {
                // console.z(name)
                if (typeof page === 'undefined') {
                    return null;
                }

                async function logConsole(msg) {
                    for (let i = 0; i < msg.args().length; ++i) {
                        console.z(`${i}: ${msg.args()[i]}`);
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
                            console.warn(`Failed to get ${name ? `window.performance.getEntriesByName(${name})` : 'window.performance.getEntries()' } from ${location.href}`)
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
                // console.z(resource)
                const perfData = await getPerformanceData(page, resource);

                if (!perfData) {
                    return null;
                }


                switch (perfData.length) {
                    case 0:
                        return null;
                    case 1:
                        return perfData[0].duration;
                    default:
                        return perfData.map(perfData.duration)
                }
            }

            async function parseLinksInPage(page, {
                currentLevel,
                _browsingContextStack = []
            }) {
                const ret = [];
                const nextLevel = currentLevel + 1

                if (nextLevel > self.config.maxDepth) {
                    return ret;
                }

                const parent = normalizeUrl(page.url());

                const noFollowUrl = self.shouldNotFollowUrl(parent)
                if (noFollowUrl) {
                    console.debug(`Stop parsing links in ${parent} since a noFollow rule was detected: ${noFollowUrl}`)
                    return ret;
                }

                // let linkParser = self.linkParser || defaultLinkParser;

                let links = []

                try {
                    links = await page.evaluate(self.linkParser)
                } catch (e) {
                    console.error(UNHANDLED_ERROR)
                    console.error(e)
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
                        _browsingContextStack,
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
                    //maybeRunIntervalSecs: 10,
                    isFinishedFunction: async function isFinished() {
                        const puppeteerRequestQueueIsFinished = await puppeteerRequestQueue.isFinished();
                        const basicRequestQueueIsFinished = await basicRequestQueue.isFinished();

                        if (isMaxPagesExceeded()) {
                            return true;
                        }

                        // if (isMaxDepthExceeded()) {
                        //     return true;
                        // }
                        if (!puppeteerRequestQueueIsFinished) {
                            //console.info(`puppeteerRequestQueue info: ${stringify(puppeteerRequestQueue.getInfo(), null, 2)}`)
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
                    //console.log(`[basicCrawler] userData: `, request.userData);

                    // const d = await basicRequestQueue.getInfo();
                    //console.log(d)

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

                                    // console.warn(response.ok)

                                    if (!isMaxPagesExceeded()) {
                                        const record = handleResponse(request, response);
                                        console.info(record)
                                        await addRecord(record);
                                    }
                                    resolve(response)
                                })
                                .catch(e => {
                                    //requestFailedData.pushData(e);
                                    console.error('ici')
                                    console.error(e)
                                    reject(e)
                                    throw e;
                                });

                        }

                    )
                },
                handleFailedRequestFunction: function onNavigationRequestFailed({
                    request,
                    error
                }) {

                    if (request.url.startsWith('corvee:')) {
                        return;
                    }

                    console.warn(request)
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
                            console.info(`request url: ${request.url}`);

                            page.setUserAgent(getUa());

                            request.userData.trials = request.retryCount;

                            page.setDefaultNavigationTimeout(self.config.requestTimeout)

                            await page._client.send('Network.enable', {
                                maxResourceBufferSize: 1024 * 1204 * 100,
                                maxTotalBufferSize: 1024 * 1204 * 400,
                            })

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
                                        code: 'invalid-url',
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
                                    // console.z(request);
                                    try {
                                        const req = await puppeteerRequestQueue.getRequest(request.id);
                                        // if (req) {
                                        //     // The request is in the requestQueue
                                        //     console.me('request exists')
                                        //     console.me(req)
                                        //     // await puppeteerRequestQueue.markRequestHandled(request);
                                        //     // return reject(urlErr);
                                        // }
                                    } catch (e) {
                                        console.me('fix me too')
                                        console.error(e)
                                        // process.exit()
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

                            // if (self.shouldIgnoreUrl(request.url)) {
                            //     console.verbose(`Ignoring this url based on config.filter.ignore settings: ${request.url}`);
                            //     return Promise.reject();
                            // }

                            page.setRequestInterception(true);

                            // don't request assets if this is an external page
                            if (self.isExternLink(request.url)) {
                                apifyUtils.puppeteer.blockRequests(page, {
                                    urlPatterns: ['.bmp', '.css', '.cur', '.gif', '.gzip', '.jpeg', '.jpg', '.mp4', '.png', '.svg', '.ttf', '.webp', '.woff', '.woff2', '.zip', 'googleadservices.com']
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
                                // console.z('-----------------------------> ' + url)
                                // console.z(request.userData)
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
                                    const msg = `Skipping external request <${displayUrl(url)}> from settings.`
                                    console.debug(msg);
                                    const e = new CorveeError(msg, 'skip-extern')
                                    pupRequest.userData.reports.push(e)

                                    return pupRequest.abort('blockedbyclient')
                                }

                                // Stop processing if filtering settings meet
                                const ignoreRule = self.shouldIgnoreUrl(request.url)
                                if (ignoreRule) {
                                    const msg = `Ignoring this url based on config.ignore rule \`${ignoreRule}\`: [${request.url}] -> ${url}`;
                                    console.verbose(msg);
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
                                    console.z(pupRequest.url())

                                    //
                                    // This is a navigation error
                                    //

                                    // Catch download navigation (pdf, zip, docx, etc.) occuring on first try before puppeteer throws an net::ERR_ABORTED error
                                    if (pupRequest.failure().errorText === 'net::ERR_ABORTED') {
                                        console.z('=====================================')
                                        const pupResponse = pupRequest.response();
                                        // console.error(`This is a document?: ${request.url}`)
                                        // console.error(`Has response ? ${!!resp}`)
                                        if (pupResponse) {

                                            let record;
                                            const meta = {
                                                _from: 'onAssetRequestFailed',
                                                resourceType: 'document',
                                                trials: request.retryCount
                                            }

                                            // setRedirectChain(meta, pupRequest.redirectChain())

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
                                    console.me('TODO: this request failure has not been handled.')
                                    console.me(pupRequest.failure())
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

                                counts.fail++;

                                if (pupRequest.failure().errorText === 'net::ERR_ABORTED') {
                                    console.info(`Silently ignoring failed 'net::ERR_ABORTED' request for ${displayUrl(url)}`)
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
                                                console.error(`${UNHANDLED_ERROR} at ${pageUrl}`)
                                                console.error(e)
                                            }

                                            meta.timing = await getTimingFor(pupResponse.url(), page);
                                            meta.perfResponse = await getPerformanceData(page, pupResponse.url())

                                            //console.log(`[response] userData from pupResponse`)
                                            console.info(`### [${pupResponse.status()}] ${pupResponse.headers()['content-type']}`);

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
                                            console.error('request url:', pupResponse.request().url())
                                            console.error('parent:', request.url)
                                            console.error(pupResponse.headers())
                                            process.exit()
                                        }

                                    }
                                }

                            })

                            page.on('response', async function onNavigationResponse(pupResponse) {
                                // console.me(pupResponse.request())
                                // console.me(pupResponse)

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

                                        //console.info(`FIXME: [${request.retryCount}] got a status = ${pupResponse.status()} for ${pupResponse.request().url()}`)
                                    }
                                }

                            })

                            // if (self.config.useCache) {
                            //     await apifyUtils.puppeteer.cacheResponses(page, self.responseCache, [/./])
                            // }

                            console.verbose('Request begin:', request.url)

                            page.goto(request.url, {
                                    waitUntil: self.config.pageWaitUntil
                                })
                                .then(response => {
                                    resolve(response);
                                }).catch(error => {
                                    console.verbose(`[${request.retryCount}]`, error)

                                    if (request.retryCount >= self.config.maxRequestRetries) {
                                        console.info(`Request failed after ${request.retryCount} tries: ${request.url}`)
                                        if (error) {
                                            console.info(error)
                                        }
                                    }

                                    reject(error)
                                });
                        })
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

                    //
                    // Main navigation responses handler
                    // Here we process navigation responses. Some handling is also done on a `onNavigationResponse` handler registered on page.on()
                    //

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
                        console.warn(`[TODO] getTimingFor() failed. Request url: ${request.url}`)
                        console.warn(e)
                    }

                    counts.success++;

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
                    //     console.z(`[TODO] Request url: ${request.url}`)
                    //     console.z(e)
                    // }

                    try {
                        const pageUrl = normalizeUrl(request.url, true);

                        const meta = {
                            _from: 'onNavigationResponse'
                        }

                        try {
                            meta.size = (await pupResponse.buffer()).length;
                        } catch (e) {
                            console.error(`${UNHANDLED_ERROR} at ${pageUrl}`)
                            console.error(e)
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
                                _browsingContextStack: request.userData._browsingContextStack
                            });

                            await addToRequestQueue('pup', links)

                            try {
                                for (const frame of page.mainFrame().childFrames()) {

                                    // TODO: find a better test to detect cross origin frames
                                    if (frame.url() !== '') {

                                        const link = new Link(frame.url(), {
                                            parent: pageFinalUrl,
                                            level: request.userData.level,
                                            _browsingContextStack: [...(request.userData._browsingContextStack || []), pageFinalUrl]
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

                    console.info(`[${request.retryCount}] url: ${displayUrl(url)}`)

                    _activeRequestsCount.delete(request.url)

                    if (request.ignore) {
                        return;
                    }

                    //
                    // This is a navigation error
                    //

                    // console.info(arguments)
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
                //minConcurrency: Math.min(100, Math.ceil(self.config.maxConcurrency * .95))
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
                            console.info('basic crawler is done.')
                            resolve();
                        })
                        .catch(e => {
                            console.error('basic crawler ended with error.')
                            reject(e)
                        })

                })
            }

            await Promise.all([
                puppeteerCrawler
                .run()
                .then(() => {
                    console.info('puppeteer crawler is done.')
                    return Promise.resolve();
                })
                .catch(e => {
                    console.error('puppeteer crawler ended with error.')
                    throw e;
                    process.exit()
                }),
                launchBasicCrawler()
            ]);

            const sortedparsedUrls = Array.from(parsedUrls.values()).sort();
            console.log(`counts: `, counts);
            // console.log(`parsedUrls (${Array.from(parsedUrls.values()).length}): ${stringify(sortedparsedUrls, null, 2)}`)

            //console.log([...parentsStore.get('http://localhost:3000/common-page.html').values()])

            // await waitFor(1000)


        }
    }
};