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