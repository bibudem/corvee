// function notify() {
//     this._notifyHandle = setInterval(() => {
//         const end = Date.now();
//         const duration = humanDuration(end - this._startTime)
//         console.me(`[notify] Execution time: ${duration}, current processes: ${this.crawlers.find(item => item.constructor.name === 'PuppeteerCrawler').basicCrawler.autoscaledPool.currentConcurrency}`)
//     }, this.config.notify)
// }

export default class Notifier {
    constructor(messages = [], {
        autoStart = false,
        logLevel = 'info',
        logger = console,
        delay = 1000
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