import * as chromiumNetErrors from 'chromium-net-errors'

import {
    ERROR_PROPS
} from './error'

export const NET_ERROR_DEF = {
    name: 'NET_ERROR',
    prefix: 'net',
    props: Object.assign({}, ERROR_PROPS, {
        // name: 'name',
        message: 'message',
        // code: 'errno',
        description: 'code',
        type: 'type'
    }),
    test: function(err) {
        return err instanceof chromiumNetErrors.ChromiumNetError;
    }
};