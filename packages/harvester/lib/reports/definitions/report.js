/**
 *
 *
 * @export
 * @class Report
 */
export class Report {

    /**
     *Creates an instance of Report.
     * @param {string} [msg='']
     * @memberof Report
     */
    constructor(msg = '') {
        this.name = this.constructor.name;
        this.message = msg
        this.level = 'info'
        this.code = 'error'
        this.stack = undefined
        this._from = undefined
        this._message = undefined

        Error.captureStackTrace(this, this.constructor);

        Object.defineProperty(this, 'stack', {
            enumerable: true,
            value: this.stack
        });
    }
}