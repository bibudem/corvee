import {
    utils as apifyUtils
} from 'apify';
import isMobile from 'ismobilejs'

export function getRandomUserAgent(allowMobile = false) {
    let ua = apifyUtils.getRandomUserAgent();
    if (allowMobile) {
        return ua;
    }
    while (isMobile(ua).any) {
        ua = apifyUtils.getRandomUserAgent();
    }
    return ua;
}