import {
    ERROR_PROPS
} from './error'

export const SYSTEM_ERROR_DEF = {
    name: 'SYSTEM_ERROR',
    prefix: 'sys',
    props: Object.assign({}, ERROR_PROPS, {

        // SystemError
        adress: 'adress',
        dest: 'dest',
        errno: 'errno',
        info: 'info',
        path: 'path',
        port: 'port',
        syscall: 'syscall'
    }),
    test: function (err) {
        return 'syscall' in err;
    }
}