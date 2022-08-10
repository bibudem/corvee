import { ERROR_PROPS } from "./error";

export const PUP_ERROR_DEF = {
  name: 'PUP_ERROR',
  prefix: 'pup',
  props: Object.assign({}, ERROR_PROPS),
  test: function (err) {
    return err instanceof PuppeteerError
  }
};

export class PuppeteerError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.code = 'pup-error'
  }
}

export class FailedToLaunchError extends PuppeteerError {
  constructor(message) {
    super(message)
    this.code = 'pup-failed-to-launch'
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