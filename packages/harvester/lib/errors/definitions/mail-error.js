import { BaseError } from './error.js'

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