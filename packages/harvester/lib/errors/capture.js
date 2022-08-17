import * as chromiumNetErrors from 'chromium-net-errors'
import createHttpError, { HttpError } from 'http-errors'
import statuses from 'statuses'
import { extend, pick } from 'underscore'
import isNumber from 'is-number'
import { normalizeError } from './normalize'
import { FailedToLaunchError, TimedOutError, BrowserHasDisconnectedError, MailError, CorveeError, PageCrashedError, TargetClosedError, UrlError } from './definitions'
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
    // HttpError class
    //
    if (isNumber(errorOrString) && typeof statuses[errorOrString] !== 'undefined') {
        errorOrString = makeReport(createHttpError(errorOrString));
    }

    if (typeof errorOrString === 'object' && 'message' in errorOrString && /net::ERR_([^ ]+)/i.test(errorOrString.message)) {
        errorOrString = errorOrString.message
    }

    //
    // Puppeteer / crawler errors
    //
    if (typeof errorOrString === 'object' && errorOrString.constructor.name === 'Error') {
        if (errorOrString.message === 'Page crashed!') {
            const pageCrashedError = new PageCrashedError(errorOrString.message)

            return makeReport(extend(normalizeError(pageCrashedError), {
                _from: 'Puppeteer / crawler errors'
            }))
        }

        if (errorOrString.message.startsWith('PuppeteerCrawler: handlePageFunction timed out after')) {
            const timedOutError = new TimedOutError(errorOrString.message)

            return makeReport(extend(normalizeError(timedOutError), {
                _from: 'Puppeteer / crawler errors'
            }))
        }

        if (errorOrString.message === 'Navigation failed because browser has disconnected!') {
            const browserHasDisconnectedError = new BrowserHasDisconnectedError(errorOrString.message)

            return makeReport(extend(normalizeError(browserHasDisconnectedError), {
                _from: 'Puppeteer / crawler errors'
            }))
        }

        if (errorOrString.message === 'Protocol error (Runtime.addBinding): Target closed.') {
            const targetClosedError = new TargetClosedError(errorOrString.message)

            return makeReport(extend(normalizeError(targetClosedError), {
                _from: 'Puppeteer / crawler errors'
            }))
        }
    }

    if (typeof errorOrString === 'string') {

        //
        // Chromium error
        //
        if (/net::ERR_([^ ]+)/i.test(errorOrString)) {
            const desc = /(?:net::ERR_)([^ ]+)/i.exec(errorOrString)[1];

            const ChromiumNetError = chromiumNetErrors.getErrorByDescription(desc);

            const chromiumNetError = new ChromiumNetError();

            return makeReport(extend(normalizeError(chromiumNetError), {
                _from: "typeof errorOrString === 'string'",
                _original: Object.assign({}, chromiumNetError)
            }))
        }

        //
        // Puppeteer / crawler errors
        //
        if (errorOrString.indexOf('Error: Failed to launch chrome!') > 0) {
            const failedToLaunchError = new FailedToLaunchError('Failed to launch chrome.')

            return makeReport(extend(normalizeError(failedToLaunchError), {
                _from: 'Puppeteer / crawler errors'
            }))
        }

        if (
            errorOrString.indexOf('PuppeteerPool: browser.newPage() timed out') > 0
            || errorOrString.indexOf('PuppeteerCrawler: handlePageFunction timed out after') > 0
            || errorOrString.indexOf('TimedOutError: Harvester timed out.') > 0
        ) {
            const timedOutError = new TimedOutError('Harvester timed out.')

            return makeReport(extend(normalizeError(timedOutError), {
                _from: 'Puppeteer / crawler errors'
            }))
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

            return makeReport(extend(normalizeError(errorOrString), {
                _from: 'errorOrString instanceof HttpError'
            }))
        }

        //
        // MailError class
        //
        if (errorOrString instanceof MailError) {

            return makeReport(extend(normalizeError(errorOrString), {
                _from: 'errorOrString instanceof MailError'
            }))
        }

        //
        // Puppeteer TimeoutError class
        //
        if (errorOrString.constructor.name === 'TimeoutError') {

            return makeReport(extend(normalizeError(errorOrString), {
                _from: 'errorOrString.constructor.name === \'TimeoutError\''
            }))
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

            return makeReport(extend(normalizeError(errorOrString), {
                _from: 'errorOrString instanceof UrlError'
            }))
        }

        //
        // Unhandled errors
        //
        const normalizedError = normalizeError(errorOrString);
        const normalizedErrorDefaults = {
            level: 'info',
            _from: 'unhandledError',
            _original: pick(errorOrString, ['code', 'message', 'name', 'stack', 'input', 'type', 'description', 'error'])
        }

        if (typeof normalizedErrorDefaults.code === 'undefined') {
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