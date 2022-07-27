import { RequestQueue as ApifyRequestQueue } from 'Apify/build/request_queue';

export class RequestQueue extends ApifyRequestQueue {
    constructor() {
        super(...arguments);
    }

    async getNextRequest() {
        await this._ensureHeadIsNonEmpty();

    }
}