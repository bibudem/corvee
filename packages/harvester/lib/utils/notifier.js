import { console } from '@corvee/core'

export default class Notifier {
    /**
     * @param {Array<() => string> | Array<() => Promise<string> >} messages
     */
    constructor(messages = [], {
        enable = true,
        autoStart = false,
        logLevel = 'info',
        logger = console,
        delay = 10000
    } = {}) {
        this.opts = {
            enable,
            autoStart,
            logLevel,
            delay
        }
        this.messages = messages
        this._notifyHandle = null
        this.logger = logger

        if (this.opts.autoStart) {
            this.start()
        }
    }

    start() {
        if (!this._notifyHandle) {
            this._notifyHandle = setInterval(() => {
                if (this.opts.enable) {
                    this.messages.forEach(async msg => this.logger[this.opts.logLevel](await msg()))
                }
            }, this.opts.delay)
        }
    }

    stop() {
        if (this._notifyHandle) {
            clearInterval(this._notifyHandle)
            this._notifyHandle = null
        }
    }

    pause() {
        this.stop()
    }

    resume() {
        this.start()
    }

    enable() {
        this.opts.enable = true
    }

    disable() {
        this.opts.enable = false
    }

    /**
     * @param {{ (): string; (): Promise<string>; }} msg
     */
    addMessage(msg) {
        this.messages.push(msg)
    }
}