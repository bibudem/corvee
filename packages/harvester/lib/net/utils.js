function getDataFromRequest(request) {
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

async function getDataFromResponse(response) {
    let headers, status, statusText, url, size, resourceType, ok;

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
            // console.error(`${UNHANDLED_ERROR} at ${pageUrl}`)
            console.error(e)
        }
    }

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

export async function responseData(id, response) {
    return {
        id,
        ...await getDataFromResponse(response)
    }
}

export async function requestData(id, request) {
    return {
        id,
        ...getDataFromRequest(request)
    }
}