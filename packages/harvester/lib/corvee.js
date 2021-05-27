import EventEmitter from 'events'
import Apify from 'apify';
import {
    Harvester
} from './harvester'

import {
    console
} from '../../core/lib/logger';

export class Corvee extends EventEmitter {

    get config() {
        return this._harvester.config;
    }

    constructor(config = {}) {
        super();
        this._harvester = new Harvester(config);

        this._harvester.on('record', record => {
            this.emit('record', record)
        })

        this._harvester.on('end', () => {
            this.emit('end')
        })

        this._harvester.on('response', ev => {
            // console.z(ev.data)
        })
    }

    async run() {
        Apify.main(this._harvester.run());
    }

    async pause(timeout) {
        await this._harvester.pause(timeout);
    }

    resume() {
        this._harvester.resume();
    }

    addUrl(urls) {
        this._harvester.addUrl(urls);
    }

    setLinkParser(fn) {
        this._harvester.setLinkParser(fn);
    }

    setPlugins(plugins) {
        this._harvester.setPlugins(plugins)
    }
}