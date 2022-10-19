import { Filter } from "./filter.js"

/**
 * @constant
 */
const CODE = 'http-30x-permanent-redirect-successful'

/**
 * @constant
 */
const DESCRIPTION = 'Matches a successful response after one or more redirections where at least one of that is permanent. Returns the URL of the last permanent redirect.'

/**
 * @type {import('corvee-processor').FilterLevelType}
 */
const defaultLevel = 'info'
const defaultPriority = -1

export default class Http30xPermanentRedirectSuccessful extends Filter {

    constructor({ level = defaultLevel, priority = defaultPriority } = {}) {

        super(CODE, DESCRIPTION, { level, priority })

        /**
         * @param {import('corvee-harvester').RecordType} record
         * @param {import('corvee-processor').FilterType} filter
         * @returns {import('corvee-harvester').RecordType | string | boolean | undefined}
         */
        this.test = (record, filter) => {
            if (record.redirectChain &&
                record.redirectChain.length > 0 &&
                !Number.isNaN(record.httpStatusCode) &&
                record.httpStatusCode < 400
            ) {
                const permanentRedirects = record.redirectChain.filter(r => {
                    // @ts-ignore
                    return [301, 308].includes(r.status) || (r.status === 307 && r.statusText === 'Internal Redirect');
                });

                if (permanentRedirects.length > 0) {

                    // @ts-ignore
                    record.finalUrl = permanentRedirects[permanentRedirects.length - 1].url;
                    record.reports.push({
                        code: this.code,
                        level: this.level,
                        priority: this.priority
                    })
                    return record;
                }
            }
        }
    }
}