import path from 'path'
import Apify from 'apify';
import app from './server';

import {
    Harvester
}
from '../../lib/harvester'

import configs from './config'

// describe('http status', async () => {
(async () => {

    const harvester = new Harvester(configs);

    const reports = [];

    harvester.on('record', report => reports.push(report))

    const server = app.listen(3000, async () => {
        console.log(`Server listening on port 3000`);
        await Apify.main(await harvester.run());
        server.close();
    });
})()


// })