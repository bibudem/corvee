import { Report } from "./report.js"

export class PuppeteerReport extends Report {
  constructor(message) {
    super(message);
    this.code = 'pup-report'
  }
}

export class FailedToLaunchReport extends PuppeteerReport {
  constructor(message) {
    super(message)
    this.code = 'pup-failed-to-launch'
  }
}

export class TimeoutReport extends PuppeteerReport {
  constructor(message) {
    super(message)
    this.code = 'pup-timeout'
  }
}

export class BrowserHasDisconnectedReport extends PuppeteerReport {
  constructor(message) {
    super(message)
    this.code = 'pup-browser-has-disconnected'
  }
}

export class TargetClosedReport extends PuppeteerReport {
  constructor(message) {
    super(message)
    this.code = 'pup-target-closed'
  }
}

export class PageCrashedReport extends PuppeteerReport {
  constructor(message) {
    super(message)
    this.code = 'pup-page-crashed'
  }
}

export class ProtocolReport extends PuppeteerReport {
  constructor(message) {
    super(message)
    this.code = 'pup-protocol-error'
  }
}

export class PupResponseIsNullReport extends PuppeteerReport {
  constructor(message) {
    super(message)
    this.code = 'pup-response-is-null'
  }
}