export class Report {
    constructor(code = null, {
        message = null,
        _fixme,
        _from,
        ...data
    } = {}) {
        this.code = code;
        this.finalUrl = null;
        this.url = null;

        if (message) {
            this.message = message;
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