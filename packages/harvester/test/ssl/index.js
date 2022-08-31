import fs from 'fs'
import path from 'path'
import Apify from 'apify';
import _ from 'underscore'

import {
    Harvester
} from '../../lib/harvester'

import {
    logErrorCodes
} from '../utils/log-error-codes'

import {
    console
}
    from '../../../core/lib/logger';

import configs from './config'

import links from './url-list'

import {
    Link
} from '../../lib/link';

const urlList = [];
// const errorCodes = new Set();

links.forEach(group => {
    const groupName = group.title;
    group.links.forEach(linkData => {
        const link = new Link(linkData.url, _.pick(linkData, ['should-be']))
        link.userData.text = `[${groupName}] ${linkData.text}`
        urlList.push(link)
    })
})

const harvester = new Harvester(configs);

logErrorCodes(harvester, path.join(__dirname, './error-codes.json'))

// harvester.on('record', record => {
//     record.reports.forEach(report => {
//         if (report && 'normalized' in report && 'code' in report.normalized) {
//             errorCodes.add(report.normalized.code)
//         } else {
//             errorCodes.add(record.status)
//         }
//     })
// })

// harvester.on('end', () => {
//     fs.writeFileSync(path.join(__dirname, './error-codes.json'), JSON.stringify(Array.from(errorCodes), null, 2), 'utf8');
// })

//harvester.addUrl(urlList.filter(link => link['should-be'] !== 'good'));
harvester.addUrl(urlList);

//harvester.on('record', (record) => console.todo(record.id))

try {
    console.log('Starting tests.')
    Apify.main(harvester.run())
} catch (e) {
    console.error(e)
}