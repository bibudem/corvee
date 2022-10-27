import { canonicalizeUrl } from 'corvee-core'
import { Filter } from "./filter.js"

const CODE = 'http-30x-https-upgrade-strict'

const DESCRIPTION = 'Matches when the only difference between the url and the final url is an https scheme upgrade and/or a missing `www.` sub-domain in the final url.'

/**
 * @type {import('corvee-processor').FilterLevelType}
 */
const defaultLevel = 'warning';

/**
 * @typedef {{ [key: string]: any}} DefaultOptions
 * @private
 */

/**
 * @type {DefaultOptions}
 */
const defaultOptions = {
    ignoreWww: true
}

export default class Http30xHttpsUpgradeStrict extends Filter {

    /**
     *Creates an instance of Http30xHttpsUpgradeStrict.
     * @param {object} options
     * @param {import('corvee-processor').FilterLevelType} [options.level='warning']
     * @param {boolean} [options.exclude=false]
     * @param {number} [options.priority=0]
     * @param {number} [options.limit=Infinity] Limit the number of detections from this filter.
     * @param {boolean} [options.ignoreWww=true] Wether to ignore `www` subdomain or not.
     * @memberof Http30xHttpsUpgradeStrict
     */
    constructor({ level = defaultLevel, exclude, priority, limit, ...options } = {}) {

        super(CODE, DESCRIPTION, { level, exclude, priority, limit })

        this.ignoreWww = options.ignoreWww || defaultOptions.ignoreWww

        /**
         * @param {import('corvee-harvester').RecordType} record
         * @param {import('corvee-processor').FilterType} filter
         * @returns {import('corvee-harvester').RecordType | string | boolean | undefined}
         */
        this.test = (record, filter) => {
            if (!record.finalUrl) {
                return
            }

            if (record.httpStatusCode >= 400) {
                return
            }

            if (filter.matches >= this.limit) {
                return
            }

            const finalUrl = new URL(canonicalizeUrl(record.finalUrl))
            const url = new URL(canonicalizeUrl(record.url))
            const isHttpsUpgrade = finalUrl.protocol === url.protocol.replace(/:$/, 's:')
            const isSameDomain = url.hostname === finalUrl.hostname
            const isSameUrlPath = `${url.pathname}${url.search}` === `${finalUrl.pathname}${finalUrl.search}`
            const isWwwUpgrade = this.ignoreWww ? new RegExp(`^w+(\d+)?\.${finalUrl.hostname.replace(/\./ig, '\\.')}$`).test(url.hostname) : false

            if (
                isSameDomain &&
                isSameUrlPath &&
                (isHttpsUpgrade || isWwwUpgrade) &&
                record.redirectChain &&
                record.redirectChain.length > 0
            ) {
                return record.finalUrl;
            };
        }
    }
}