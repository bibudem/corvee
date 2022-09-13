import { dirname } from 'node:path'
import { Harvester } from '../../lib/harvester/index.js'
import saveRecords from '../save-records.js'
import { console } from '../../../core/index.js';
import configs from './config.js'
import { fileURLToPath } from 'node:url';

const DIRNAME = dirname(fileURLToPath(import.meta.url))

configs.startUrl = 'http://132.204.52.60:8080/'

const tt = []

//const errorCodes = new Set();
const harvester = new Harvester(configs);

saveRecords(DIRNAME, harvester)

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
    await harvester.run()
} catch (e) {
    console.error(e)
}