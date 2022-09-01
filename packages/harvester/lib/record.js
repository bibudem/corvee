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
    redirectChain: null,
    resourceType: null,
    trials: null,
    reports: null,
    created: null,
    contentLength: null
};

export function getFinalStatus(report) {
    const statuses = [];
    const sortedHttpStatuses = [308, 301, 307, 302, 303]
    if ('httpStatusCode' in report) {
        statuses.push(report.httpStatusCode)
    }
    if (report.redirectChain) {
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

    const redirectChain = record.redirectChain;

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

    if (typeof request._client === 'undefined') {

        /*
         * apify request class && puppeteer Response class
         * This is a navigation response
         */

        const record = extend(
            true,
            {},
            baseReport,
            userData,
            {
                /** @member {string} [urlData] - Url as found when crawling */
                url: request.url,
                httpStatusCode: response.status(),
                isNavigationRequest: response.request().isNavigationRequest(),
                redirectChain: getRedirectChain(
                    response.request().redirectChain(),
                    request.url
                ),
                resourceType: response.request().resourceType(),
                trials: request.retryCount
            },
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

    if ('_client' in request) {

        /*
         * puppeteer Request class && puppeteer Response class
         * This is an asset response OR a document download response (pdf, etc.)
         */

        const redirectChain = getRedirectChain(
            request.redirectChain(),
            request.url()
        );

        const record = extend(
            true,
            {},
            baseReport,
            userData,
            {
                url: request.url(),
                httpStatusCode: response.status(),
                isNavigationRequest: request.isNavigationRequest(),
                redirectChain,
                resourceType: request.resourceType(),
                trials: 'TODO',
            },
            meta
        );

        if (response && 'content-type' in response.headers()) {
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
            httpStatusCode: response ? response.status() : null,
            headers: response ? response.headers() : []
        });

        record.finalUrl = finalUrl;

        return record;
    }

    if (response && response.constructor.name === 'IncomingMessage') {

        /*
         * apify request class && (request-promise-native) IncomingMessage class response
         * This is a basicCrawler response
         */

        const redirectChain = getRedirectChain(
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

    if (meta._from === 'addToRequestQueue' || meta._from === 'page.goto().catch()') {

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

export function getRedirectChain(chain, sourceUrl) {

    if (chain.length === 0) {
        return null
    }

    return chain
        .map(request => {
            if ('_client' in request) {

                // puppeteer HTTPRequest class
                const httpResponse = request.response();
                let redirect = {}

                redirect.url = absUrl(httpResponse.headers().location, httpResponse.url())

                redirect = ((props) => {
                    return props.reduce((obj, prop) => {
                        try {
                            obj[prop] = httpResponse[prop]();
                            return obj;
                        } catch (error) {
                            console.error(inspect(error))
                        }
                    }, redirect)
                })(['status', 'statusText', 'fromCache', 'fromServiceWorker']);

                return redirect
            }

            // ???
            return {
                url: request.redirectUri,
                status: request.statusCode
            };
        })
        .map(({
            url,
            ...redirectData
        }, i, items) => {
            const baseUrl = i === 0 ? sourceUrl : items[i - 1].url;
            const newUrl = absUrl(url, baseUrl);

            return {
                url: newUrl,
                ...redirectData
            };
        });
}