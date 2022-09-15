import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import _ from 'underscore'
import { Harvester } from '../../lib/harvester/index.js'
import { logErrorCodes } from '../../lib/utils/index.js'
import { console } from '../../../core/index.js'
import configs from './config.js'
import links from './url-list.js'
import { Link } from '../../lib/link.js'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

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

logErrorCodes(harvester, join(DIRNAME, './error-codes.json'))

harvester.addUrl(urlList);

try {
    console.log('Starting tests.')
    await harvester.run()
} catch (e) {
    console.error(e)
}