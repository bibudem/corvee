import PQueue from 'p-queue';

export class RequestQueue extends PQueue {
    constructor() {
        super(...arguments);

    }
}