import { paramCase } from 'param-case'

import { Report } from './report.js'
import mozillaErrorList from './mozilla-error-list.js'

export const MOZILLA_ERROR_REGEX = /((XP|NS|SEC)_[A-Z_]+)/

export class MozillaReport extends Report {
  constructor(description) {

    description = MOZILLA_ERROR_REGEX.exec(description)[0];

    const mozillaError = mozillaErrorList.find(error => error.description === description)

    const message = mozillaError ? mozillaError.message : ''
    super(message)
    this.code = paramCase(description)
    this.type = mozillaError ? mozillaError.type : 'unknown'
  }
}