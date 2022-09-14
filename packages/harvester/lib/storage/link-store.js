import { KeyValueStore } from '@crawlee/playwright';
import LRU from 'lru'
import v from 'io-validate'
import extend from 'extend';
import { omit, pick } from 'underscore'
import { idFromUrl, normalizeUrl, console, inspect } from '../../../core/index.js'

/*
Link props:
   url
   finalUrl
   httpStatusCode
   contentType
   isNavigationRequest
   redirectChain
   resourceType
   trials
   reports
   created
   contentLength
   parent
   level
   timing
   _from
   size
   id
   text
   urlData
   extern
*/

const linkIntrinsicProps = 'url finalUrl httpStatusCode contentType resourceType contentLength extern size redirectChain reports'.split(' ');

const linkTemplate = {
    finalUrl: null,
    redirectChain: null,
    trials: 1,
    reports: null,
    contentLength: null,
    parent: 'corvee:url-list',
    level: 0
}

export class LinkStore {

    constructor() {
        this._linkIdx = new Set();
        this._cache = new LRU(10000)
        this._store = null
    }

    async init() {
        this._store = await KeyValueStore.open('link-store')
        // In case of a --resume option
        await this._store.forEachKey((key) => {
            this._linkIdx.add(key)
        })
    }

    has(url) {
        v(url, 'url').isString();

        url = normalizeUrl(url)

        const key = idFromUrl(url);

        return this._linkIdx.has(key);
    }

    async set(
        linkData = {},
        options = {}) {

        v(linkData).isObject()
        v(linkData.url, 'url').isString();

        const linkId = idFromUrl(normalizeUrl(linkData.url));

        if (this._linkIdx.has(linkId)) {
            return Promise.resolve();
        }

        linkData = pick(linkData, linkIntrinsicProps);

        await this._store.setValue(linkId, linkData, options);
        this._linkIdx.add(linkId);
    }

    async get(url) {
        try {
            v(url, 'url').isString();
        } catch (e) {
            console.error(inspect(e));
            process.exit();
        }

        const linkId = idFromUrl(normalizeUrl(url));

        return this._store.getValue(linkId);
    }

    async recordFromData(data) {

        let {
            url,
            ...linkData
        } = data;

        v(url, 'url').isString();

        url = normalizeUrl(url)

        const linkId = idFromUrl(url);

        if (!this._linkIdx.has(linkId)) {
            console.error(`This link is not in the link-store: ${inspect(data)}`)
            throw new Error(data)
        }

        const fromCache = this._cache.get(linkId);

        const storedLink = fromCache || (await this._store.getValue(linkId));

        if (typeof fromCache === 'undefined') {
            this._cache.set(linkId, storedLink)
        }

        if (typeof linkData.userData !== 'undefined') {
            linkData = {
                ...linkData,
                ...linkData.userData
            }
            delete linkData.userData;
        }

        delete linkData.uniqueKey;

        if (!storedLink) {
            return storedLink;
        }

        const newRecord = extend(true, {}, linkTemplate, storedLink, omit(linkData, linkIntrinsicProps), {
            _from: 'linkStore',
            created: new Date().toISOString()
        })

        return newRecord;
    }
}