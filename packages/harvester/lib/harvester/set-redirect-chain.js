import v from 'io-validate'
import { isRelativeUrl } from '../../../core/lib'
import { console } from '../../../core/lib';

export function setRedirectChain(record, redirectChain) {
    if (redirectChain.length === 0) {
        return null;
    }

    let previousUrl = record.url;

    record.redirectChain = redirectChain.map(item => {

        v(item, 'request').got('response');

        const response = item.response(),
            headers = response.headers(),
            status = response.status(),
            statusText = response.statusText();
        let url;

        v(headers, 'response.headers()').has('location').isString();

        url = isRelativeUrl(headers.location) ? (new URL(headers.location, previousUrl)).href : headers.location;

        previousUrl = url;

        return {
            url,
            status: status,
            statusText: statusText
        }
    })

    record.url = redirectChain[0].url();
}