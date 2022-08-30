import { STATUS_CODES } from 'http'
import v from 'io-validate'
import _ from 'underscore'
import toIdentifier from 'toidentifier'
import { BaseError } from './error'

export class HttpError extends BaseError {
    constructor(status, statusText) {

        v(status).is('number').equalOrGreaterThan(400).lessThan(600)

        super()

        this.code = `http-${status}`
        this.message = statusText ? statusText : STATUS_CODES[status]
        this.level = 'error'
        this.name = toIdentifier(STATUS_CODES[status])

    }
}