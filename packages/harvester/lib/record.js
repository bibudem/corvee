import { omit, isNull, isNumber } from 'underscore'
import extend from 'extend'

import { console, inspect } from '@corvee/core'
import { captureErrors, HttpReport } from './reports/index.js';

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
    const sortedHttpStatuses = [
        { code: 308, text: null },
        { code: 301, text: null },
        { code: 307, text: null },
        { code: 302, text: null },
        { code: 303, text: null }
    ]
    if ('httpStatusCode' in report) {
        statuses.push({ code: report.httpStatusCode, text: report.httpStatusText })
    }
    if (report.redirectChain) {
        statuses.push(...report.redirectChain.map(r => ({ code: r.status, text: r.statusText })))
    }

    return statuses.reduce((winner, current) => {

        const currentLvl = Math.floor(current.code / 100)
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
        const candidateStatus = [winner.status.code, newWinner.status.code];

        for (const s of sortedHttpStatuses) {

            const foundIdx = candidateStatus.indexOf(s);
            if (foundIdx > -1) {
                return foundIdx === 0 ? winner : newWinner;
            }
        }

        // Status is in the 300's, but not a redirect
        return { status: current, lvl: Math.floor(current.code / 100) }

    }, {
        status: statuses[0],
        lvl: Math.floor(statuses[0].code / 100)
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
        if ([301, 302, 303, 307, 308].includes(httpStatusCode)) {
            finalUrl = redirectChain[redirectChain.length - 1].url;
        }

        if ((httpStatusCode >= 200 && httpStatusCode <= 299) || httpStatusCode >= 400) {
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

    if (typeof request.id !== 'undefined') {

        /*
         * crawlee Request class && playwright Response class
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
                httpStatusText: response.statusText(),
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

        const { code, text } = getFinalStatus(record)
        record.httpStatusCode = code
        record.httpStatusText = text

        if (isNumber(record.httpStatusCode) && record.httpStatusCode >= 400) {

            const httpError = new HttpReport(record.httpStatusCode, record.httpStatusText)

            if (!record.reports) {
                record.reports = []
            }

            record.reports.push(httpError);
        }

        const finalUrl = getFinalUrl({
            record,
            httpStatusCode: response.status(),
            headers: response.headers(),
        });

        record.finalUrl = finalUrl;

        // record.timing_ = response.request().timing()
        // record.sizes_ = await response.request().sizes()

        delete record.uniqueKey;

        return record;
    }

    if (typeof request._events !== 'undefined') {

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
                httpStatusText: response.statusText(),
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

        const { code, text } = getFinalStatus(record)
        record.httpStatusCode = code
        record.httpStatusText = text

        if (isNumber(record.httpStatusCode)) {

            const httpError = new HttpReport(record.httpStatusCode, record.httpStatusText)

            if (!record.reports) {
                record.reports = []
            }

            record.reports.push(httpError);
        }

        const finalUrl = getFinalUrl({
            record,
            httpStatusCode: response.status(),
            headers: response.headers(),
        });

        record.finalUrl = finalUrl;

        // record.timing_ = response.request().timing()
        // record.sizes_ = await response.request().sizes()

        delete record.uniqueKey;

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

export async function handleFailedRequest(request, pwRequest, meta) {

    //
    // crawlee Request class
    //

    if (arguments.length === 2) {
        meta = pwRequest
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
            userData,
            meta
        );

        const { code, text } = getFinalStatus(record)
        record.httpStatusCode = code
        record.httpStatusText = text

        if (isNumber(record.httpStatusCode)) {

            const httpError = new HttpReport(record.httpStatusCode, record.httpStatusText)

            if (!record.reports) {
                record.reports = []
            }

            record.reports.push(httpError);
        }

        return record;
    }

    if (meta._from === 'onAssetRequestFailed') {

        const record = extend(
            true,
            {},
            baseReport,
            {
                url: request.url,
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

        const response = await request.response()

        let redirectedUrl;

        const locationHeader = await response.headerValue('location')

        if (locationHeader) {

            try {
                redirectedUrl = (new URL(locationHeader, request.url())).href
            } catch (e) {
                console.warn(e)
                redirectedUrl = locationHeader
            }
        } else {
            redirectedUrl = response.url()
        }

        redirectChain.unshift({
            url: redirectedUrl,
            status: response.status(),
            statusText: response.statusText(),
        })

        const redirectedRequest = request.redirectedFrom()

        if (isNull(redirectedRequest)) {
            return redirectChain
        }

        return doGetRedirectChain(redirectedRequest, redirectChain)
    }

    return await doGetRedirectChain(request, [])

}