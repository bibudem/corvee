import { STATUS_CODES } from 'node:http'
import toIdentifier from 'toidentifier'
import { isNumber } from 'underscore'
import { Report } from './report.js'

/**
 * @export
 * @class HttpReport
 * @extends {Report}
 */
export class HttpReport extends Report {

    /**
     *Creates an instance of HttpReport.
     * @param {number} status
     * @param {string} [statusText]
     * @memberof HttpReport
     */
    constructor(status, statusText) {

        if (!isNumber(status)) {
            throw new TypeError(`The status argument ${status} must be a number.`)
        }

        super()

        this.code = `http-${status}`
        this.message = statusText ? statusText : STATUS_CODES[status] ? STATUS_CODES[status] : ''
        this.level = status < 300 ? 'info' : status === 301 || status === 308 ? 'error' : status < 400 ? 'info' : status === 429 ? 'warning' : 'error'
        this.name = STATUS_CODES[status] ? toIdentifier(STATUS_CODES[status]) : 'httpReport'

    }
}