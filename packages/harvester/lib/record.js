import dotProp from 'dot-prop';
import { omit } from 'underscore'
const extend = require('extend');

import { absUrl, console, inspect } from './../../core'
import { ResourceType } from './resource-type';
import { captureErrors } from './errors';

export const defaultOptions = {
    url: null,
    finalUrl: null,
    httpStatusCode: null,
    contentType: null,
    isNavigationRequest: null,
    redirectChain: [],
    resourceType: null,
    trials: null,
    reports: [],
    created: null,
    contentLength: null
};

export function getFinalStatus(report) {
    const statuses = [];
    const sortedHttpStatuses = [308, 301, 307, 302, 303]
    if ('httpStatusCode' in report) {
        statuses.push(report.httpStatusCode)
    }
    if ('redirectChain' in report && Array.isArray(report.redirectChain) && report.redirectChain.length > 0) {
        statuses.push(...report.redirectChain.map(r => r.status))
    }

    return statuses.reduce((winner, current) => {

        const currentLvl = Math.floor(current / 100),
            newWinner = {
                status: current,
                lvl: currentLvl
            };


        if (currentLvl < winner.lvl) {
            return winner;
        }
        // New winner!
        if (currentLvl > winner.lvl) {
            return newWinner;
        }

        if (currentLvl < 3 || currentLvl > 3) {
            // return the most recent status code in the redirectChain
            return newWinner;
        }

        // Here, we have a status code >= 300
        // Return the heaviest code from winner vs current
        const candidateStatus = [winner.status, newWinner.status];

        for (const s of sortedHttpStatuses) {

            const foundIdx = candidateStatus.indexOf(s);
            if (foundIdx > -1) {
                return foundIdx === 0 ? winner : newWinner;
            }
        }

        // Status is in the 300's, but not a redirect
        return current;

    }, {
        status: statuses[0],
        lvl: Math.floor(statuses[0] / 100)
    }).status
}

function getFinalUrl({
    record,
    httpStatusCode,
    headers
}) {
    let finalUrl = null;

    if (httpStatusCode === null) {
        return finalUrl
    }

    const redirectChain = 'redirectChain' in record && Array.isArray(record.redirectChain) && record.redirectChain.length > 0 ? record.redirectChain : null;

    if (httpStatusCode >= 200 && httpStatusCode <= 299) {
        finalUrl = record.url;
    }

    // Edge case where a response with a redirect status code doesn't have a location header field
    if ([300].includes(httpStatusCode)) {
        if ('location' in headers) {
            finalUrl = headers.location;
        }
    }

    if (redirectChain) {
        // Edge case where there is no location header with a redirect status,
        // else, get the last redirection url
        if ([301, 302, 307, 308].includes(httpStatusCode)) {
            finalUrl = redirectChain[redirectChain.length - 1].url;
        }

        if (httpStatusCode >= 200 && httpStatusCode <= 299) {
            // Pick the last redirect
            finalUrl = redirectChain[redirectChain.length - 1].url;
        }
    }

    return {
        finalUrl
    };
}

export function handleResponse(request, response = null, meta = {}) {

    const reports = captureErrors(request.userData.reports);
    const userData = omit(request.userData, 'reports');

    const baseReport = extend(true, {}, defaultOptions, {
        reports,
        created: new Date().toISOString()
    });

    if ('_isNavigationRequest' in request) {

        /*
         * puppeteer Request class && puppeteer Response class
         * This is an asset response
         */

        const redirectChain = getRedirectionChain(
            request.redirectChain(),
            request.url()
        );

        const record = extend(
            true,
            {},
            baseReport,
            {
                url: request.url(),
                httpStatusCode: response ? response.status() : null,
                isNavigationRequest: request.isNavigationRequest(),
                redirectChain,
                resourceType: request.resourceType(),
                trials: 'TODO',
            },
            userData,
            meta
        );

        if (response && 'content-type' in response.headers()) {
            record.contentType = response.headers()['content-type'].split(';')[0].trim();
        }

        record.httpStatusCode = getFinalStatus(record);

        const {
            finalUrl
        } = getFinalUrl({
            record,
            httpStatusCode: response ? response.status() : null,
            headers: response ? response.headers() : []
        });

        record.finalUrl = finalUrl;

        return record;
    }

    if (response && '_client' in response) {

        /*
         * apify request class && puppeteer Response class
         * This is a navigation response
         */

        const record = extend(
            true,
            {},
            baseReport,
            {
                /** @member {string} [urlData] - Url as found when crawling */
                url: request.url,
                httpStatusCode: response.status(),
                isNavigationRequest: response.request().isNavigationRequest(),
                redirectChain: getRedirectionChain(
                    response.request().redirectChain(),
                    request.url
                ),
                resourceType: response.request().resourceType(),
                trials: request.retryCount
            },
            userData,
            meta
        );

        if ('content-type' in response.headers()) {
            record.contentType = response.headers()['content-type'].split(';')[0].trim();
        }

        if ('content-length' in response.headers()) {
            record.contentLength = +response.headers()['content-length']
        }

        record.httpStatusCode = getFinalStatus(record);

        const {
            finalUrl
        } = getFinalUrl({
            record,
            httpStatusCode: response.status(),
            headers: response.headers(),
            body: meta.body
        });

        record.finalUrl = finalUrl;

        delete record.uniqueKey;

        return record;
    }

    if (response && response.constructor.name === 'IncomingMessage') {

        /*
         * apify request class && (request-promise-native) IncomingMessage class response
         * This is a basicCrawler response
         */

        const redirectChain = getRedirectionChain(
            response.request._redirect.redirects,
            request.url
        );

        const record = extend(
            true,
            {},
            baseReport,
            {
                /** @member {string} [urlData] - Url as found when crawling */
                url: request.url,
                httpStatusCode: response.statusCode,
                isNavigationRequest: 'TODO',
                redirectChain,
                resourceType_: ResourceType.fromMimeType(
                    response.headers['content-type']
                ).name(),
                trials: request.retryCount
            },
            userData,
            meta
        );

        if ('content-type' in response.headers) {
            record.contentType = response.headers['content-type'].split(';')[0].trim();
        }

        if ('content-length' in response.headers) {
            record.contentLength = response.headers['content-length'];
        }

        record.httpStatusCode = getFinalStatus(record);

        const {
            finalUrl
        } = getFinalUrl({
            record,
            httpStatusCode: response.statusCode,
            headers: response.headers,
            body: meta.body
        });

        record.finalUrl = finalUrl;

        return record;
    }

    if (request.url.startsWith('mailto:')) {

        /*
         * This is a mailto: link
         * args: link, request, meta
         * The request argument only has a .userData property.
         */

        const record = extend(
            true,
            {},
            baseReport,
            userData,
            meta
        );

        return record;
    }

    /*
     * Unknown data
     */

    console.todo(`Unknown response at ${request.url}, meta: ${inspect(meta)}, request: ${inspect(request)}, response: ${inspect(response)}`)

    const record = extend(
        true,
        {},
        baseReport,
        {
            /** @member {string} [urlData] - Url as found when crawling */
            url: request.url,
            isNavigationRequest: 'TODO',
            resourceType: 'TODO',
            trials: 0
        },
        userData,
        meta
    );

    return record;
}

export function handleFailedRequest(request, error, meta) {
    // apify Request class

    if (arguments.length === 2) {
        meta = error
    }

    const reports = captureErrors(request.userData.reports);
    const userData = omit(request.userData, 'reports')

    const baseReport = extend(
        true,
        {},
        defaultOptions,
        {
            reports,
            trials: request.retryCount,
            created: new Date().toISOString()
        });

    if (meta._from === 'gotoFunction' || meta._from === 'page.goto().catch()') {

        const record = extend(
            true,
            {},
            baseReport,
            {
                url: request.url,
            },
            userData,
            meta
        );
        console.todo('========================================')
        console.todo(inspect(record))
        return record;
    }

    if (meta._from === 'onNavigationRequestFailed') {
        const record = extend(
            true,
            {},
            baseReport,
            {
                url: request.url,
                isNavigationRequest: true,
            },
            userData,
            meta
        );

        return record;
    }

    if (meta._from === 'onAssetRequestFailed') {
        const pupRequest = error;

        const record = extend(
            true,
            {},
            baseReport,
            {
                url: request.url,
                isNavigationRequest: pupRequest.isNavigationRequest(),
                redirectChain: pupRequest.redirectChain(),
                resourceType: pupRequest.resourceType(),
                status: pupRequest.failure().errorText,
                reports_: captureErrors(pupRequest.failure().errorText)
            },
            userData,
            meta
        );

        return record;
    }
}

export function getRedirectionChain(chain, sourceUrl) {
    return chain
        .map(item => {
            if ('_client' in item) {
                // puppeteer Request class
                const response = item.response();
                return {
                    url: absUrl(response.headers().location, response.url()),
                    status: response.status(),
                    statusText: response.statusText()
                };
            }

            // ???
            return {
                url: item.redirectUri,
                status: item.statusCode
            };
        })
        .map(({
            url,
            status,
            statusText
        }, i, items) => {
            const baseUrl = i === 0 ? sourceUrl : items[i - 1].url;
            const newUrl = absUrl(url, baseUrl);

            return {
                url: newUrl,
                status,
                statusText
            };
        });
}