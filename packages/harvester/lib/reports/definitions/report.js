export class Report {
    constructor(msg = '') {
        this.name = this.constructor.name;
        this.message = msg
        this.level = 'info'
        this.code = 'error'

        Error.captureStackTrace(this, this.constructor);

        Object.defineProperty(this, 'stack', {
            enumerable: true,
            value: this.stack
        })
    }
}