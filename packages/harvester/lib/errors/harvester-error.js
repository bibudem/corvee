export class HarvesterError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class UnsupportedSchemeError extends HarvesterError {
    constructor(message, uri) {
        super(`Unsupported scheme: ${message} ${uri ? `at uri <${uri}>` : ''}`);
    }
}