import { canonicalizeUrl } from '@corvee/core'
import { Filter } from './filter.js'

const CODE = 'http-30x-https-upgrade-loose'
const DESCRIPTION = 'Matches when there is a redirect on a URL on the same domain and an https upgrade scheme. URL paths must differ.'
/**
 * @type {import('corvee-processor').FilterLevelType}
 */
const defaultLevel = 'error'
const defaultPriority = 0

const defaultOptions = {
    ignoreWww: true
}

export default class Http30xHttpsUpgradeLoose extends Filter {
    /**
     * Creates an instance of Http30xHttpsUpgradeLoose.
     * @param {object} options
     * @param {import('corvee-processor').FilterLevelType} [options.level=warning]
     * @param {boolean} [options.exclude=false]
     * @param {number} [options.priority=1]
     * @param {boolean} [options.ignoreWww=true] Wether to ignore `www` subdomain or not.
     * @param {number} [options.limit] Limit the number of detections from this filter.
     * @memberof Http30xHttpsUpgradeLoose
     */
    constructor({ level = defaultLevel, exclude = false, priority = defaultPriority, limit, ...options } = {}) {

        super(CODE, DESCRIPTION, { level, exclude, priority, limit })

        this.options = {
            ...defaultOptions,
            ...options
        }

        /**
         * @param {import('corvee-harvester').RecordType} record
         * @returns {import('corvee-harvester').RecordType | string | boolean | undefined}
         */
        this.test = (record) => {
            if (!record.finalUrl) {
                return
            }

            if (record.httpStatusCode >= 400) {
                return
            }

            const finalUrl = new URL(canonicalizeUrl(record.finalUrl)),
                url = new URL(canonicalizeUrl(record.url)),
                isHttpsUpgrade = finalUrl.protocol === url.protocol.replace(/:$/, 's:'),
                isSamePathname = finalUrl.pathname === url.pathname,
                domainRegex = new RegExp(`(^w+(\d+)?\.)?${finalUrl.hostname.replace(/\./ig, '\\.')}$`),
                isSameDomain = this.options.ignoreWww ? domainRegex.test(url.hostname) : url.hostname === finalUrl.hostname

            return !isSamePathname &&
                isSameDomain &&
                isHttpsUpgrade &&
                record.redirectChain &&
                record.redirectChain.length > 0
        }
    }
}