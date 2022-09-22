import { Report } from './report.js'

export class MailReport extends Report {
    constructor(msg) {
        super(msg)
        this.code = 'mail-report'
    }
}

export class MailUnverifiedAddressReport extends MailReport {
    constructor(msg = 'Email link. Checking only syntax.') {
        super(msg)
        this.code = 'mail-unverified-address'
    }
}

export class MailInvalidSyntaxReport extends MailReport {
    constructor(msg = 'Email has a bad syntax.') {
        super(msg)
        this.code = 'mail-invalid-syntax'
        this.level = 'error'
    }
}