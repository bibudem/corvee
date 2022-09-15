import { Harvester } from '../../lib/harvester/index.js'
import { console } from '../../../core/index.js';
import configs from './config.js'

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
    console.todo('[end]')
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

try {
    await harvester.run()
} catch (e) {
    console.error(e)
}