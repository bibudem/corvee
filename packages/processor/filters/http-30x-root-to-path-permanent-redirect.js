import { Filter } from "./filter.js"

/**
 * @constant
 */
const CODE = 'http-30x-root-to-path-permanent-redirect'

/**
 * @constant
 */
const DESCRIPTION = 'Matches a successful redirect (with a status code < 400) from the root path (e.g. \'https://example.com/\') to a path with the same origin (e.g. \'https://example.com/fr/\'). Returns the root URL.'

const defaultExclude = true
const defaultLevel = 'info'

export default class Http30xRootToPathPermanentRedirect extends Filter {

    /**
     *Creates an instance of Http30xRootToPathPermanentRedirect.
     * @param {object} options
     * @param {import('corvee-processor').FilterLevelType} [options.level='info']
     * @param {boolean} [options.exclude=true]
     * @param {number} [options.priority=0]
     * @param {number} [options.limit=Infinity] Limit the number of detections from this filter.
     */
    constructor({ level = defaultLevel, exclude = defaultExclude, priority, limit } = {}) {

        super(CODE, DESCRIPTION, { level, exclude, priority, limit })

        /**
         * @param {import('corvee-harvester').RecordType} record
         * @param {import('corvee-processor').FilterType} filter
         * @returns {import('corvee-harvester').RecordType | string | boolean | undefined}
         */
        this.test = (record, filter) => {

            if (filter.matches >= this.limit) {
                return
            }

            if (record.finalUrl === null) {
                return
            }

            if (
                Number.isNaN(record.httpStatusCode)
                || record.httpStatusCode > 399
            ) {
                return
            }

            if (
                !Array.isArray(record.redirectChain)
                || record.redirectChain.length === 0
            ) {
                return
            }

            try {

                const url = new URL(record.url)
                const finalUrl = new URL(record.finalUrl)

                return url.pathname === '/'
                    && finalUrl.pathname.length > 1
                    && url.origin === finalUrl.origin

            } catch (error) {
                return false
            }
        }
    }
}