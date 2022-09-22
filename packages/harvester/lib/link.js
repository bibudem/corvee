import v from 'io-validate'
import extend from 'extend'
import { isObject, isFunction } from 'underscore'
import { normalizeUrl as n, console } from '@corvee/core'

const userDataDefaults = {
    url: null,
    finalUrl: null,
    level: 0,
    parent: 'corvee:url-list',
    text: null,
    trials: 1,
    urlData: null,
    size: null,
    redirectChain: null,
    reports: null,
    browsingContextStack: null
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