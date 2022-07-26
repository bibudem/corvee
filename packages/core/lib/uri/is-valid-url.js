import { re_weburl, re_weburl_dev } from './regex-weburl';
import v from 'io-validate'

const re = process.env.NODE_ENV === 'production' ? re_weburl : re_weburl_dev

export function isValidUrl(url) {
    v(url, 'url').is('string')
    try {
        return re.test(url);
    } catch (e) {
        return false;
    }
}
