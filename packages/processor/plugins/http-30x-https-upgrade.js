import { canonicalizeUrl } from '../../core'

export const name = 'http-30x-https-upgrade';

const defaultLevel = 'warning';

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
        Object.defineProperty(this, 'code', {
            value: name,
            enumerable: true
        })
        Object.defineProperty(this, 'description', {
            value: 'Matches when the only difference between the url and the final url is an https scheme upgrade and/or a missing `www.` sub-domain in the final url.',
            enumerable: true
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
                isWwwUpgrade = this.options.ignoreWww ? new RegExp(`^w+(\d+)?\.${finalUrl.hostname.replace(/\./ig, '\\.')}$`).test(url.hostname) : false,
                isSameUrlPath = `${url.pathname}${url.search}` === `${finalUrl.pathname}${finalUrl.search}`;

            if (isSameUrlPath &&
                (isHttpsUpgrade || isWwwUpgrade) &&
                'redirectChain' in report &&
                report.redirectChain.length > 0) {
                return report.finalUrl;
            };
        }
    }
}