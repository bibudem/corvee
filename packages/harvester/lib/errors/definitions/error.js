export const ERROR_PROPS = {
    code: 'code',
    level: 'level',
    message: 'message',
    name: 'name',
    stack: 'stack',
}

export const ERROR_DEF = {
    name: 'ERROR',
    prefix: 'err',
    props: Object.assign({}, ERROR_PROPS),
    test: function (err) {
        return err instanceof Error
    }
}

export class BaseError extends Error {
    constructor(msg = '') {
        super(msg)
        this.name = this.constructor.name;
        this.level = 'info'
        this.code = 'error'

        Object.defineProperty(this, 'message', {
            enumerable: true,
            value: msg
        })

        Error.captureStackTrace(this, this.constructor);

        Object.defineProperty(this, 'stack', {
            enumerable: true,
            value: this.stack
        })
    }
}