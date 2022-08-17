import { BaseError } from "./definitions"

export class HarvesterError extends BaseError {
    constructor(message) {
        super(message);
        this.code = 'harvester-error'
    }
}

export class UnsupportedSchemeError extends HarvesterError {
    constructor(message, uri) {
        super(`Unsupported scheme: ${message}${uri ? ` at uri <${uri}>` : ''}`);
        this.code = 'harvester-unsupported-scheme'
        this.uri = uri
    }
}