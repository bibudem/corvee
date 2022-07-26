import fs from 'fs'
import path from 'path'
import LRU from 'lru-cache'
import sizeof from 'object-sizeof'
import filesize from 'filesize'
import { console } from '../../../core/lib/logger'

const defaultCacheOptions = {
    max: 40 * 1024 * 1024, // 40Mo
    maxAge: 1000 * 60 * 5, // 5 min stale,
    length: n => sizeof(n),
    dispose: key => {
        console.verbose(`Cache entry expired: ${key}`)
    },
    noDisposeOnSet: true,
    updateAgeOnGet: true
}

function normalizeUrl(url) {
    try {
        const u = new URL(url);
        u.searchParams.delete('ts')
        u.searchParams.delete('referer')
        return u.href
    } catch (e) {
        return url;
    }
}

export function MemCache(opts = {}) {
    const options = Object.assign({}, defaultCacheOptions, opts);
    let f;
    let t;

    const cache = new LRU(options)
    const p = new Proxy({}, {
        set(obj, prop, value) {
            prop = normalizeUrl(prop)
            // console.info(prop)
            cache.set(prop, value)
            return true
            //return Reflect.set(...arguments)
        },
        get(target, prop, receiver) {
            prop = normalizeUrl(prop)
            if (cache.has(prop)) {
                if (f) {
                    f.write(`[${new Date().toISOString()}] reading prop ${prop}\n`)
                }
            }
            return cache.get(prop)
        }
    })

    return p;
}