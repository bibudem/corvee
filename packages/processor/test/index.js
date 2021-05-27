import fs from 'fs'
import path from 'path'
import {
    isFunction
} from 'underscore'

import {
    table,
    getBorderCharacters
} from 'table'

import colors from 'colors/safe'

import {
    CorveeProcessor
} from '../lib/processor'

import {
    plugins
}
from './plugins'

import {
    getFinalStatus
} from '../../../harvester/lib/record'

import {
    default as records
}
from '../../../harvester/test/bib/records_2019-11-14.json'
// from './records.json'

import messages from '../plugins/messages'

import * as config from './config'

import {
    default as todoPlugins
} from './todo-plugins'

const filePath = path.join(__dirname, 'records-out.json');
const excludedStatsPath = path.join(__dirname, 'excluded-out.json');

function removeUrlsThatWillBeExcludedFromHarvester(reports) {
    return reports.filter(report => {
        return !config.urlsExcludedFromHarvester.some(testUrl => {
            // return typeof testUrl === 'string' ? report.url.includes(testUrl) : testUrl.test(report.url);
            return typeof testUrl === 'string' ? report.url.includes(testUrl) : isFunction(testUrl) ? testUrl(report.url) : testUrl.test(report.url);
        })
    })
}

async function doTest(records) {

    records = removeUrlsThatWillBeExcludedFromHarvester(records);
    records.forEach(r => r.httpStatusCode = getFinalStatus(r));

    const devExcludeUrlsPlugin = {
        code: 'dev-exclude-urls',
        test: (report) => {
            return config.devExcludeUrls.find(testUrl => typeof testUrl === 'string' ? report.url.includes(testUrl) : isFunction(testUrl) ? testUrl(report.url) : testUrl.test(report.url))
        },
        exclude: true
    }

    const tmpPlugin = {
        code: 'tmp-plugin',
        test: (report) => {
            if ('responseChain' in report) {
                report.responseChain = report.responseChain.filter(r => {
                    if (r.url.startsWith('https://platform.twitter.com') ||
                        r.url.startsWith('https://syndication.twitter.com') ||
                        r.url.startsWith('https://s7.addthis.com') ||
                        r.url.startsWith('http://www.facebook.com/plugins') ||
                        r.url.startsWith('https://www.facebook.com/plugins') ||
                        r.url.startsWith('https://staticxx.facebook.com') ||
                        r.url.startsWith('https://www.bib.umontreal.ca/une-question') ||
                        r.url.startsWith('https://www.questionpoint.org/crs/qwidgetV4')) {
                        return false;
                    }
                    return true;
                })
            }

            if ('reports' in report && report.reports.some(r => r.code === 'cv-timeout-error')) {
                return true;
            }
        },
        exclude: true
    }

    const processor = new CorveeProcessor({
        filters: [
            devExcludeUrlsPlugin,
            ...plugins,
            tmpPlugin,
            ...(todoPlugins(true))
        ],
        messages
    });

    const result = await processor.process(records);

    const perFilterTable = table([Object.keys(result.perFilter[0]), ...result.perFilter.sort((a, b) => {
        var codeA = a.code.toUpperCase(); // ignore upper and lowercase
        var codeB = b.code.toUpperCase(); // ignore upper and lowercase
        if (codeA < codeB) {
            return -1;
        }
        if (codeA > codeB) {
            return 1;
        }
        return 0;
    }).map(f => {
        let values = Object.values(f).map((value, i, arr) => {
            // if (arr[2]) {
            //     return colors.grey(value);
            // }
            switch (i) {
                case 1:
                    return value === 0 ? colors.grey(value) : value;
                case 2:
                    return value ? colors.green('✓') : ''
                default:
                    return value;
            }
        })
        return values;
    })], {
        border: getBorderCharacters('norc'),
        columns: {
            1: {
                alignment: 'right'
            },
            2: {
                alignment: 'center'
            }
        }
    });


    console.debug('Processing done.')
    console.log(`Plugins stats:`);
    console.log(perFilterTable);

    console.log(`${result.nbIn} items in.`);
    console.log(`${result.filtered} items filtered.`);
    console.log(`${result.excludedCount} items excluded.`);
    console.log(`${result.nbOut} items out.`);

    fs.writeFileSync(path.join(filePath), JSON.stringify(result.records, null, 2))
    fs.writeFileSync(path.join(excludedStatsPath), JSON.stringify(result.excluded, null, 2))
    console.debug(`Result saved in ${filePath}`)
};

doTest(records);