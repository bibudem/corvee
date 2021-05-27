import {
    PREFIX_SEPARATOR,
    ERROR_PROPS
} from '..'

export const URL_ERROR_DEF = {
    name: 'URL_ERROR',
    prefix: 'url',
    props: Object.assign({}, ERROR_PROPS, {
        input: 'data',
        // name: {
        //     prop: 'name',
        //     val: () => 'UrlError'
        // }
    }),
    test: function(err) {
        return 'input' in err || ('code' in err && err.code.startsWith(`url${PREFIX_SEPARATOR}`))
    }
}