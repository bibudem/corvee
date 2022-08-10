import { ERROR_PROPS } from './error'

export const MAIL_ERROR_DEF = {
    name: 'MAIL_ERROR',
    prefix: 'mail',
    props: Object.assign({}, ERROR_PROPS),
    test: function (error) {
        return typeof error.code !== 'undefined' && error.code.startsWith('mail-')
    }
};