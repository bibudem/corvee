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
 * @property {?number} contentLength The Content-Length response header
 * @property {?string} contentType The Content-Type response header
 * @property {?string} created The record creation date
 * @property {boolean} extern=true Wether the link points to an external resource or not
 * @property {?import('corvee-core').UrlType} finalUrl The final URL of the resource, is the resource exists
 * @property {?number} httpStatusCode The final http status code computed from the response and the redirection chain if it exists
 * @property {?string} [httpStatusText] The http response reason phrase, if present, of the final http status code
 * @property {number} [id] A job scoped generated id of the record
 * @property {?boolean} isNavigationRequest Whether this is a navigation or an asset request
 * @property {?string} [job] The job id
 * @property {import('corvee-core').UrlType} parent=corvee:url-list The parent (context) url holding the link
 * @property {?RedirectChainType} redirectChain An array of redirections, if it exists
 * @property {?Array<Report>} reports An array of reports
 * @property {boolean} [resourceIsEmbeded] Whether the resource is embeded (an iframe) or not
 * @property {?string} resourceType ontains the request's resource type as it was perceived by the rendering engine. ResourceType will be one of the following: document, stylesheet, image, media, font, script, texttrack, xhr, fetch, eventsource, websocket, manifest, other.
 * @property {number} [size] 
 * @property {string} [text] The text link, if available
 * @property {number} [timing]
 * @property {?number} trials The request trial number at which it succeeded
 * @property {import('corvee-core').UrlType} url The resource's url
 * @property {string} [urlData] The url data string taken from the href attribute
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

    if (record.httpStatusCode !== null) {
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

        // Here, we have a status code >= 300 && <= 399
        // Return the heaviest code from winner vs current
        const candidateStatus = [winner.status.code, newWinner.status.code];

        for (const s of sortedHttpStatuses) {

            const foundIdx = candidateStatus.indexOf(s.code);
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

/**
 *
 *
 * @param {object} options
 * @param {RecordType} options.record
 * @param {number|null} options.httpStatusCode
 * @param {Object.<string, any>} options.headers
 * 
 * @returns {import('corvee-core').UrlType|null} finalUrl
 */
function getFinalUrl({
    record,
    httpStatusCode,
    headers
}) {
    let finalUrl = null;
    const redirectChain = record.redirectChain;

    /**
     * @param {RedirectChainType} redirectChain
     */
    function getLastContiguousPermanentRedirect(redirectChain) {

        const firstPermanentRedirectIdx = redirectChain.findIndex(redirect => [301, 308].includes(redirect.status))

        if (firstPermanentRedirectIdx === -1) {
            // No permanent redirect in the redirect chain
            // All temporary redirects
            // so return the very last redirect
            return redirectChain[redirectChain.length - 1]
        }

        // Try to get the last contiguous permanent redirect from the chain

        const strippedRedirectChain = redirectChain.slice(firstPermanentRedirectIdx)

        const firstTemporaryRedirectIdx = strippedRedirectChain.findIndex(redirect => [302, 303, 307].includes(redirect.status))

        if (firstTemporaryRedirectIdx > 0) {
            return strippedRedirectChain[firstTemporaryRedirectIdx - 1]
        }

        // All permanent redirects
        return strippedRedirectChain[strippedRedirectChain.length - 1]
    }

    if (httpStatusCode === null) {
        return finalUrl
    }

    if (httpStatusCode >= 200 && httpStatusCode < 300) {
        finalUrl = record.url;
    }

    // Edge case where a response with a redirect status code doesn't have a location header field
    if (httpStatusCode === 300) {
        if ('location' in headers) {
            finalUrl = headers.location;
        }
    }

    if (redirectChain && redirectChain.length > 0) {

        const lastContiguousPermanentRedirect = getLastContiguousPermanentRedirect(redirectChain)

        if (lastContiguousPermanentRedirect) {
            finalUrl = lastContiguousPermanentRedirect.url
        } else {
            finalUrl = redirectChain[redirectChain.length - 1].url;
        }
        // // Edge case where there is no location header with a redirect status,
        // // else, get the last redirection url
        // if ([301, 302, 303, 307, 308].includes(httpStatusCode)) {
        //     finalUrl = redirectChain[redirectChain.length - 1].url;
        // }

        // if ((httpStatusCode >= 200 && httpStatusCode <= 299) || httpStatusCode >= 400) {
        //     // Pick the last redirect
        //     finalUrl = redirectChain[redirectChain.length - 1].url;
        // }
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

        record.finalUrl = getFinalUrl({
            record,
            httpStatusCode: response.status(),
            headers: response.headers(),
        });

        record.reports = getHttpReport(record.httpStatusCode, record.httpStatusText, record.reports)

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

        record.finalUrl = getFinalUrl({
            record,
            httpStatusCode: response.status(),
            headers: response.headers(),
        });

        record.reports = getHttpReport(record.httpStatusCode, record.httpStatusText, record.reports)

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