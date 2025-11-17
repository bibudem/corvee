import { PseudoUrl } from '@crawlee/playwright'
import { omit } from 'underscore'

const MAX_ENQUEUE_LINKS_CACHE_SIZE = 1000

/**
 * @ignore
 */
const enqueueLinksPseudoUrlCache = new Map()

export class PseudoUrls {
    constructor(purls = []) {
        if (purls && !Array.isArray(purls)) {
            purls = [purls]
        }
        this.purls = purls.map((item) => {
            // Get pseudoUrl instance from cache.
            let pUrl = enqueueLinksPseudoUrlCache.get(item)
            if (pUrl) return pUrl

            // Nothing in cache, make a new instance.
            // If it's already a PseudoURL, just save it.
            if (item instanceof PseudoUrl) pUrl = item;
            // If it's a string or RegExp, construct a PURL from it directly.
            else if (typeof item === 'string' || item instanceof RegExp) pUrl = new PseudoUrl(item);
            // If it's an object, look for a purl property and use it and the rest to construct a PURL with a Request template.
            else pUrl = new PseudoUrl(item.purl, omit(item, 'purl'))

            // Manage cache
            enqueueLinksPseudoUrlCache.set(item, pUrl)
            if (enqueueLinksPseudoUrlCache.size > MAX_ENQUEUE_LINKS_CACHE_SIZE) {
                const key = enqueueLinksPseudoUrlCache.keys().next().value
                enqueueLinksPseudoUrlCache.delete(key)
            }
            return pUrl
        })
    }

    /**
     * @param {import('@corvee/core').UrlType} url
     */
    matches(url) {
        return this.purls.length > 0 ? this.purls.some(purl => purl.matches(url)) || url.startsWith('corvee:') || url.startsWith('about:') : true
    }
}