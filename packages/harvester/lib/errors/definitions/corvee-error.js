import { BaseError } from './error.js'

export class CorveeError extends BaseError {
    constructor(msg) {
        super(msg)
        this.code = 'cv-error'
    }

}