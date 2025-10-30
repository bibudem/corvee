import { FailedToLaunchReport, HttpReport, BrowserHasDisconnectedReport, MailReport, MozillaReport, MOZILLA_ERROR_REGEX, NetReport, CorveeReport, PageCrashedReport, TimeoutReport, TargetClosedReport, UrlReport, Report } from './definitions/index.js'
import { console, inspect } from '@corvee/core'

/**
 * @param {object[] | Error} data
 */
export function captureReports(data) {
    if (data === null) {
        return data
    }

    if (!Array.isArray(data)) {
        data = [data]
    }

    return data.map(captureReport).filter(err => err !== null)
}

/**
 * @param {Report | Error} error
 */
export function captureReport(error) {

    //
    // Chromium Net error
    //
    if ('message' in error && /net::ERR_([^ ]+)/i.test(error.message)) {

        const netReport = new NetReport(error.message)
        netReport._from = "/net::ERR_([^ ]+)/i.test(error) (OBJECT)"

        return netReport
    }

    //
    // CorveeReport class
    //
    if (error instanceof CorveeReport) {
        return error
    }

    // HttpReport class
    if (error instanceof HttpReport) {

        error._from = 'error instanceof HttpReport'

        return error
    }

    //
    // MailReport class
    //
    if (error instanceof MailReport) {

        error._from = 'error instanceof MailReport'

        return error
    }

    //
    // Mozilla error
    //
    if ('message' in error && MOZILLA_ERROR_REGEX.test(error.message)) {

        const mozillaReport = new MozillaReport(error.message)
        mozillaReport._from = "'message' in error && MOZILLA_ERROR_REGEX.test(error.message) (OBJECT)"

        return mozillaReport
    }

    //
    // Crawlee errors
    //
    if (error.constructor.name === 'Error') {
        if (/Request blocked - received \d+ status code./.test(error.message)) {
            // Ignore this
            return null
        }

        if (/^requestHandler timed out after \d+ seconds/.test(error.message)) {
            const timeoutReport = new TimeoutReport(error.message)
            timeoutReport._from = '/^requestHandler timed out after \d+ seconds/.test(error.message)'

            return timeoutReport
        }
    }

    //
    // Puppeteer TimeoutReport class
    //
    if (error.constructor.name === 'TimeoutReport') {

        const timeoutReport = new TimeoutReport(error.message)

        timeoutReport._from = 'error.constructor.name === \'TimeoutReport\''

        return timeoutReport
    }

    //
    // Puppeteer Error class errors
    //
    if (error.constructor.name === 'Error') {
        if (error.message === 'Page crashed!') {

            const pageCrashedReport = new PageCrashedReport(error.message)

            pageCrashedReport._from = 'Puppeteer / crawler errors (OBJECT)'

            return pageCrashedReport
        }

        if (error.message.startsWith('PuppeteerCrawler: handlePageFunction timed out after')
            || error.message.indexOf('Navigation Timeout Exceeded:') > -1) {

            const timeoutReport = new TimeoutReport(error.message)

            timeoutReport._from = 'Puppeteer / crawler errors (OBJECT)'

            return timeoutReport
        }

        if (error.message === 'Navigation failed because browser has disconnected!') {
            const browserHasDisconnectedReport = new BrowserHasDisconnectedReport(error.message)

            browserHasDisconnectedReport._from = 'Puppeteer / crawler errors (OBJECT)'

            return browserHasDisconnectedReport
        }

        if (error.message === 'Protocol error (Runtime.addBinding): Target closed.') {
            const targetClosedReport = new TargetClosedReport(error.message)

            targetClosedReport._from = 'Puppeteer / crawler errors (OBJECT)'

            return targetClosedReport
        }
    }

    //
    // UrlReport class
    //
    if (error instanceof UrlReport) {

        error._from = 'error instanceof UrlReport'

        return error
    }

    //
    // Unhandled reports
    //
    return {
        level: 'info',
        code: 'unhandled-report',
        stack: error.stack,
        message: error.message,
        _from: 'unhandledReport',
        _fixme: true,
        _original: error,
    }
}