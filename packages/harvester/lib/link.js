import v from 'io-validate'
import extend from 'extend'
import { isObject, isFunction } from 'underscore'
import { normalizeUrl as n, console, inspect } from '@corvee/core'

/**
 * @typedef 
 */
const userDataDefaults = {

    /**
     * @type {import("@corvee/core").UrlType} 
     */
    url: null,

    /**
     * @type {import("@corvee/core").UrlType} 
     */
    finalUrl: null,

    /**
     * @type {number} 
     */
    level: 0,

    /**
     * @type {import("@corvee/core").UrlType} 
     */
    parent: 'corvee:url-list',

    /**
     * @type {string} 
     */
    text: null,

    /**
     * @type {number} 
     */
    trials: 1,

    /**
     * @type {string} 
     */
    urlData: null,

    /**
     * @type {number}
     */
    size: null,

    /**
     * @type {?import('./record.js').RedirectChainType}
     */
    redirectChain: null,

    /**
     * @type {?import('./reports/definitions/report.js').Report[]} 
     */
    reports: null,

    /**
     * @type {?Array<Array<string>>}
     */
    browsingContextStack: null,

    /**
     * @type {?boolean}
     */
    extern: null
}

/*
 * TODO
 *
 * (new Link()?, new Link('')?, new Link(null)? ) should return default values
 */



/**
 * Examples:
 * 
 * new Link('http://www.example.com')
 * 
 * new Link('http://www.example.com', 'http://www.parent.com')
 * 
 * new Link('http://www.example.com, {
 *   parent: 'http://www.parent.com'
 *   prop1: 'some user data'
 * })
 * 
 * new Link({
 *   url: 'http://www.example.com',
 *   userData: {
 *     prop1: 'some user data'
 *   }
 * })
 * 
 */

export class Link {
    /**
     * @param {import('@corvee/core').UrlType | Link} uri
     * @param {userDataDefaults} data
     */
    constructor(uri, data = {}, normalizeUrl = n) {

        if (arguments.length === 2) {
            if (isFunction(data)) {
                normalizeUrl = data
                data = {}
            }
        }

        v(uri).is('object', 'string')
        v(data).is('object', 'string')
        v(normalizeUrl).isFunction()

        if (typeof data === 'string') {
            data = {
                parent: normalizeUrl(data)
            }
        }

        data.urlData = data.urlData || uri

        if (isObject(uri)) {

            if (uri instanceof Link) {

                if (Object.keys(data).length === 0) {
                    return this
                }

                return new Link(uri.url, extend(true, { url: uri.url }, (uri.userData || {}), data), normalizeUrl);
            }

            data = uri;

            v(data, 'data').has('url')

            try {
                this.url = normalizeUrl(data.url)
            } catch (error) {
                console.error(`normalizeUrl error at this.url: ${data.url}. Error: ${inspect(error)}`)
            }

            this.userData = extend(
                true,
                {},
                userDataDefaults,
                {
                    url: this.url
                },
                data.userData,
                data);

            delete this.userData.userData

            if (this.userData.parent) {
                try {
                    this.userData.parent = normalizeUrl(this.userData.parent)
                } catch (error) {
                    console.error(`normalizeUrl error at this.userData.parent: ${this.userData.parent}. Error: ${inspect(error)}`)
                }
            }

            return;
        }

        this.url = normalizeUrl(uri);
        this.userData = extend(true, {}, userDataDefaults, { url: this.url }, data);

        if (this.userData.parent) {
            try {
                this.userData.parent = normalizeUrl(this.userData.parent)
            } catch (error) {
                console.error(`normalizeUrl error at this.userData.parent: ${this.userData.parent}. Error: ${inspect(error)}`)
            }
        }
    }
}