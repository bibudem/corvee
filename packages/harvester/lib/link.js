import v from 'io-validate'
import { isObject } from 'underscore'
const extend = require('extend')

const userDataDefaults = {
    parent: 'corvee:url-list',
    reports: [],
    trials: 1,
    level: 0
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
    constructor(uri, data) {

        v(uri).is('object', 'string');
        v(data).is('object', 'string', 'undefined')

        if (typeof data === 'string') {
            data = {
                parent: data
            }
        }

        if (isObject(uri)) {

            if (uri.constructor.name === 'Link') {
                return new Link(uri.url, extend(true, {}, (uri.userData || {}), (data || {})));
            }

            data = uri;

            v(data, 'data').has('url')
            this.url = data.url;
            this.userData = extend(true, {}, userDataDefaults, {
                url: uri
            }, data.userData, data);

            return;
        }

        this.url = uri;
        this.userData = extend(true, {}, userDataDefaults, {
            url: uri
        }, data);
    }
}