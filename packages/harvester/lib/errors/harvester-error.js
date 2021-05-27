import errorEx from 'error-ex'

//export const HarvesterError = errorEx('HarvesterError')

export class HarvesterError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class UnsupportedSchemeError extends HarvesterError {
    constructor(message, uri) {
        super(`Unsupported scheme: ${message} ${uri ? `at uri <${uri}>`: ''}`);
        //this.name = this.constructor.name;
    }
}