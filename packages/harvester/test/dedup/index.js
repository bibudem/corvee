import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import server from './server.js'
import { Harvester } from '../../lib/harvester/index.js'
import saveRecords from '../save-records.js'
import { logErrorCodes } from '../../lib/utils/index.js'
import { console } from '../../../core/index.js';
import configs from './config.js'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

const harvester = new Harvester(configs);

saveRecords(DIRNAME, harvester)

logErrorCodes(harvester, join(DIRNAME, './error-codes.json'))

try {
    server.listen(3000, async () => {
        console.log('Server running.')
        await harvester.run()
    });
    console.log(`Server listening on port 3000`);
} catch (e) {
    console.error(e)
    process.exit()
}