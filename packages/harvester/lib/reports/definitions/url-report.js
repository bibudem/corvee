import { Report } from './report.js'

export class UrlReport extends Report {
    constructor(msg = 'Invalid URL') {
        super(msg)
        this.code = 'url-report'
        this.level = 'error'
    }
}

export class UrlInvalidUrlReport extends UrlReport {
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