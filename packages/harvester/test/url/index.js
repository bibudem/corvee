import path from 'path'
import Apify from 'apify';
//import server from './server';

import {
    Harvester
} from '../../lib/harvester'

import {
    Link
} from '../../lib/link'

import {
    logErrorCodes
} from '../utils/log-error-codes'

import {
    console
}
    from '../../../core/lib/logger';

import urlList from './url-list'

import configs from './config'

//const errorCodes = new Set();
const harvester = new Harvester(configs);

logErrorCodes(harvester, path.join(__dirname, './error-codes.json'))

const urls = urlList
    //.filter(item => item.valid)
    //.filter(item => item.url === 'http://223.255.255.254')
    .map(({
        url,
        valid: isValid
    }) => {
        return new Link(url, {
            isValid
        })
    })

harvester.addUrl(urls)

try {
    //server.listen(3000, () => {
    //console.log('Server running.')
    Apify.main(harvester.run());
    //});
    //console.log(`Server listening: ${server.listening}`);
} catch (e) {
    console.error(e)
}