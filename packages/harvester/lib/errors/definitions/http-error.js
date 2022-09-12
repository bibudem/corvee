import { STATUS_CODES } from 'node:http'
import toIdentifier from 'toidentifier'
import { BaseError } from './error.js'

export class HttpError extends BaseError {
    constructor(status, statusText) {

        super()

        this.code = `http-${status}`
        this.message = statusText ? statusText : STATUS_CODES[status] ? STATUS_CODES[status] : ''
        this.level = 'error'
        this.name = STATUS_CODES[status] ? toIdentifier(STATUS_CODES[status]) : 'httpError'

    }
}