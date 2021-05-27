import {
    isFunction
} from 'underscore'

export default function(urls = [], {
    exclude = true,
    level = 'info'
} = {}) {
    return {
        code: 'url-ignore-these',
        description: 'Will ignore records with url in the list provided to the plugin. Each URL can be a string (tested against record.url), a regular expression (tested against record.url) or a function which recieve the record as argument and must return a boolean. ',
        test: (report) => {
            return urls.find(testUrl => typeof testUrl === 'string' ? report.url.includes(testUrl) : isFunction(testUrl) ? testUrl(report) : testUrl.test(report.url))
        },
        level,
        exclude
    }
}