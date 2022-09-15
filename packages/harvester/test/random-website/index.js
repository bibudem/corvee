import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import www from './www.js'
import { Harvester } from '../../lib/harvester/index.js'
import saveRecords from '../save-records.js'
import { console } from '../../../core/index.js'
import configs from './config.js'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

const harvester = new Harvester(configs);

harvester.on('progress', function (info) {
  console.warn(`${info.handledPercent} completed.`)
})

saveRecords(DIRNAME, harvester)

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