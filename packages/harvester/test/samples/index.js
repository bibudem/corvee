import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Harvester } from '../../lib/harvester/index.js'
import saveRecords from '../save-records.js'
import { logErrorCodes } from '../../lib/utils/log-error-codes.js'
import { console } from '../../../core/index.js'
import configs from './config.js'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

configs.startUrl = 'http://132.204.52.60:8080/'
configs.maxRequests = 5

//const errorCodes = new Set();
const harvester = new Harvester(configs);

saveRecords(DIRNAME, harvester);

logErrorCodes(harvester, join(DIRNAME, './error-codes.json'))

async function start() {
  try {
    await harvester.run()
  } catch (e) {
    console.error(e);
    process.exit();
  }
}

start();