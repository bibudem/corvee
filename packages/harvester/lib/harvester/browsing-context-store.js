import { isFunction } from 'underscore';
import { normalizeUrl as defaultNormalizeUrlFunction } from '../../../core'

export class BrowsingContextStore {

    constructor(data, normalizeUrl = defaultNormalizeUrlFunction) {

        this._cache = new Map();
        this.normalizeUrl = normalizeUrl

        if (arguments.length === 1) {
            if (isFunction(data)) {
                this.normalizeUrl = data
                data = null
            }
        }

        if (data) {
            Object
                .keys(data)
                .forEach(parentUrl => {
                    console.log(parentUrl)
                    data[parentUrl].forEach(url => {
                        this.addContext(this.normalizeUrl(url), this.normalizeUrl(parentUrl))
                    })
                })
        }
    }

    get size() {
        return this._cache.size;
    }

    getContext(url) {

        if (this._cache.size === 0) {
            return null
        }

        const self = this;

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
            return [...self._cache.keys()].filter(key => {
                return [...self._cache.get(key)].includes(url)
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

        url = this.normalizeUrl(url)
        const result = doFind(url);

        return result.length > 0 ? result : null;
    }

    addContext(url, contextUrl) {
        url = this.normalizeUrl(url);
        contextUrl = this.normalizeUrl(contextUrl);

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

//
//
//
import { readFileSync } from 'fs'
import { join } from 'path'
if (require.main === module) {
    const data = readFileSync(join(__dirname, '..', '..', '..', '..', '..', 'corvee-bib', 'data', '2022-08-29_browsing-contexts.json'), 'utf8')

    const browsingContextStack = new BrowsingContextStore(data)
    console.log(JSON.stringify(browsingContextStack.getContext('https://bib.umontreal.ca/citer/styles-bibliographiques/chicago?tab=5241967'), null, 2))

}