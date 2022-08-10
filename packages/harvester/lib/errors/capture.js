import * as chromiumNetErrors from 'chromium-net-errors'
import createHttpError, { HttpError } from 'http-errors'
import statuses from 'statuses'
import _ from 'underscore'
import isNumber from 'is-number'
import { normalizeError } from './normalize'
import { FailedToLaunchError } from './definitions'
import { TimedOutError } from '.'
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
    // Report class
    //
    if (typeof errorOrString === 'object' && 'constructor' in errorOrString && errorOrString.constructor.name === 'Report') {
        return errorOrString;
    }

    //
    // CorveeError class
    //
    if (typeof errorOrString === 'object' && 'constructor' in errorOrString && errorOrString.constructor.name === 'CorveeError') {
        return errorOrString;
    }

    // 
    if (isNumber(errorOrString) && typeof statuses[errorOrString] !== 'undefined') {
        errorOrString = makeReport(createHttpError(errorOrString));
    }

    if (typeof errorOrString === 'object' && 'message' in errorOrString && /net::ERR_([^ ]+)/i.test(errorOrString.message)) {
        errorOrString = errorOrString.message
    }

    //
    // mailto error
    //
    if (typeof errorOrString === 'object' && 'code' in errorOrString && errorOrString.code.startsWith('mail-')) {

        return errorOrString;
    }

    if (typeof errorOrString === 'string') {

        if (/net::ERR_([^ ]+)/i.test(errorOrString)) {
            const desc = /(?:net::ERR_)([^ ]+)/i.exec(errorOrString)[1];

            const ChromiumNetError = chromiumNetErrors.getErrorByDescription(desc);

            const chromiumNetError = new ChromiumNetError();

            return makeReport(_.extend(normalizeError(chromiumNetError), {
                _from: "typeof errorOrString === 'string'",
                _original: Object.assign({}, chromiumNetError)
            }))
        }

        //
        // Puppeteer / crawler errors
        //

        if (errorOrString.indexOf('Error: Failed to launch chrome!') > 0) {
            let failedToLaunchError = new FailedToLaunchError('Failed to launch chrome.')

            return makeReport(_.extend(normalizeError(failedToLaunchError), {
                _from: 'Puppeteer / crawler errors'
            }))
        }

        if (
            errorOrString.indexOf('PuppeteerPool: browser.newPage() timed out') > 0
            || errorOrString.indexOf('PuppeteerCrawler: handlePageFunction timed out after') > 0
            || errorOrString.indexOf('TimedOutError: Harvester timed out.') > 0
        ) {
            let err = new TimedOutError('Harvester timed out.')

            return makeReport(_.extend(normalizeError(err), {
                _from: 'Puppeteer / crawler errors'
            }))
        }
    }

    if (typeof errorOrString === 'object') {
        switch (errorOrString.constructor.name) {
            // Puppeteer TimeoutError class
            case 'TimeoutError':
                return makeReport(_.extend(normalizeError(errorOrString), {
                    _from: 'errorOrString.constructor.name'
                }))

        }
        // HttpError class
        if (errorOrString instanceof HttpError) {

            return makeReport(_.extend(normalizeError(errorOrString), {
                _from: 'errorOrString instanceof HttpError'
            }))
        }

        // Unhandled errors
        const normalizedError = normalizeError(errorOrString);
        const normalizedErrorDefaults = {
            _from: 'unhandledError',
            _original: _.pick(errorOrString, ['code', 'message', 'name', 'stack', 'input', 'type', 'description', 'error'])
        }

        if (typeof normalizedErrorDefaults.code === 'undefined') {
            normalizedErrorDefaults.code = 'unhandled-error';
            normalizedErrorDefaults._fixme = true;
        }

        return makeReport(_.extend(normalizedError, normalizedErrorDefaults))
    }

    return makeReport({
        _original: errorOrString,
        _isUnknownError: true,
        _fixme: true
    })
}