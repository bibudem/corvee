import { isObject, isString } from 'underscore';
import { FailedToLaunchReport, HttpReport, BrowserHasDisconnectedReport, MailReport, MozillaReport, MOZILLA_ERROR_REGEX, NetReport, CorveeReport, PageCrashedReport, TimeoutReport, TargetClosedReport, UrlReport } from './definitions/index.js'
import { console, inspect } from '@corvee/core'

export function captureErrors(data) {
    if (data === null) {
        return data
    }

    if (!Array.isArray(data)) {
        data = [data];
    }
    return data.map(captureError).filter(err => err !== null);
}

export function captureError(error) {

    //
    // Chromium Net error
    //
    if ('message' in error && /net::ERR_([^ ]+)/i.test(error.message)) {

        const netError = new NetReport(error.message);
        netError._from = "/net::ERR_([^ ]+)/i.test(error) (OBJECT)"

        return netError
    }

    //
    // CorveeReport class
    //
    if (error instanceof CorveeReport) {
        return error;
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

        const mozillaError = new MozillaReport(error.message);
        mozillaError._from = "'message' in error && MOZILLA_ERROR_REGEX.test(error.message) (OBJECT)"

        return mozillaError
    }

    //
    // Crawlee errors
    //
    if (error.constructor.name === 'Error') {
        if (/Request blocked - received \d+ status code./.test(error.message)) {
            // Ignore this
            return null
        }
    }

    //
    // Puppeteer TimeoutReport class
    //
    if (error.constructor.name === 'TimeoutReport') {

        error = new TimeoutReport(error.message)

        error._from = 'error.constructor.name === \'TimeoutReport\''

        return error
    }

    //
    // Puppeteer Error class errors
    //
    if (error.constructor.name === 'Error') {
        if (error.message === 'Page crashed!') {

            const pageCrashedError = new PageCrashedReport(error.message)

            pageCrashedError._from = 'Puppeteer / crawler errors (OBJECT)'

            return pageCrashedError
        }

        if (error.message.startsWith('PuppeteerCrawler: handlePageFunction timed out after')
            || error.message.indexOf('Navigation Timeout Exceeded:') > -1) {
            const timeoutError = new TimeoutReport(error.message)

            timeoutError._from = 'Puppeteer / crawler errors (OBJECT)'

            return timeoutError
        }

        if (error.message === 'Navigation failed because browser has disconnected!') {
            const browserHasDisconnectedError = new BrowserHasDisconnectedReport(error.message)

            browserHasDisconnectedError._from = 'Puppeteer / crawler errors (OBJECT)'

            return browserHasDisconnectedError
        }

        if (error.message === 'Protocol error (Runtime.addBinding): Target closed.') {
            const targetClosedError = new TargetClosedReport(error.message)

            targetClosedError._from = 'Puppeteer / crawler errors (OBJECT)'

            return targetClosedError
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
    // Unhandled errors
    //
    return {
        level: 'info',
        code: 'unhandled-error',
        stack: error.stack,
        message: error.message,
        _from: 'unhandledError',
        _fixme: true,
        _original: error,
    }
}