import path from 'path'
import readline from 'readline'
import Apify from 'apify';

import {
    Harvester
}
    from '../../lib/harvester'

import saveRecords from '../save-records'

import {
    logErrorCodes
} from '../../lib/utils/log-error-codes'

import {
    console
}
    from '../../../core/lib/logger';

import {
    config
} from './config'

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

saveRecords(__dirname, harvester, (record) => {
    //return record.extern && record.url && !record.url.startsWith('mailto:');
    return true;
})

logErrorCodes(harvester, path.join(__dirname, './error-codes.json'))

try {
    console.log('Starting tests.')
    Apify.main(harvester.run())
} catch (e) {
    console.error(e)
    process.exit()
}