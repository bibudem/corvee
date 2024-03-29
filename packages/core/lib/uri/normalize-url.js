import * as URI from 'uri-js'
import { isObject } from "underscore"
import esMain from 'es-main'
import { console } from '../index.js'

/**
 * @typedef {object} NormalizeUrlOptionsType    normaliseUrl function options
 * @param {BaseOptionType} [options.base]              URL to serve as base to resolve the url.
 * @param {KeepFragmentOptionType} [options.keepFragment=true] Wether to keep the URL fragment.
 * @param {boolean} [options.sortParams=false]  Sort parameters
 */

/**
 * @typedef {?string} BaseOptionType URL to serve as base to resolve the url.
 */

/**
 * @typedef {boolean} KeepFragmentOptionType=true Wether to keep the URL fragment.
 */

/**
 * Returns a normalized url
 *
 * @param {string} url URL to normalize.
 * @param {NormalizeUrlOptionsType|KeepFragmentOptionType|BaseOptionType} [options]   Options.
 * @example
 * // returns 'http://www.flickr.com/photos/37996646802@N01/8139757998?a=bar&b=foo'
 * normalizeUrl('HTTP://www.flickr.com:80/photos/37996646802@N01/8139757998?b=foo&a=bar#allo')
 * @example
 * // returns 'http://www.flickr.com/photos/37996646802@N01/8139757998?a=b&c=d#allo'
 * normalizeUrl('HTTP://www.flickr.com:80/photos/37996646802@N01/8139757998?a=b&c=d#allo', true)
 * @example
 * // returns 'http://www.flickr.com/photos/37996646802@N01/8139757998?a=bar&b=foo'
 * normalizeUrl('photos/37996646802@N01/8139757998?b=foo&a=bar', 'HTTP://www.flickr.com:80/')
 * @example
 * // returns 'http://www.flickr.com/photos/37996646802@N01/8139757998?b=foo&a=bar'
 * normalizeUrl('./37996646802@N01/8139757998?b=foo&a=bar#allo', {
 *  base: 'HTTP://www.flickr.com:80/photos',
 *  sortParams: false
 * })
 *
 * @return {import('./abs-url.js').UrlType} A normalized url.
 */

export function normalizeUrl(url, options = {}) {
    if (typeof url !== "string" || !url.length) {
        return null;
    }

    /**
     * @type NormalizeUrlOptionsType
     * @default
     */
    const defaultOpts = {
        base: null,
        keepFragment: false,
        sortParams: true
    };

    if (arguments.length === 2) {
        if (typeof options === "boolean") {
            options = Object.assign({}, defaultOpts, {
                keepFragment: options
            });
        } else if (typeof arguments[1] === "string") {
            options = Object.assign({}, defaultOpts, {
                base: options
            });
        } else if (isObject(arguments[1])) {
            options = Object.assign({}, defaultOpts, options);
        }

        if (options.base) {
            try {
                url = new URL(url, options.base).href;
            } catch (error) {
                console.error(`Could not parse base url ${url}`);
                return error;
            }
        }
    }

    const uriObj = URI.parse(url);

    if (!/^https?$/i.test(uriObj.scheme)) {
        return URI.normalize(url);
    }

    if (uriObj.path) {
        uriObj.path = uriObj.path.replace(/\/((?:index|default)\.(?:cshtml|[sp]html|html?|php|aspx?|do|jsp|cfm))($)/i, '/$2')
    }

    if (uriObj.query) {
        const params = uriObj.query ?
            uriObj.query
                .split("&")
                .filter(param => {
                    return !/^utm_/.test(param);
                }) : [];

        if (options.sortParams) {
            params.sort()
        }

        if (params.length === 0) {
            delete uriObj.query
        } else {
            uriObj.query = params.join('&')
        }
    }

    if (!options.keepFragment) {
        delete uriObj.fragment
    }

    return URI.serialize(uriObj)
}

//
//
//
if (esMain(import.meta)) {
    const a = normalizeUrl('https://www.bib.umontreal.ca/CS/livre-savant/imprime/index.html', true)
    console.log(a)
}