import { inspect } from 'util'
import * as chromiumNetErrors from 'chromium-net-errors';
import createHttpError, { HttpError } from 'http-errors'
import statuses from 'statuses'
import _ from 'underscore'
import isNumber from 'is-number'
import { normalizeError } from './normalize'
import { Report } from '../../../processor/lib/report'

import { console } from '../../../core/lib/logger';

function makeReport(rawData) {
    try {
        const {
            code,
            ...data
        } = rawData;
        return new Report(code, data);
    } catch (e) {
        console.error(e)
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
    console.debug(inspect(errorOrString))

    if (typeof errorOrString === 'object' && 'constructor' in errorOrString && errorOrString.constructor.name === 'Report') {
        return errorOrString;
    }

    // 
    if (isNumber(errorOrString) && typeof statuses[errorOrString] !== 'undefined') {
        errorOrString = makeReport(createHttpError(errorOrString));
    }

    if (typeof errorOrString === 'object' && 'message' in errorOrString && /net::ERR_([^ ]+)/i.test(errorOrString.message)) {
        errorOrString = errorOrString.message
    }

    if (typeof errorOrString === 'string' && /net::ERR_([^ ]+)/i.test(errorOrString)) {

        const desc = /(?:net::ERR_)([^ ]+)/i.exec(errorOrString)[1];

        const Err = chromiumNetErrors.getErrorByDescription(desc);

        let err = new Err();

        return makeReport(_.extend(normalizeError(err), {
            _from: 'typeof errorOrString === \'string\'',
            _original: Object.assign({}, err)
        }))
    }

    if (typeof errorOrString === 'object') {
        //console.me(normalizeError(errorOrString))
        switch (errorOrString.constructor.name) {
            case 'TimeoutError':
                // Puppeteer TimeoutError class
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
        original: errorOrString,
        _isUnknownError: true,
        _fixme: true
    })
}