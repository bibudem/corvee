import path from 'path'
import Apify from 'apify';
import server from './server';

import {
    Harvester
}
    from '../../lib/harvester'

import saveRecords from '../save-records'

import {
    logErrorCodes
} from '../../lib/utils'

import {
    console
}
    from '../../../core/lib/logger';

import configs from './config'

const harvester = new Harvester(configs);

saveRecords(__dirname, harvester)

logErrorCodes(harvester, path.join(__dirname, './error-codes.json'))

try {
    server.listen(3000, () => {
        console.log('Server running.')
        Apify.main(harvester.run());
    });
    console.log(`Server listening on port 3000`);
} catch (e) {
    console.error(e)
    process.exit()
}