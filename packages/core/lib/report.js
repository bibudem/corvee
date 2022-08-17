export class Report {
    constructor(code = null, {
        message = null,
        level = null,
        stack,
        _fixme,
        _from,
        ...data
    } = {}) {
        this.code = code;

        if (level) {
            this.level = level
        }

        if (message) {
            this.message = message;
        }

        if (stack) {
            this.stack = stack;
        }

        if (_fixme) {
            this._fixme = _fixme
        }

        if (_from) {
            this._from = _from
        }

        if (Object.keys(data).length > 0) {
            this.data = data;
        }
    }
}