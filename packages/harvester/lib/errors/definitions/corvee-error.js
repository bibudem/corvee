import { BaseError } from './error'

export class CorveeError extends BaseError {
    constructor(msg) {
        super(msg)
        this.code = 'cv-error'
    }

}