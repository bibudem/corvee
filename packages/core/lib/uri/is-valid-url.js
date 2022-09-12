import v from 'io-validate'
import { re_weburl, re_weburl_dev } from './regex-weburl.js'
import { console, inspect } from '../index.js'

const re = process.env.NODE_ENV === 'production' ? re_weburl : re_weburl_dev

export function isValidUrl(url) {

    v(url, 'url').is('string')

    try {
        new URL(url)
    } catch (error) {
        return false
    }

    try {
        return re.test(url);
    } catch (error) {
        return false
    }
}
