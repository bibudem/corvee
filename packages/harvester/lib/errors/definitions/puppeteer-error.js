import { BaseError } from "./error"

export class PuppeteerError extends BaseError {
  constructor(message) {
    super(message);
    this.code = 'pup-error'
  }
}

export class FailedToLaunchError extends PuppeteerError {
  constructor(message) {
    super(message)
    this.code = 'pup-failed-to-launch'
  }
}

export class TimeoutError extends PuppeteerError {
  constructor(message) {
    super(message)
    this.code = 'pup-timeout'
  }
}

export class BrowserHasDisconnectedError extends PuppeteerError {
  constructor(message) {
    super(message)
    this.code = 'pup-browser-has-disconnected'
  }
}

export class TargetClosedError extends PuppeteerError {
  constructor(message) {
    super(message)
    this.code = 'pup-target-closed'
  }
}

export class PageCrashedError extends PuppeteerError {
  constructor(message) {
    super(message)
    this.code = 'pup-page-crashed'
  }
}

export class ProtocolError extends PuppeteerError {
  constructor(message) {
    super(message)
    this.code = 'pup-protocol-error'
  }
}

export class PupResponseIsNullError extends PuppeteerError {
  constructor(message) {
    super(message)
    this.code = 'pup-response-is-null'
  }
}