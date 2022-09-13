import _ from 'underscore'
import { Harvester } from '../../lib/harvester/index.js'
import { console } from '../../../core/index.js'
import configs from './config.js'
import sets from './sets.js'
import { Link } from '../../index.js';

sets.forEach(({
    heading,
    success,
    fail,
    subdomains
}) => {

    subdomains.forEach(({
        subdomain,
        port
    }) => {
        const link = new Link(`https://${subdomain}.badssl.com${port ? `:${port}` : ''}`, {
            url,
            heading,
            success,
            fail
        })
        urlList.push(link)
    })
})

const harvester = new Harvester(configs);

//harvester.addUrl(urlList.filter(link => link['should-be'] !== 'good'));
harvester.addUrl(urlList);

harvester.on('record', ({
    id,
    heading,
    url,
    success,
    fail,
    status
}) => {

    console.todo(id)
    test(`${heading} - ${url}`, () => {
        if (fail === 'yes') {
            expect(status).toBe(null);
            return;
        }
    })
})

try {
    console.log('Starting tests.')
    await harvester.run()
} catch (e) {
    console.error(e)
}

test('un test', () => {
    expect(3).toBe(3)
})