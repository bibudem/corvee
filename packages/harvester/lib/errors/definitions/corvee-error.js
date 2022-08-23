import { ERROR_PROPS, BaseError } from './error'

export const CORVEE_ERROR_DEF = {
    name: 'CORVEE_ERROR',
    prefix: 'cv',
    props: Object.assign({}, ERROR_PROPS),
    test: function (err) {
        return err instanceof CorveeError;
    }
}

export const errorCodes = {
    'cv-error': '',
    'cv-skip-ignore': 'Ignoring this url based on `config.ignore` settings.',
    'cv-skip-extern': 'Skipping this url based on `config.extern` settings.',
    'cv-unsupported-scheme': 'Unsupported scheme.',
}

export class CorveeError extends BaseError {
    constructor(msg, code, properties) {
        code = code || `${CORVEE_ERROR_DEF.prefix}-error`
        if (code in errorCodes) {
            msg = msg || errorCodes[code];
            super(msg)
            this.code = code

            Object.assign(this, properties)
            return;
        }

        throw new RangeError(`The code provided does not exist: ${code}`)
    }

}