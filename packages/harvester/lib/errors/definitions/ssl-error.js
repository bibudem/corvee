import { ERROR_PROPS } from './error'

export const SSL_ERROR_DEF = {
    name: 'SSL_ERROR',
    prefix: 'ssl',
    props: Object.assign({}, ERROR_PROPS, {

        // OpenSSL Errors
        opensslErrorStack: 'opensslErrorStack',
        function: 'function',
        library: 'library',
        reason: 'reason'
    }),
    test: function (err) {
        return 'opensslErrorStack' in err;
    }
}