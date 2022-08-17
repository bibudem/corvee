import _ from 'underscore'
import createHttpError, { HttpError as HttpErrorClass } from 'http-errors'

export const HTTP_ERROR_DEF = {
    name: 'HTTP_ERROR',
    prefix: 'http',
    props: {
        // name: 'code',
        // message: 'message',
        // status: 'errno'
        //name: 'code',
        message: 'message',
        status: ['code', 'errno']
    },
    test: function (err) {
        return err instanceof HttpErrorClass
    }
}

export function HttpError(pupResponse) {
    const status = pupResponse.status()
    const httpError = createHttpError(status, pupResponse.statusText(), {
        url: pupResponse.request().url(),
        //body
    })

    addStatusRelatedData(httpError, pupResponse)

    return httpError;
};

function addStatusRelatedData(httpError, res) {

    const status = res.status();

    switch (status) {
        case 429:
            const headers = res.headers()
            if ('retry-after' in headers) {
                httpError._data = _.pick(headers, 'retry-after')
            }
            break;
    }
}