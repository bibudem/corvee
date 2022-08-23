import v from 'io-validate'
const extend = require('extend')
import { isObject } from 'underscore'
import { normalizeUrl, console } from '../../core/lib'

const userDataDefaults = {
    url: null,
    finalUrl: null,
    level: 0,
    parent: 'corvee:url-list',
    text: null,
    trials: 1,
    urlData: null,
    size: null,
    redirectChain: [],
    reports: [],
    browsingContextStack: []
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
    constructor(uri, data = {}) {

        v(uri).is('object', 'string');
        v(data).is('object', 'string')

        if (typeof data === 'string') {
            data = {
                parent: normalizeUrl(data)
            }
        }

        data.urlData = data.urlData || uri

        if (isObject(uri)) {

            if (uri.constructor.name === 'Link') {
                return new Link(uri.url, extend(true, { url: uri.url }, data, (uri.userData || {})));
            }

            data = uri;

            v(data, 'data').has('url')

            this.url = normalizeUrl(data.url);
            this.userData = extend(
                true,
                {},
                userDataDefaults,
                {
                    url: uri
                },
                data.userData,
                data);

            delete this.userData.userData

            if (this.userData.parent) {
                this.userData.parent = normalizeUrl(this.userData.parent)
            }

            return;
        }

        this.url = normalizeUrl(uri);
        this.userData = extend(true, {}, userDataDefaults, { url: this.url }, data);

        if (this.userData.parent) {
            this.userData.parent = normalizeUrl(this.userData.parent)
        }
    }
}