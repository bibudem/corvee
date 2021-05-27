import {
    constructPseudoUrlInstances
} from 'apify/build/enqueue_links/shared'

export class PseudoUrls {
    constructor(purls) {
        if (purls && !Array.isArray(purls)) {
            purls = [purls];
        }
        this.purls = constructPseudoUrlInstances(purls || [])
    }

    matches(url) {
        return this.purls.length > 0 ? this.purls.some(purl => purl.matches(url)) || url.startsWith('corvee:') : true;
    }
}