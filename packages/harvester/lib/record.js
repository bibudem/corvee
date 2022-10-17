import { omit, isNull, isNumber } from 'underscore'
import extend from 'extend'

import { console, inspect } from 'corvee-core'
import { captureReports, HttpReport, Report } from './reports/index.js'
import { addTimeoutToPromise } from '@apify/timeout';

/**
 * @typedef {object} RedirectType
 * @property {import('corvee-core').UrlType} url
 * @property {number} status
 * @property {string} statusText
 */

/**
 * @typedef { Array<RedirectType>} RedirectChainType
 */

/**
 * Documents a link record
 * @typedef {object} RecordType
 * @property {boolean} [_filtered]
 * @property {string} [_from]
 * @property {?Array<Array<string>>} browsingContextStack
 * @property {?number} contentLength
 * @property {?string} contentType
 * @property {?string} created
 * @property {boolean} extern=true
 * @property {?import('corvee-core').UrlType} finalUrl
 * @property {?number} httpStatusCode
 * @property {?string} [httpStatusText]
 * @property {number} [id]
 * @property {?boolean} isNavigationRequest
 * @property {import('corvee-core').UrlType} parent=corvee:url-list
 * @property {?Array<RedirectChainType>} redirectChain
 * @property {?Array<Report>} reports
 * @property {boolean} [resourceIsEmbeded]
 * @property {?string} resourceType
 * @property {number} [size]
 * @property {string} [text]
 * @property {number} [timing]
 * @property {?number} trials
 * @property {import('corvee-core').UrlType} url
 * @property {string} [urlData]
 */

/**
 * @type RecordType
 * @default
 */
export const defaultRecordOptions = {
    browsingContextStack: null,
    contentLength: null,
    contentType: null,
    created: null,
    extern: true,
    finalUrl: null,
    httpStatusCode: null,
    isNavigationRequest: null,
    parent: 'corvee:url-list',
    redirectChain: null,
    reports: null,
    resourceType: null,
    size: null,
    trials: null,
    url: null,
};

/**
 * @param {RecordType} record
 * @return { { code: number, text: string } } status
 */
export function getFinalStatus(record) {

    /**
     * @type {Array<{code: number, text: ?string}>}
     */
    const statuses = [];

    /**
     * @type {Array<{code: number, text: ?string}>}
     */
    const sortedHttpStatuses = [
        { code: 308, text: null },
        { code: 301, text: null },
        { code: 307, text: null },
        { code: 302, text: null },
        { code: 303, text: null }
    ]
    if ('httpStatusCode' in record) {
        statuses.push({ code: record.httpStatusCode, text: record.httpStatusText })
    }
    if (record.redirectChain) {
        statuses.push(...record.redirectChain.map(r => ({ code: r.status, text: r.statusText })))
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

/**
 * @param {number} httpStatusCode
 * @param {string} httpStatusText
 * @param {Array<Report>} reports
 */
function getHttpReport(httpStatusCode, httpStatusText, reports) {
    if (isNumber(httpStatusCode) && ([301, 308].includes(httpStatusCode) || httpStatusCode >= 400)) {

        const httpError = new HttpReport(httpStatusCode, httpStatusText)

        if (!reports) {
            reports = []
        }

        reports.push(httpError);
    }

    return reports
}

/**
 * @param {import("@crawlee/core").Request | import("playwright-core").Request} request
 * @param {import("playwright-core").Response} response
 * @param {object} meta
 */
export async function handleResponse(request, response = null, meta = {}) {

    const reports = captureReports(request.userData.reports);
    const userData = omit(request.userData, 'reports');

    const baseReport = extend(true, {}, defaultRecordOptions, {
        reports,
        created: new Date().toISOString()
    });

    if (Reflect.has(request, 'id')) {

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
            const responseBody = await addTimeoutToPromise(response.body, 1000, '')

            if (responseBody) {
                record.size = responseBody.length
            }
        } catch (error) { }

        if ('content-type' in response.headers()) {
            record.contentType = response.headers()['content-type'].split(';')[0].trim();
        }

        if ('content-length' in response.headers()) {
            record.contentLength = +response.headers()['content-length']
        }

        const { code, text } = getFinalStatus(record)
        record.httpStatusCode = code
        record.httpStatusText = text

        record.reports = getHttpReport(record.httpStatusCode, record.httpStatusText, record.reports)

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

    if (Reflect.has(request, '_events')) {

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
            const responseBody = await addTimeoutToPromise(response.body, 1000, '')

            if (responseBody) {
                record.size = responseBody.length
            }
        } catch (error) { }

        if ('content-type' in response.headers()) {
            record.contentType = response.headers()['content-type'].split(';')[0].trim();
        }

        if ('content-length' in response.headers()) {
            record.contentLength = +response.headers()['content-length']
        }

        const { code, text } = getFinalStatus(record)
        record.httpStatusCode = code
        record.httpStatusText = text

        record.reports = getHttpReport(record.httpStatusCode, record.httpStatusText, record.reports)

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

/**
 * @param {import("@crawlee/core").Request} request
 * @param {Error} error
 * @param {{ _from: string; }} [meta]
 */
export async function handleFailedNavigationRequest(request, error, meta) {

    const reports = captureReports(error);
    const userData = omit(request.userData, 'reports')

    const baseReport = extend(
        true,
        {},
        defaultRecordOptions,
        {
            reports,
            trials: request.retryCount,
            created: new Date().toISOString()
        });

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

    record.reports = getHttpReport(record.httpStatusCode, record.httpStatusText, record.reports)

    return record;
}

/**
 * @param {import("@crawlee/core").Request} request
 * @param {import("playwright-core").Request | null} pwRequest
 * @param {{ _from: string; }} [meta]
 */
export async function handleFailedRequest(request, pwRequest, meta) {

    //
    // crawlee Request class
    //

    const reports = captureReports(request.userData.reports);
    const userData = omit(request.userData, 'reports')

    const baseReport = extend(
        true,
        {},
        defaultRecordOptions,
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

/**
 * @param {import("@crawlee/core").Request} request
 * @returns {string}
 */
function getRequestUrl(request) {

    const previousRequest = request.redirectedFrom()

    if (isNull(previousRequest)) {
        return request.url()
    }

    return getRequestUrl(previousRequest)
}

/**
 * @param {import("playwright-core").Request} request
 * @returns {Promise<RedirectChainType>}
 */
export async function getRedirectChain(request) {

    if (isNull(request.redirectedFrom())) {
        return null
    }

    /**
     * @param {import("playwright-core").Request} request
     * @param { RedirectChainType } redirectChain
     * @returns {Promise<RedirectChainType>}
     */
    async function doGetRedirectChain(request, redirectChain) {

        const response = await request.response()

        if (!response) {
            return redirectChain
        }

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

    return doGetRedirectChain(request, [])

}