import Apify from 'apify';
import LRU from 'lru'
import v from 'io-validate'
import extend from 'extend';
import {
    omit,
    pick
} from 'underscore'
import {
    idFromUrl,
    console
} from '../../../core'

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

const linkIntrinsicProps = 'url finalUrl httpStatusCode contentType resourceType contentLength extern size redirectChain'.split(' ');
const linkExtrinsicProps = null;

const linkTemplate = {
    finalUrl: null,
    redirectChain: [],
    trials: 1,
    reports: [],
    contentLength: null,
    parent: 'corvee:url-list',
    level: 0
}

export class LinkStore {

    constructor() {
        this._linkIdx = new Set();
        this._cache = new LRU(200)
    }

    async init() {
        this._store = await Apify.openKeyValueStore('links');
    }

    has(url) {
        v(url, 'url').isString();
        // console.info(url)
        // console.info(Array.from(this._linkIdx.values()))
        const key = idFromUrl(url);
        return this._linkIdx.has(key);
    }

    async set(
        linkData = {},
        options = {}) {

        v(linkData.url, 'url').isString();
        // console.log(`Adding ${linkData.url}`)
        const linkId = idFromUrl(linkData.url);

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
            console.error(e);
            process.exit();
        }
        const linkId = idFromUrl(url);
        return this._store.getValue(linkId);
    }

    async recordFromData(data) {

        let {
            url,
            ...linkData
        } = data;
        v(url, 'url').isString();

        const linkId = idFromUrl(url);

        if (!this._linkIdx.has(linkId)) {
            console.error('here')
            console.error(data)
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
        delete linkData.extern;


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