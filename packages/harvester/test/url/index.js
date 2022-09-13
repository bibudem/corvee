import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Harvester } from '../../lib/harvester/index.js'
import { Link } from '../../index.js'
import { logErrorCodes } from '../../index.js'
import { console } from '../../../core/index.js'
import urlList from './url-list.js'
import configs from './config.js'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

const harvester = new Harvester(configs);

logErrorCodes(harvester, join(DIRNAME, './error-codes.json'))

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
    await harvester.run()
} catch (e) {
    console.error(e)
}