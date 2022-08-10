import * as URI from 'uri-js'
import URL from "url"
import apifyUtils from "apify-shared/utilities"
import { isObject } from "underscore"
import { console } from '..'

/**
 * Returns a normalized url
 *
 * @param {string} url                     URL to normalize.
 * @param {object} [opts]                  Options.
 * @param {string} opts.base               URL to serve as base to resolve the url.
 * @param {boolean=true} opts.keepFragment Wether to keep the URL fragment.
 * @param {boolean=false} opts.sortParams  Sort parameters
 *
 * @return {string} A normalized url.
 */

export const normalizeUrl = (url, options) => {
    if (typeof url !== "string" || !url.length) {
        return null;
    }

    // default values
    const defaultOpts = {
        base: null,
        keepFragment: false,
        sortParams: false
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
            } catch (e) {
                console.error(`url could not parsed. ${url}`);
                return e;
            }
        }
    }

    const uriObj = URI.parse(url);

    if (!/^https?$/i.test(uriObj.scheme)) {
        return URI.normalize(url);
    }

    // if (/^https?$/i.test(uriObj.scheme) && uriObj.path && uriObj.path.indexOf('@') > 0) {
    if (options.sortParams && uriObj.query) {
        const params = uriObj.query ?
            uriObj.query
                .split("&")
                .filter(param => {
                    return !/^utm_/.test(param);
                }) : [];
        params.sort()
        uriObj.query = params.join('&')
    }

    if (!options.keepFragment) {
        delete uriObj.fragment
    }

    return URI.serialize(uriObj)
    // }

    // const urlObj = apifyUtils.parseUrl(url.trim());
    // if (!urlObj.protocol || !urlObj.host) {
    //     return null;
    // }

    // const path = urlObj.path.replace(/\/$/, "");
    // const params = urlObj.query ?
    //     urlObj.query
    //         .split("&")
    //         .filter(param => {
    //             return !/^utm_/.test(param);
    //         }) : [];
    // if (options.sortParams) {
    //     params.sort();

    // }
    // let port = "";
    // if (urlObj.port) {
    //     if (
    //         !(urlObj.port === "80" && urlObj.protocol === "http") &&
    //         !(urlObj.port === "443" && urlObj.protocol === "https")
    //     ) {
    //         port = `:${urlObj.port}`;
    //     }
    // }

    // return `${urlObj.protocol
    //     .trim()
    //     .toLowerCase()}://${urlObj.host.trim().toLowerCase()}${port}${path.trim()}${params.length ? `?${params.join("&").trim()}` : ""
    //     }${options.keepFragment && urlObj.fragment ? `#${urlObj.fragment.trim()}` : ""
    //     }`;
}

//
//
//
if (require.main === module) {
    const a = normalizeUrl('HTTP://www.flickr.com:80/photos/37996646802@N01/8139757998?a=b&c=d#allo')
    console.log(a)
}