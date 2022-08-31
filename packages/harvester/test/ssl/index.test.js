import Apify from 'apify';
import _ from 'underscore'

import {
    Harvester
} from '../../lib/harvester'

import {
    console
}
    from '../../../core/lib/logger';

import configs from './config'

import sets from './sets'

import {
    Link
} from '../../lib/link';

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
    Apify.main(harvester.run());
} catch (e) {
    console.error(e)
}

test('un test', () => {
    expect(3).toBe(3)
})