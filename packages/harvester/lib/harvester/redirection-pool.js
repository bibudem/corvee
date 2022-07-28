import v from 'io-validate'
import { isRelativeUrl } from '../../../core'
import { console } from '../../../core';

export function setRedirectChain(record, redirectChain) {
    if (redirectChain.length === 0) {
        return;
    }

    let previousUrl = record.url;

    record.redirectChain = redirectChain.map(item => {

        v(item, 'request').got('response');

        const res = item.response(),
            headers = res.headers(),
            status = res.status(),
            statusText = res.statusText();
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