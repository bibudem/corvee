import { URL } from 'url'
import { normalizeUrl } from '.'

export function canonicalizeUrl(url = '') {
    const normalized = new URL(normalizeUrl(url.toLowerCase(), {
        keepFragment: false,
        sortParams: true
    }))

    const reIndex = normalized.search.length ? /(index|default|welcome)(\..+)?/g : /\/(index|default|welcome)(\..+)?/g

    normalized.pathname = normalized.pathname.replace(reIndex, '');

    return normalized.href;
}