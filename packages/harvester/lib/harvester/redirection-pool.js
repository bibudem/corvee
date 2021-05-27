import v from 'io-validate'
import {
    isRelativeUrl
} from '../../../core'

import {
    console
} from '../../../core/lib/logger';

// export class RedirectPool extends Map {
//     constructor() {
//         super();
//     }

//     notify(pupResponse) {
//         // Is the response a redirect?
//         if ([301, 302, 303, 307, 308].includes(pupResponse.status())) {
//             const headers = pupResponse.headers();
//             if ('location' in headers) {
//                 const redirectData = {
//                     source: pupResponse.url(),
//                     url: headers.location,
//                     status: pupResponse.status()
//                 }
//                 super.set(headers.location, redirectData);
//                 return redirectData;
//             }
//         }

//     }

//     getRedirectChain(targetUrl, chain = []) {
//         if (!this.has(targetUrl)) {
//             chain.reverse();
//             return chain;
//         }
//         const redirect = Object.create({}, this.get(targetUrl)),
//             source = redirect.source;

//         delete redirect.source;
//         chain.push(redirect);

//         return this.getRedirectChain(source, chain);
//     }

//     getRedirectForUrl(url) {
//         return super.get(url);
//     }
// }

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