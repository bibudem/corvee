import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import www from './www.js'
import { Harvester } from '../../lib/harvester'
import saveRecords from '../save-records.js'
import { logErrorCodes } from '../../lib/utils/index.js'
import { console } from '../../../core/index.js'
import configs from './config.js'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

const harvester = new Harvester(configs)

saveRecords(DIRNAME, harvester);

logErrorCodes(harvester, join(DIRNAME, './error-codes.json'));

async function start() {
  try {
    await www();
    await harvester.run()
  } catch (e) {
    console.error(e);
    process.exit();
  }
}

start();