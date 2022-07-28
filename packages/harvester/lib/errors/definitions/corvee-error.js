import { ERROR_PROPS } from './error'

export const CORVEE_ERROR_DEF = {
    name: 'CORVEE_ERROR',
    prefix: 'cv',
    props: Object.assign({}, ERROR_PROPS, {
        // name: 'name',
        message: 'message',
        code: 'code'
    }),
    test: function (err) {
        return err instanceof CorveeError;
    }
}

export const errorCodes = {
    'error': '',
    'skip-ignore': 'Ignoring this url based on `config.ignore` settings.',
    'skip-extern': 'Skipping this url based on `config.extern` settings.',
    'unsupported-scheme': 'Unsupported scheme.'
}

export class CorveeError extends Error {
    constructor(msg, code, properties) {
        code = code || `${CORVEE_ERROR_DEF.prefix}-error`
        if (code in errorCodes) {
            msg = msg || errorCodes[code];
            super(msg)
            this.name = this.constructor.name;

            this.code = code;
            //this.code = `${CORVEE_ERROR_DEF.prefix}-${code}`;
            Object.assign(this, properties)
            Error.captureStackTrace(this, this.constructor);
            return;
        }

        throw new RangeError(`The code provided does not exist: ${code}`)
    }

}

// export function createCorveeError(msg, code, properties) {
//     if (code in errorCodes) {
//         msg = msg || errorCodes[code];
//         const e = new CorveeError(msg)
//         e.code = `${CORVEE_ERROR_DEF.prefix}-${code}`;
//         Object.assign(e, properties)
//         return e;
//     }

//     throw new RangeError(`The code provided does not exist: ${code}`)
// }