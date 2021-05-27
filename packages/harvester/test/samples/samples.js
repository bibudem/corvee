import Apify from 'apify';

import {
    Harvester
} from '../../lib/harvester'

import {
    console
}
    from '../../../core/lib/logger';

import configs from './config'

const tt = []

//const errorCodes = new Set();
const harvester = new Harvester(configs);

harvester.on('link', function (url) {
    tt.push(url)
})

harvester.on('add-link', function (data) {
    //console.verbose('[add-link] adding', data.url)
})

harvester.on('end', async () => {
    console.me('[end]')
})

harvester.addLinkParser(function linkParserFunction() {
    return Array.from(document.querySelectorAll('a[href]')).map(link => ({
        url: link.href,
        text: link.innerText,
        originalUrl: link.getAttribute('href'),
        linkCheckerErrorCode: link.dataset.errCode,
        linkCheckerRealUrl: link.dataset.realurl,
        isNavigationRequest: true
    }))
})

// logErrorCodes(harvester, path.join(__dirname, './error-codes.json'))

// const urls = urlList
//     //.filter(item => item.valid)
//     //.filter(item => item.url === 'http://223.255.255.254')
//     .map(({
//         url,
//         valid: isValid
//     }) => {
//         return new Link(url, {
//             isValid
//         })
//     })

// harvester.addUrl(urls)

try {
    //server.listen(3000, () => {
    //console.log('Server running.')
    Apify.main(harvester.run());
    //});
    //console.log(`Server listening: ${server.listening}`);
} catch (e) {
    console.error(e)
}