import { Report } from './report.js'

export class MailReport extends Report {
    /**
     * @param {string} msg
     */
    constructor(msg) {
        super(msg)
        this.code = 'mail-report'
    }
}

export class MailUnverifiedAddressReport extends MailReport {
    constructor(msg = 'Valid email link. Checking only syntax.') {
        super(msg)
        this.code = 'mail-unverified-address'
    }
}

export class MailInvalidSyntaxReport extends MailReport {
    /**
     * @param {string} email
     */
    constructor(email) {
        let msg = 'Invalid email syntax'
        if (email) {
            msg += ': ' + email
        }
        super(msg)
        this.code = 'mail-invalid-syntax'
        this.level = 'error'
    }
}