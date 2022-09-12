import paramCase from 'param-case'

import { BaseError } from './error.js'
import mozillaErrorList from './mozilla-error-list.js'

export const MOZILLA_ERROR_REGEX = /((XP|NS|SEC)_[A-Z_]+)/

export class MozillaError extends BaseError {
  constructor(description) {

    description = MOZILLA_ERROR_REGEX.exec(description)[0];

    const mozillaError = mozillaErrorList.find(error => error.description === description)

    const message = mozillaError ? mozillaError.message : ''
    super(message)
    this.code = paramCase(description)
    this.type = mozillaError ? mozillaError.type : 'unknown'
  }
}