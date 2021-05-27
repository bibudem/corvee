import * as chromiumNetErrors from 'chromium-net-errors';
import createHttpError, {
    HttpError
} from 'http-errors'
import statuses from 'statuses'
import _ from 'underscore'
import constantCase from 'constant-case'
import isNumber from 'is-number'
import {
    console
} from '../core/lib/logger';

const commonErrorProps = {
    name: 'name',
    message: 'message',
    code: 'code',
    stack: 'stack'
}

const ERROR_DEF = {
    name: 'ERROR',
    props: Object.assign({}, commonErrorProps)
};

const CHROMIUM_NET_ERRORS_DEF = {
    name: 'CHROMIUM_NET_ERRORS',
    props: Object.assign({}, commonErrorProps, {
        name: 'name',
        message: 'message',
        code: 'errno',
        description: 'code',
        type: 'type'
    }),
    test: function (err) {
        return err instanceof chromiumNetErrors.ChromiumNetError;
    }
};

const HTTP_ERRORS_DEF = {
    name: 'HTTP_ERRORS',
    props: {
        name: 'name',
        message: 'message',
        status: {
            prop: 'code',
            val: oldVal => `HTTP_${constantCase(oldVal)}`
        }
    },
    test: function (err) {
        return err instanceof HttpError
    }
}

const TIMEOUT_ERROR_DEF = {
    name: 'TIMEOUT_ERROR',
    props: Object.assign({}, commonErrorProps),
    test: function (err) {
        return err.constructor.name === 'TimeoutError'
    }
}

// const TYPE_ERROR = {
//     name: 'TYPE_ERROR',
//     props: Object.assign({}, commonErrorProps, {
//         input: 'input'
//     }),
//     test: function (err) {
//         return err.constructor.name === 'TypeError'
//     }
// }

const NODE_ERROR_DEF = {
    name: 'NODE_ERROR',
    props: Object.assign({}, commonErrorProps, {
        input: 'input'
    }),
    test: function (err) {
        return 'code' in err && typeof err.code === 'string' && err.code.startsWith('ERR_')
    }
}

const SYSTEM_ERROR_DEF = {
    name: 'SYSTEM_ERROR',
    props: Object.assign({}, commonErrorProps, {

        // SystemError
        adress: 'adress',
        dest: 'dest',
        errno: 'errno',
        info: 'info',
        path: 'path',
        port: 'port',
        syscall: 'syscall'
    }),
    test: function (err) {
        return 'syscall' in err;
    }
}

const OPENSSL_ERROR_DEF = {
    name: 'OPENSSL_ERROR',
    props: Object.assign({}, commonErrorProps, {

        // OpenSSL Errors
        opensslErrorStack: 'opensslErrorStack',
        function: 'function',
        library: 'library',
        reason: 'reason'
    }),
    test: function (err) {
        return 'opensslErrorStack' in err;
    }
}

export function normalizeError(err) {
    const ret = {};
    const errorDefs = [CHROMIUM_NET_ERRORS_DEF, HTTP_ERRORS_DEF, TIMEOUT_ERROR_DEF, SYSTEM_ERROR_DEF, OPENSSL_ERROR_DEF, NODE_ERROR_DEF];
    let translator = ERROR_DEF;

    for (const errorDef of errorDefs) {
        if (errorDef.test(err)) {
            console.me(`is ${errorDef.name}`);
            translator = errorDef.props;
            break;
        }
    }

    // console.me(err)
    Object.keys(translator).forEach(oldProp => {
        if (typeof (err[oldProp]) !== 'undefined') {
            const translatorProp = translator[oldProp];
            if (typeof translatorProp === 'string') {
                ret[translatorProp] = err[oldProp]
            } else {
                ret[translatorProp.prop] = translatorProp.val(err[oldProp])
            }
        }
    })

    return ret;
}

export function captureErrors(data) {
    if (!Array.isArray(data)) {
        data = [data];
    }
    return data.map(captureError).filter(err => err.name !== 'AbortedError');
}

export function captureError(errorOrString) {
    console.warn('======================= NETERROR =======================')

    // 
    if (isNumber(errorOrString) && typeof statuses[errorOrString] !== 'undefined') {
        errorOrString = createHttpError(errorOrString);
    }

    if (typeof errorOrString === 'string' && /net::ERR_([^ ]+)/i.test(errorOrString)) {
        console.me(errorOrString)
        const desc = /(?:net::ERR_)([^ ]+)/i.exec(errorOrString)[1];
        //console.warn(desc);
        const Err = chromiumNetErrors.getErrorByDescription(desc);
        //console.warn(Err);
        //if (Err.name !== 'UnknownError') {
        let err = new Err();
        //err = JSON.parse(JSON.stringify(err))
        //err.isUnknownError = false;
        console.me(err);
        return {
            _from: 'typeof errorOrString === \'string\'',
            original: Object.assign({}, err),
            normalized: normalizeError(err)
        }
        //}
    }

    if (typeof errorOrString === 'object') {
        //console.me(normalizeError(errorOrString))
        switch (errorOrString.constructor.name) {
            case 'TimeoutError':
                // Puppeteer TimeoutError class
                const ret = _.pick(errorOrString, 'name', 'message', 'stack');
                ret.code = 'TIMEOUT_ERROR'
                return ret;
        }
        // HttpError class
        if (errorOrString instanceof HttpError) {
            var props = [];
            for (var prop in errorOrString) {
                if (!['expose', 'statusCode'].includes(prop)) {
                    props.push(prop)
                }
            }
            return _.extend(_.pick(errorOrString, props), {
                name: errorOrString.constructor.name
            })
        }

        const unhandledError = {
            _from: 'unhandledError',
            original: _.pick(errorOrString, ['code', 'message', 'name', 'stack', 'input', 'type', 'description', 'error']),
            normalized: normalizeError(errorOrString)
        }

        unhandledError.fixme = true

        return unhandledError;
    }

    return {
        original: errorOrString,
        isUnknownError: true
    }
}