import EventEmitter from 'events'

function domainFor(url) {
    return new URL(url).hostname;
}

function sleep(millis) {
    return new Promise(res => setTimeout(res, millis));
};

import {
    console
} from './logger'

// function RequestQueueProxy(target, self) {
//     return new Proxy(target, {
//         get: async (target, prop, receiver) => {
//             if (typeof prop === 'string' && prop === 'fetchNextRequest') {
//                 let nextRequest = await target[prop]();
//                 if (!nextRequest) {
//                     // there are no more pending requests
//                     return nextRequest;
//                 }

//                 await sleep(500)
//                 console.me(`###### fetchNextRequest ${nextRequest.url}`)
//                 return nextRequest;

//             }
//             return typeof target[prop];


//         }
//     })
// }

export class ThrottleRequests extends EventEmitter {
    constructor(options = {
        minDelayBetweenRequests: 1000,
        maxConcurrency: 100
    }) {
        super();
        this.options = options
        this._activeRequests = []
        this._requestQueuePromises = []
        this._activeDomains = new Map()
        this._activeSlotAvailable = true;
    }

    async fetchNextRequest() {
        console.debug(`active requests: ${this._activeRequests.length}`)
        if (this._activeRequests.length < this.options.maxConcurrency && this._activeSlotAvailable) {

            if (this._requestQueuePromises.length > 0) {
                this._activeSlotAvailable = false;
                const nextQueueItem = this._requestQueuePromises.shift()
                const newActiveRequest = await nextQueueItem._fetchNextRequest.apply(nextQueueItem.requestQueue)
                this._activeRequests.push(newActiveRequest.id)
                console.debug(`[active] ${newActiveRequest.url}`)
                setTimeout(() => {
                    this._activeSlotAvailable = true;
                    console.debug('slot available')
                }, this.options.minDelayBetweenRequests)

                return Promise.resolve(newActiveRequest)
            }

            return Promise.resolve(null)

        }

    }

    throttle(requestQueue) {

        const self = this;

        const _fetchNextRequest = requestQueue.fetchNextRequest;
        requestQueue.fetchNextRequest = async function fetchNextRequest() {
            await sleep(self.minDelayBetweenRequests)

            self._requestQueuePromises.push({
                _fetchNextRequest,
                requestQueue
            })

            return await self.fetchNextRequest()


        }

        const _markRequestHandled = requestQueue.markRequestHandled;
        requestQueue.markRequestHandled = async function markRequestHandled(request) {
            if (request) {
                let data
                try {
                    data = await _markRequestHandled.call(requestQueue, request);
                } catch (e) {
                    console.debug(e)
                    process.exit()
                }
                console.debug('[done]', request.url)

                self._activeRequests = self._activeRequests.filter(url => url !== request.url)

                return Promise.resolve(data)
                //return Promise.resolve(await queueItem._fetchNextRequest.apply(queueItem.requestQueue))
            }
            return Promise.resolve(null)
        }

        return requestQueue
    }

    // _start(url) {
    //     const domain = domainFor(url);

    //     if (throttlee.active.length > this.options.maxActiveRequestsPerDomain) {
    //         throw new Error(`Cannot start new request. This domain has reached maximum active requests: ${domain}`)
    //     }

    //     throttlee.active.add(url)

    //     setTimeout(() => {
    //         this.emit('start', url)
    //     }, this.options.minDelayBetweenRequests)
    // }

    // add(url, data) {
    //     const domain = domainFor(url);

    //     if (typeof this._throttlee[domain] === 'undefined') {
    //         this._throttlee[domain] = {
    //             active: new Set(),
    //             waiting: new Map()
    //         }
    //     }

    //     const throttlee = this._throttlee[domain];

    //     if (throttlee.active.length > this.options.maxActiveRequestsPerDomain) {
    //         throttlee.waiting.add(url)
    //         return;
    //     }

    //     this._start(url)


    // }

    // notify(action, url) {
    //     const domain = domainFor(url)
    //     const throttlee = this._throttlee[domain];
    //     if (action === 'done') {
    //         if (throttlee.active.delete(url)) {
    //             this._start(throttlee.waiting.shift())
    //         }
    //     }
    // }
}