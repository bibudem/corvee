import {
    canonicalizeUrl
} from '../../core'

// import {
//     Plugin
// } from '../lib/plugin'

export const name = 'http-30x-https-upgrade-loose';

const defaultLevel = 'error';

const defaultOptions = {
    ignoreWww: true
}

export default class Http30xHttpsUpgrade {
    constructor({
        level,
        exclude = false,
        ...options
    } = {}) {
        this.level = level || defaultLevel;
        this.options = {
            ...defaultOptions,
            ...options
        };
        this.exclude = exclude;

        // Immutables properties
        Object.defineProperties(this, {
            code: {
                value: name,
                enumerable: true
            },
            description: {
                value: 'Matches when there is a redirect on a URL on the same domain and an https upgrade scheme. URL paths must differ.',
                enumerable: true
            }
        })

        this.test = (report) => {
            if (!report.finalUrl) {
                return
            }

            if (report.httpStatusCode >= 400) {
                return
            }

            const finalUrl = new URL(canonicalizeUrl(report.finalUrl)),
                url = new URL(canonicalizeUrl(report.url)),
                isHttpsUpgrade = finalUrl.protocol === url.protocol.replace(/:$/, 's:'),
                isSamePathname = finalUrl.pathname === url.pathname,
                domainRegex = new RegExp(`(^w+(\d+)?\.)?${finalUrl.hostname.replace(/\./ig, '\\.')}$`),
                isSameDomain = this.options.ignoreWww ? domainRegex.test(url.hostname) : url.hostname === finalUrl.hostname;

            // if (report.url === 'http://www.biosciencewriters.com/Digital-identifiers-of-scientific-literature-PMID-PMCID-NIHMS-DOI-and-how-to-use-them.aspx') {
            //     console.warn(url)
            //     console.warn(finalUrl)
            //     process.exit()
            // }
            return !isSamePathname &&
                isSameDomain &&
                isHttpsUpgrade &&
                'redirectChain' in report &&
                report.redirectChain.length > 0;
        }
    }
}