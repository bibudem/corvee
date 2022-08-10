import { ERROR_PROPS } from '.'
import { NODE_ERROR_CODES } from '.'

export const NODE_ERROR_DEF = {
    name: 'NODE_ERROR',
    prefix: 'node',
    props: Object.assign({}, ERROR_PROPS, {
        input: 'data'
    }),
    test: function (err) {
        // return 'code' in err && typeof err.code === 'string' && err.code.startsWith('ERR_')
        return 'code' in err && NODE_ERROR_CODES.includes(err.code)
    }
}