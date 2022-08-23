import { ERROR_PROPS, BaseError } from "./error";

export const PUP_ERROR_DEF = {
  name: 'PUP_ERROR',
  prefix: 'pup',
  props: Object.assign({}, ERROR_PROPS),
  test: function (err) {
    return err instanceof PuppeteerError
  }
};

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
  constructor(message, url) {
    super(message)
    this.code = 'pup-timeout'
    this.url = url
  }
}

export class BrowserHasDisconnectedError extends PuppeteerError {
  constructor(message, url) {
    super(message)
    this.code = 'pup-browser-has-disconnected'
    this.url = url
  }
}

export class TargetClosedError extends PuppeteerError {
  constructor(message, url) {
    super(message)
    this.code = 'pup-target-closed'
    this.url = url
  }
}

export class PageCrashedError extends PuppeteerError {
  constructor(message, url) {
    super(message)
    this.code = 'pup-page-crashed'
    this.url = url
  }
}

export class ProtocolError extends PuppeteerError {
  constructor(message, url) {
    super(message)
    this.code = 'pup-protocol-error'
    this.url = url
  }
}

export class PupResponseIsUndefinedError extends PuppeteerError {
  constructor(message) {
    super(message)
    this.code = 'pup-response-is-undefined'
  }
}

export class PupResponseIsNullError extends PuppeteerError {
  constructor(message) {
    super(message)
    this.code = 'pup-response-is-null'
  }
}