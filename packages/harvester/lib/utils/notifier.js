import { console } from '../../../core'

export default class Notifier {
    constructor(messages = [], {
        autoStart = false,
        logLevel = 'info',
        logger = console,
        delay = 10000
    }) {
        this.opts = {
            autoStart,
            logLevel,
            delay
        };
        this.messages = messages;
        this._notifyHandle = null;
        this.logger = logger;

        if (this.opts.autoStart) {
            this.start();
        }
    }

    start() {
        if (!this._notifyHandle) {
            this._notifyHandle = setInterval(() => {
                this.messages.forEach(async msg => this.logger[this.opts.logLevel](await msg()))
            }, this.opts.delay)
        }
    }

    stop() {
        if (this._notifyHandle) {
            clearInterval(this._notifyHandle);
            this._notifyHandle = null;
        }
    }

    pause() {
        this.stop();
    }

    resume() {
        this.start();
    }

    addMessage(msg) {
        this.messages.push(msg)
    }
}