import { console, inspect } from '../../../core'

function doGetRequestData(request) {
    let url, method, headers, isNavigationRequest, resourceType;
    if ('uniqueKey' in request) {
        ({
            url,
            method,
            headers
        } = request);
    } else if ('_client' in request) {
        ({
            _url: url,
            _method: method,
            _headers: headers,
            _isNavigationRequest: isNavigationRequest,
            _resourceType: resourceType
        } = request);
    }

    return {
        url,
        method,
        headers,
        isNavigationRequest,
        resourceType
    }
}

async function doGetResponseData(response) {
    let headers, status, statusText, url, size, resourceType, ok;

    try {
        // Puppeteer response
        if ('_client' in response) {
            ({
                _url: url,
                _headers: headers,
                _status: status,
                _statusText: statusText,
            } = response)

            resourceType = response.request()._resourceType;
            ok = response.ok();

            try {
                size = (await response.buffer()).length;
            } catch (e) {
                // Could not get response.buffer().length from response.
                size = null
            }
        }
    } catch (e) { }

    return {
        url,
        ok,
        status,
        statusText,
        resourceType,
        headers,
        size
    }
}

export async function getResponseData(id, response) {
    return {
        id,
        ...await doGetResponseData(response)
    }
}

export async function getRequestData(id, request) {
    return {
        id,
        ...doGetRequestData(request)
    }
}