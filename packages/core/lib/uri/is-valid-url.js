import v from 'io-validate'
import { re_weburl, re_weburl_dev } from './regex-weburl'
import { console, inspect } from '..'

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
