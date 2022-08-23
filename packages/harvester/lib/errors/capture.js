import { extend, pick } from 'underscore'
import { normalizeError } from './normalize'
import { FailedToLaunchError, HttpError, BrowserHasDisconnectedError, MailError, NetError, CorveeError, PageCrashedError, TimeoutError, TargetClosedError, UrlError } from './definitions'
import { Report, console, inspect } from '../../../core'

function makeReport(rawData) {
    try {
        const {
            code,
            ...data
        } = rawData;
        return new Report(code, data);
    } catch (e) {
        console.error(inspect(e))
        return rawData;
    }
}

export function captureErrors(data) {
    if (!Array.isArray(data)) {
        data = [data];
    }
    return data.map(captureError).filter(err => err.name !== 'AbortedError');
}

export function captureError(errorOrString) {

    //
    // Chromium Net error
    //
    if (typeof errorOrString === 'object' && 'message' in errorOrString && /net::ERR_([^ ]+)/i.test(errorOrString.message)) {

        const netError = new NetError(errorOrString.message);
        netError._from = "/net::ERR_([^ ]+)/i.test(errorOrString) (OBJECT)"

        return netError
    }

    //
    // Puppeteer / crawler errors
    //
    if (typeof errorOrString === 'object' && errorOrString.constructor.name === 'Error') {
        if (errorOrString.message === 'Page crashed!') {

            const pageCrashedError = new PageCrashedError(errorOrString.message)

            // return makeReport(extend(normalizeError(pageCrashedError), {
            //     _from: 'Puppeteer / crawler errors'
            // }))

            pageCrashedError._from = 'Puppeteer / crawler errors (OBJECT)'

            return pageCrashedError
        }

        if (errorOrString.message.startsWith('PuppeteerCrawler: handlePageFunction timed out after')
            || errorOrString.message.startsWith('Navigation Timeout Exceeded:')) {
            const timeoutError = new TimeoutError(errorOrString.message)

            // return makeReport(extend(normalizeError(timedOutError), {
            //     _from: 'Puppeteer / crawler errors'
            // }))

            timeoutError._from = 'Puppeteer / crawler errors (OBJECT)'

            return timeoutError
        }

        if (errorOrString.message === 'Navigation failed because browser has disconnected!') {
            const browserHasDisconnectedError = new BrowserHasDisconnectedError(errorOrString.message)

            // return makeReport(extend(normalizeError(browserHasDisconnectedError), {
            //     _from: 'Puppeteer / crawler errors'
            // }))

            browserHasDisconnectedError._from = 'Puppeteer / crawler errors (OBJECT)'

            return browserHasDisconnectedError
        }

        if (errorOrString.message === 'Protocol error (Runtime.addBinding): Target closed.') {
            const targetClosedError = new TargetClosedError(errorOrString.message)

            // return makeReport(extend(normalizeError(targetClosedError), {
            //     _from: 'Puppeteer / crawler errors'
            // }))

            targetClosedError._from = 'Puppeteer / crawler errors (OBJECT)'

            return targetClosedError
        }
    }

    if (typeof errorOrString === 'string') {

        //
        // Puppeteer / crawler errors
        //
        if (errorOrString.indexOf('Error: Failed to launch chrome!') > 0) {
            const failedToLaunchError = new FailedToLaunchError('Failed to launch chrome.')

            // return makeReport(extend(normalizeError(failedToLaunchError), {
            //     _from: 'Puppeteer / crawler errors'
            // }))

            failedToLaunchError._from = 'Puppeteer / crawler errors'

            return failedToLaunchError
        }

        if (
            errorOrString.indexOf('PuppeteerPool: browser.newPage() timed out') > 0
            || errorOrString.indexOf('PuppeteerCrawler: handlePageFunction timed out after') > 0
            || errorOrString.indexOf('TimedOutError: Harvester timed out.') > 0
        ) {
            const timedOutError = new TimeoutError('Harvester timed out.')

            // return makeReport(extend(normalizeError(timedOutError), {
            //     _from: 'Puppeteer / crawler errors'
            // }))

            timedOutError._from = 'Puppeteer / crawler errors (STRING)'

            return timedOutError
        }
    }

    if (typeof errorOrString === 'object') {

        //
        // CorveeError class
        //
        if (errorOrString instanceof CorveeError) {
            return errorOrString;
        }

        // HttpError class
        if (errorOrString instanceof HttpError) {

            errorOrString._from = 'errorOrString instanceof HttpError'

            return errorOrString
        }

        //
        // MailError class
        //
        if (errorOrString instanceof MailError) {

            // return makeReport(extend(normalizeError(errorOrString), {
            //     _from: 'errorOrString instanceof MailError'
            // }))

            errorOrString._from = 'errorOrString instanceof MailError'

            return errorOrString
        }

        //
        // Puppeteer TimeoutError class
        //
        if (errorOrString.constructor.name === 'TimeoutError') {

            // return makeReport(extend(normalizeError(errorOrString), {
            //     _from: 'errorOrString.constructor.name === \'TimeoutError\''
            // }))

            errorOrString = new TimeoutError(errorOrString.message)

            errorOrString._from = 'errorOrString.constructor.name === \'TimeoutError\''

            return errorOrString
        }

        //
        // Report class
        //
        if (errorOrString instanceof Report) {
            return errorOrString;
        }

        //
        // UrlError class
        //
        if (errorOrString instanceof UrlError) {

            // return makeReport(extend(normalizeError(errorOrString), {
            //     _from: 'errorOrString instanceof UrlError'
            // }))

            errorOrString._from = 'errorOrString instanceof UrlError'

            return errorOrString
        }

        //
        // Unhandled errors
        //
        const normalizedError = normalizeError(errorOrString);
        const normalizedErrorDefaults = {
            level: 'info',
            _from: 'unhandledError',
            _original: errorOrString,
        }

        if (typeof normalizedError.code === 'undefined') {
            normalizedErrorDefaults.code = 'unhandled-error';
            normalizedErrorDefaults._fixme = true;
        }

        return makeReport(extend(normalizedError, normalizedErrorDefaults))
    }

    return makeReport({
        code: 'unknown-error',
        _original: errorOrString,
        _isUnknownError: true,
        _fixme: true
    })
}