export const ERROR_PROPS = {
    message: 'message',
    code: 'code',
    stack: 'stack',
    level: 'level'
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
        this.message = msg
        Error.captureStackTrace(this, this.constructor);
    }
}