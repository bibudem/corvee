import { console } from '../index.js'

/**
 * @typedef {string} UrlType An url.
 */

/**
 * @param {UrlType} url
 * @param {UrlType | import("url").URL} baseUrl
 */
export function absUrl(url, baseUrl) {
    let newUrl;
    try {
        newUrl = new URL(url, baseUrl)
        return newUrl.href;
    } catch (e) {
        console.error(e)
        process.exit()
    }
}