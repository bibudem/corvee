import { join, dirname } from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

import { Harvester } from '../../lib/harvester/index.js'
import saveRecords from '../save-records.js'
import saveBrowsingContexts from '../save-browsing-contexts.js'
import { logErrorCodes } from '../../lib/utils/log-error-codes.js'
import { console } from '../../../core/index.js'
import { config } from './config/index.js'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

const harvester = new Harvester(config);

harvester.setLinkParser(function linkParser() {
    return Array
        .from(document.querySelectorAll('a[href]'))
        // Exclude those inside a rss module
        .filter(link => !link.parentNode.closest('.module-rss-resource'))
        .map(link => ({
            url: link.href,
            text: link.innerText,
            urlData: link.getAttribute('href'),
            isNavigationRequest: true
        }))
})

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'p') {
        if (harvester.isPaused) {
            harvester.resume();
        } else {
            harvester.pause();
        }
    }

    if (key.ctrl && key.name === 'c') {
        process.exit()
    }
});

saveRecords(DIRNAME, harvester, (record) => {
    //return record.extern && record.url && !record.url.startsWith('mailto:');
    return true;
})

saveBrowsingContexts(DIRNAME, harvester);

logErrorCodes(harvester, join(DIRNAME, './error-codes.json'))

try {
    console.log('Starting tests.')
    await harvester.run()
} catch (e) {
    console.error(e)
    process.exit()
}