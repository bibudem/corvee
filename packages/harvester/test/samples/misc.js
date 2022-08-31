import path from 'path'
import Apify from 'apify';

import {
    Harvester
} from '../../lib/harvester'

import saveRecords from '../save-records'

import {
    console
}
    from '../../../core/lib/logger';

import configs from './config'

configs.startUrl = 'http://132.204.52.60:8080/'

const tt = []

//const errorCodes = new Set();
const harvester = new Harvester(configs);

saveRecords(__dirname, harvester)

harvester.on('link', function (url) {
    tt.push(url)
})

harvester.on('add-link', function (data) {
    //console.verbose('[add-link] adding', data.url)
})

harvester.on('end', async () => {
    console.todo('[end]')
})

harvester.addLinkParser(function linkParserFunction() {
    return Array.from(document.querySelectorAll('a[href]')).map(link => ({
        url: link.href,
        text: link.innerText,
        originalUrl: link.getAttribute('href'),
        linkCheckerErrorCode: link.parentElement.dataset.err_code,
        linkCheckerStatus: link.parentElement.dataset.status,
        isNavigationRequest: true
    }))
})

try {
    //server.listen(3000, () => {
    //console.log('Server running.')
    Apify.main(harvester.run());
    //});
    //console.log(`Server listening: ${server.listening}`);
} catch (e) {
    console.error(e)
}