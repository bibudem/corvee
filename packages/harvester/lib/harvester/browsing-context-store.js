import { isFunction } from 'underscore';
import { normalizeUrl } from '../../../core'

export class BrowsingContextStore {

    constructor(data, normalizeUrl = normalizeUrl) {

        if (arguments.length === 1) {
            if (isFunction(data)) {
                normalizeUrl = data
                data = null
            }
        }

        this._cache = new Map();

        if (data) {
            Object
                .keys(data)
                .forEach(parentUrl => {
                    data[parentUrl].forEach(url => {
                        this.addContext(normalizeUrl(url), normalizeUrl(parentUrl))
                    })
                })
        }
    }

    get size() {
        return this._cache.size;
    }

    getContext(url) {

        // return contextStack;

        /*

        http://extern.com/video

        [
            {
                url: 'http://guides.bib.umontreal.ca/123',
                parents: [
                    {
                        url: 'http://bib.umontreal.ca/aaa'
                    }
                ]
            }
        ]

        */

        function findParentsFor(url) {
            return [...this._cache.keys()].filter(key => {
                return [...this._cache.get(key)].includes(url)
            })
        }

        function doFind(url) {
            const parents = findParentsFor(url);
            if (parents.length > 0) {
                return parents.map(url => {
                    const ret = [url],
                        parents = doFind(url);
                    if (parents && parents.length > 0) {
                        ret.push(parents)
                    }
                    return ret;
                })
            }
            return []
        }

        url = normalizeUrl(url)
        const result = doFind(url);

        return result.length > 0 ? result : null;
    }

    addContext(url, contextUrl) {
        url = normalizeUrl(url);
        contextUrl = normalizeUrl(contextUrl);

        const context = this._cache.get(contextUrl) || new Set();

        context.add(url);

        this._cache.set(contextUrl, context)
    }

    entries() {
        return Array.from(this._cache.entries()).reduce((obj, entry) => {
            obj[entry[0]] = [...entry[1].values()];
            return obj;
        }, {})
    }
}