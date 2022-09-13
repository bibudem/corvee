import { dirname, join } from 'node:path'
import server from './server.js'
import { Harvester } from '../../lib/harvester/index.js'
import saveRecords from '../save-records.js'
import { logErrorCodes } from '../../lib/utils/index.js'
import { console } from '../../../core/index.js';
import configs from './config.js'
import { fileURLToPath } from 'node:url'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

const harvester = new Harvester(configs);

saveRecords(DIRNAME, harvester)

logErrorCodes(harvester, join(DIRNAME, './error-codes.json'))

async function start() {
    try {
        await server();
        await harvester.run()
    } catch (e) {
        console.error(e);
        process.exit();
    }
}

start();