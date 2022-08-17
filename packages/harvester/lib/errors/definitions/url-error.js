import { PREFIX_SEPARATOR, ERROR_PROPS, BaseError } from '..'

export const URL_ERROR_DEF = {
    name: 'URL_ERROR',
    prefix: 'url',
    props: Object.assign({}, ERROR_PROPS, {
        input: 'data',
    }),
    test: function (err) {
        return 'input' in err || ('code' in err && err.code.startsWith(`url${PREFIX_SEPARATOR}`))
    }
}

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