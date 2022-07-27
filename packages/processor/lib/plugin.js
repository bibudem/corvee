import v from 'io-validate'

export class Plugin {
    constructor(code = null, {
        description = null,
        level = 'info',
        options = {},
        test = null
    }) {
        v(code, 'code').isString().length().gt(0);
        v(test, 'test').isFunction();
        this.code = code;
        this.level = level;
        this.description = description;
        this.options = options;
    }

    // get code() {
    //     return this._code;
    // }

    // get level() {
    //     return this._level;
    // }
}

export function pluginFactory({
    code = null,
    description = null,
    test = null
} = {}) {
    return function ({
        exclude = false,
        ...options
    } = {}) {
        return {
            code,
            description,
            test,
            exclude
        }
    }
}