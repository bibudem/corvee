export class HarvesterError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name
        this.message = message
    }
}

export class UnsupportedSchemeError extends HarvesterError {
    constructor(message, uri) {
        super(`Unsupported scheme: ${message}${uri ? ` at uri <${uri}>` : ''}`);
        this.code = 'harvester-unsupported-scheme'
        this.uri = uri
    }
}

export class TimedOutError extends HarvesterError {
    constructor(message, url) {
        super(message)
        this.code = 'harvester-timed-out'
        this.url = url
    }
}