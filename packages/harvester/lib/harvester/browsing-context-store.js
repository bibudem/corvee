import {
    normalizeUrl
} from '../../../core'

export class BrowsingContextStore {

    get size() {
        return this._cache.size;
    }

    constructor() {
        this._cache = new Map();
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

        const findParentsFor = (url) => {
            return [...this._cache.keys()].filter(key => {
                // console.log([...this._cache.get(key)]);
                // console.log(normalizeUrl(url))
                // console.log([...this._cache.get(key)].includes(normalizeUrl(url)))
                return [...this._cache.get(key)].includes(normalizeUrl(url))
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
                    // return {
                    //     url,
                    //     parents: doFind(url)
                    // }
                })
            }
        }

        const result = doFind(url);
        return result;
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