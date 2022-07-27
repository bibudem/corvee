import { ERROR_PROPS } from './error'

export const NODE_ERROR_DEF = {
    name: 'NODE_ERROR',
    prefix: 'node',
    props: Object.assign({}, ERROR_PROPS, {
        input: 'data'
    }),
    test: function (err) {
        return 'code' in err && typeof err.code === 'string' && err.code.startsWith('ERR_')
    }
}