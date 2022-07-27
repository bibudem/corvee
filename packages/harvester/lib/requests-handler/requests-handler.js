// Adapted from https://gitlab.com/vsichka/request-many.npm

import { QueueCount } from './queue-count';

// Constants.
const DEFAULT_MAX_REQUESTS_AMOUNT = 1;
const DEFAULT_WAIT_INTERVAL = 200;
const DEFAULT_DELAY_BEFORE_PARAMS = {
    waitMinMilliseconds: 0,
    waitMaxMilliseconds: 5000
};
// const DEFAULT_ORIGINS_RULE = {
//     origin: '*',
//     waitInternal: DEFAULT_WAIT_INTERVAL
// }
const ERROR_MESSAGE_WRONG_OPTIONS_PARAM = 'Options param should be an object.';

/**
 * Requests handler.
 */
export class RequestsHandler {
    /**
     * Requests handler constructor.
     * @param {number} [maxRequestsAmount] Max records amount.
     */
    constructor({
        maxRequestsAmount = DEFAULT_MAX_REQUESTS_AMOUNT,
        maxConcurrencyPerOrigin = DEFAULT_MAX_REQUESTS_AMOUNT,
        waitInterval = DEFAULT_WAIT_INTERVAL,
        // rules = DEFAULT_ORIGINS_RULE
    }) {
        // Init.
        this.maxRequestsAmount = maxRequestsAmount;
        this.defaultMaxConcurrencyPerOrigin = maxConcurrencyPerOrigin;
        this.waitInterval = waitInterval;
        this.activeRequestsQueueCount = new QueueCount();
        this.activeOriginsRequestsQueueCount = new Map();
        // this.rules = rules;
    }

    get ready() {
        return this.activeRequestsQueueCount.recordsAmount < this.maxRequestsAmount;
    }

    /**
     * Send HTTP request.
     * @param {object} options Request options.
     * @param {string} options.url URL.
     * @param {string} options.method Method.
     * @param {object} [options.headers] Headers in format {"key": "value"}.
     * @param {string} [options.body] Body string.
     * @param {number} [options.timeout] Connection timeout.
     * @param {{count: number, waitMilliseconds: number, httpStatusCodes: number[]}} [options.retries] Retries count.
     * @param {{waitExactMilliseconds}|{waitMinMilliseconds, waitMaxMilliseconds}} [options.delayBefore] Delay before request.
     * @returns {Promise<{res, body}|{error}>} Response object promise.
     */
    async add(cb, options = {}) {
        // Check params and increment requests queue length.
        if (typeof options !== 'object') {
            throw new TypeError(ERROR_MESSAGE_WRONG_OPTIONS_PARAM);
        }
        this.activeRequestsQueueCount.increment();
        console.info(`requestHandler queue: ${this.activeRequestsQueueCount.length}`)
        // Wait if need it.
        await this.waitInQueueIfNeedIt();

        //
        await this.dealyBeforeIfNeedIt(options.delayBefore);

        const ret = await cb();
        this.activeRequestsQueueCount.decrement();
        return ret;
    }

    /**
     * Wait in queue if need it.
     * @private
     */
    async waitInQueueIfNeedIt() {
        // Check requests queue already filled. Decrement queue length for the waiting time.
        while (this.activeRequestsQueueCount.recordsAmount > this.maxRequestsAmount) {
            this.activeRequestsQueueCount.decrement();
            await this.wait();
            this.activeRequestsQueueCount.increment();
        }
    }

    /**
     * Delay before if need it.
     * @private
     * @param {{waitExactMilliseconds: number}|{waitMinMilliseconds: number, waitMaxMilliseconds: number}} [delayBefore] Delay before option.
     */
    async dealyBeforeIfNeedIt(delayBefore) {
        console.warn(delayBefore)
        // Check without delay.
        if (typeof delayBefore !== 'object' && typeof delayBefore !== 'number') {
            return;
        }

        // Check axact delay.
        const waitExactMilliseconds = typeof delayBefore === 'number' ? delayBefore : 'waitExactMilliseconds' in delayBefore && delayBefore.waitExactMilliseconds === 'number' ? delayBefore.waitExactMilliseconds : null;
        if (waitExactMilliseconds) {
            console.log('wait exact milli: ' + waitExactMilliseconds)
            return await this.wait(waitExactMilliseconds);
        }

        // Use min and max delay params.
        const {
            waitMinMilliseconds,
            waitMaxMilliseconds
        } = {
            ...DEFAULT_DELAY_BEFORE_PARAMS,
            ...delayBefore
        };
        const delayMilliseconds = waitMinMilliseconds + (waitMaxMilliseconds - waitMinMilliseconds) * Math.random();
        await this.wait(delayMilliseconds);
    }

    /**
     * Wait.
     * @private
     * @param {number} [milliseconds] Milleseconds to wait.
     */
    async wait(milliseconds = this.waitInterval) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}