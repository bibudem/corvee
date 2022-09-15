import { canonicalizeUrl } from '../../core/lib/index.js'

export const name = 'http-30x-https-upgrade-strict';

const defaultLevel = 'warning';

const defaultOptions = {
    ignoreWww: true,
    limit: Infinity
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
        Object.defineProperty(this, 'code', {
            value: name,
            enumerable: true
        })
        Object.defineProperty(this, 'description', {
            value: 'Matches when the only difference between the url and the final url is an https scheme upgrade and/or a missing `www.` sub-domain in the final url.',
            enumerable: true
        })

        this.test = (report, filter) => {
            if (!report.finalUrl) {
                return
            }

            if (report.httpStatusCode >= 400) {
                return
            }

            if (filter.matches >= this.options.limit) {
                return
            }

            const finalUrl = new URL(canonicalizeUrl(report.finalUrl))
            const url = new URL(canonicalizeUrl(report.url))
            const isHttpsUpgrade = finalUrl.protocol === url.protocol.replace(/:$/, 's:')
            const isSameDomain = url.hostname === finalUrl.hostname
            const isSameUrlPath = `${url.pathname}${url.search}` === `${finalUrl.pathname}${finalUrl.search}`
            const isWwwUpgrade = this.options.ignoreWww ? new RegExp(`^w+(\d+)?\.${finalUrl.hostname.replace(/\./ig, '\\.')}$`).test(url.hostname) : false

            if (
                isSameDomain &&
                isSameUrlPath &&
                (isHttpsUpgrade || isWwwUpgrade) &&
                report.redirectChain &&
                report.redirectChain.length > 0
            ) {
                return report.finalUrl;
            };
        }
    }
}