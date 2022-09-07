import { omit, isNull } from 'underscore'
const extend = require('extend')
import { Response } from 'playwright-core/lib/server/network'

import { absUrl, console, inspect } from './../../core'
import { ResourceType } from './resource-type';
import { captureErrors } from './errors';
import { request } from 'express';

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

        const currentLvl = Math.floor(current / 100)
        const newWinner = {
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
    const redirectChain = record.redirectChain;

    if (httpStatusCode === null) {
        return finalUrl
    }

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

    return finalUrl;
}

export async function handleResponse(request, response = null, meta = {}) {

    const reports = captureErrors(request.userData.reports);
    const userData = omit(request.userData, 'reports');

    const baseReport = extend(true, {}, defaultOptions, {
        reports,
        created: new Date().toISOString()
    });

    if (typeof request._events !== 'undefined') {
        console.todo("This is a navigation response from 'onDocumentDownload' or 'onAssetResponse'")
        /*
         * playwright Request class && playwright Response class
         * This is a navigation response from 'onDocumentDownload' or 'onAssetResponse'
         */

        const record = extend(
            true,
            {},
            baseReport,
            userData,
            {
                url: getRequestUrl(request),
                httpStatusCode: response.status(),
                isNavigationRequest: request.isNavigationRequest(),
                redirectChain: await getRedirectChain(request),
                resourceType: request.resourceType()
            },
            meta
        );

        try {
            record.size = (await response.body()).length;
        } catch (error) {
            // pwResponse.buffer() is undefined
            record.size = null
        }

        if ('content-type' in response.headers()) {
            record.contentType = response.headers()['content-type'].split(';')[0].trim();
        }

        if ('content-length' in response.headers()) {
            record.contentLength = +response.headers()['content-length']
        }

        record.httpStatusCode = getFinalStatus(record);

        const finalUrl = getFinalUrl({
            record,
            httpStatusCode: response.status(),
            headers: response.headers(),
        });

        record.finalUrl = finalUrl;

        delete record.uniqueKey;

        return record;
    }

    if (typeof request.id !== 'undefined') {
        console.todo("This is a navigation response")
        /*
         * apify request class && playwright Response class
         * This is a navigation response
         */

        const record = extend(
            true,
            {},
            baseReport,
            userData,
            {
                url: request.url,
                httpStatusCode: response.status(),
                isNavigationRequest: response.request().isNavigationRequest(),
                redirectChain: await getRedirectChain(response.request()),
                resourceType: response.request().resourceType(),
                trials: request.retryCount
            },
            meta
        );

        try {
            record.size = (await response.body()).length;
        } catch (error) {
            // pwResponse.buffer() is undefined
            record.size = null
        }

        if ('content-type' in response.headers()) {
            record.contentType = response.headers()['content-type'].split(';')[0].trim();
        }

        if ('content-length' in response.headers()) {
            record.contentLength = +response.headers()['content-length']
        }

        record.httpStatusCode = getFinalStatus(record);

        const finalUrl = getFinalUrl({
            record,
            httpStatusCode: response.status(),
            headers: response.headers(),
        });

        record.finalUrl = finalUrl;

        delete record.uniqueKey;

        return record;
    }

    // if ('_client' in request) {

    //     /*
    //      * puppeteer Request class && puppeteer Response class
    //      * This is an asset response
    //      */

    //     // const redirectChain = await getRedirectChain(
    //     //     request.redirectChain(),
    //     //     request.url()
    //     // );

    //     const record = extend(
    //         true,
    //         {},
    //         baseReport,
    //         userData,
    //         {
    //             url: request.url(),
    //             httpStatusCode: response.status(),
    //             isNavigationRequest: request.isNavigationRequest(),
    //             // redirectChain,
    //             resourceType: request.resourceType(),
    //             trials: 'TODO',
    //         },
    //         meta
    //     );

    //     if (response && 'content-type' in response.headers()) {
    //         record.contentType = response.headers()['content-type'].split(';')[0].trim();
    //     }

    //     if ('content-length' in response.headers()) {
    //         record.contentLength = +response.headers()['content-length']
    //     }

    //     record.httpStatusCode = getFinalStatus(record);

    //     const finalUrl = getFinalUrl({
    //         record,
    //         httpStatusCode: response ? response.status() : null,
    //         headers: response ? response.headers() : []
    //     });

    //     record.finalUrl = finalUrl;

    //     return record;
    // }

    // if (response && response.constructor.name === 'IncomingMessage') {

    //     /*
    //      * apify request class && (request-promise-native) IncomingMessage class response
    //      * This is a basicCrawler response
    //      */

    //     const redirectChain = await getRedirectChain(
    //         response.request._redirect.redirects,
    //         request.url
    //     );

    //     const record = extend(
    //         true,
    //         {},
    //         baseReport,
    //         {
    //             /** @member {string} [urlData] - Url as found when crawling */
    //             url: request.url,
    //             httpStatusCode: response.statusCode,
    //             isNavigationRequest: 'TODO',
    //             redirectChain,
    //             resourceType_: ResourceType.fromMimeType(
    //                 response.headers['content-type']
    //             ).name(),
    //             trials: request.retryCount
    //         },
    //         userData,
    //         meta
    //     );

    //     if ('content-type' in response.headers) {
    //         record.contentType = response.headers['content-type'].split(';')[0].trim();
    //     }

    //     if ('content-length' in response.headers) {
    //         record.contentLength = response.headers['content-length'];
    //     }

    //     record.httpStatusCode = getFinalStatus(record);

    //     const finalUrl = getFinalUrl({
    //         record,
    //         httpStatusCode: response.statusCode,
    //         headers: response.headers,
    //     });

    //     record.finalUrl = finalUrl;

    //     return record;
    // }

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

export async function handleFailedRequest(request, error, meta) {
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
        const pwRequest = error;

        const record = extend(
            true,
            {},
            baseReport,
            {
                url: request.url,
                isNavigationRequest: pwRequest.isNavigationRequest(),
                redirectChain: await getRedirectChain(pwRequest),
                resourceType: pwRequest.resourceType(),
                status: pwRequest.failure().errorText,
            },
            userData,
            meta
        );

        return record;
    }
}

function getRequestUrl(request) {

    const previousRequest = request.redirectedFrom()

    if (isNull(previousRequest)) {
        return request.url()
    }

    return getRequestUrl(previousRequest)
}

export async function getRedirectChain(request) {

    if (isNull(request.redirectedFrom())) {
        return null
    }

    async function doGetRedirectChain(request, redirectChain) {

        const redirectedRequest = request.redirectedFrom()

        if (isNull(redirectedRequest)) {
            return redirectChain
        }

        const redirectedResponse = await redirectedRequest.response()

        let redirectedUrl;

        try {
            redirectedUrl = (new URL(await redirectedResponse.headerValue('location'), request.url())).href
        } catch (e) {
            console.warn(e)
            redirectedUrl = await redirectedResponse.headerValue('location')
        }

        redirectChain.unshift({
            url: redirectedUrl,
            status: redirectedResponse.status(),
            statusText: redirectedResponse.statusText(),
        })

        return doGetRedirectChain(redirectedRequest, redirectChain)
    }

    return await doGetRedirectChain(request, [])

}