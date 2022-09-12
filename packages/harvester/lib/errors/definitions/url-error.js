import { BaseError } from './error.js'

export class UrlError extends BaseError {
    constructor(msg = 'Invalid URL') {
        super(msg)
        this.code = 'url-error'
        this.level = 'error'
    }
}

export class UrlInvalidUrlError extends UrlError {
    constructor(url = '') {
        var msg = 'Invalid URL'
        if (url) {
            msg += ': ' + url
        } else {
            msg += '.'
        }
        super(msg)
        this.code = 'url-invalid-url'
        this.level = 'error'
    }
}