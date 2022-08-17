import { ERROR_PROPS, BaseError } from './error'

export const MAIL_ERROR_DEF = {
    name: 'MAIL_ERROR',
    prefix: 'mail',
    props: Object.assign({}, ERROR_PROPS),
    test: function (error) {
        return error instanceof MailError
    }
}

export class MailError extends BaseError {
    constructor(msg) {
        super(msg)
        this.code = 'mail-error'
    }
}

export class MailUnverifiedAddressError extends MailError {
    constructor(msg = 'Email link. Checking only syntax.') {
        super(msg)
        this.code = 'mail-unverified-address'
    }
}

export class MailInvalidSyntaxError extends MailError {
    constructor(msg = 'Email has a bad syntax.') {
        super(msg)
        this.code = 'mail-invalid-syntax'
        this.level = 'error'
    }
}