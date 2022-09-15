import app from './server.js';
import { Harvester } from '../../lib/harvester/index.js'
import configs from './config.js'

(async () => {

    const harvester = new Harvester(configs);

    const reports = [];

    harvester.on('record', report => reports.push(report))

    const server = app.listen(3000, async () => {
        console.log(`Server listening on port 3000`);
        await harvester.run()
        server.close();
        console.log(reports)
    });
})()