import path from 'path'
import Apify from 'apify';

import {
  Harvester
} from '../../lib/harvester'

import saveRecords from "../save-records";

import {
  logErrorCodes
} from '../../lib/utils/log-error-codes'

import {
  console
}
  from '../../../core/lib/logger';

import configs from './config'

configs.startUrl = 'http://132.204.52.60:8080/'
configs.maxRequests = 5

//const errorCodes = new Set();
const harvester = new Harvester(configs);

saveRecords(__dirname, harvester);

logErrorCodes(harvester, path.join(__dirname, './error-codes.json'))

// try {
//     Apify.main(harvester.run());
// } catch (e) {
//     console.error(e)
// }

async function start() {
  try {
    Apify.main(harvester.run());
  } catch (e) {
    console.error(e);
    process.exit();
  }
}

start();