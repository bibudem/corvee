import _ from 'underscore'
import paramCase from 'param-case'
import { inspect, console } from '../../../core'

import { PREFIX_SEPARATOR, ERROR_PROPS, CORVEE_ERROR_DEF, PUP_ERROR_DEF, NET_ERROR_DEF, SSL_ERROR_DEF, HTTP_ERROR_DEF, URL_ERROR_DEF, SYSTEM_ERROR_DEF, NODE_ERROR_DEF, ERROR_DEF } from '.'


const TIMEOUT_ERROR_DEF = {
    name: 'TIMEOUT_ERROR',
    prefix: 'cv',
    props: _.extend({}, ERROR_PROPS, {
        name: 'code'
    }),
    test: function (err) {
        return err.constructor.name === 'TimeoutError'
    }
}

export function normalizeError(err, defName) {
    const ret = {};
    const errorDefs = [CORVEE_ERROR_DEF, PUP_ERROR_DEF, NET_ERROR_DEF, HTTP_ERROR_DEF, TIMEOUT_ERROR_DEF, URL_ERROR_DEF, SYSTEM_ERROR_DEF, SSL_ERROR_DEF, NODE_ERROR_DEF, ERROR_DEF];
    let translator;
    let prefix = ''
    let found = false;
    for (const errorDef of errorDefs) {
        if ((typeof defName === 'string' && defName === errorDef.name) || errorDef.test(err)) {
            // console.debug(`is ${errorDef.name}`);
            translator = errorDef.props;
            prefix = errorDef.prefix;
            found = true;
            break;
        }
    }

    if (!found) {
        console.todo('Didn\' find a definition for this error:')
        console.todo(inspect(err))
        console.todo(`err.name: ${err.name}`)
        console.todo(`err.constructor.name: ${err.constructor.name}`)
        console.todo(`err instanceof Error: ${err instanceof Error}`)
        console.todo(`err.message: ${err.message}`)
        console.todo(`err.code: ${err.code}`)
        console.todo(`Properties: ${Object.keys(err)}`)
        console.todo(err.stack)

        translator = {}
        Object.keys(err).forEach(prop => translator[prop] = prop)

        //process.exit()
    }

    Object.keys(translator).forEach(oldProp => {
        if (typeof (err[oldProp]) !== 'undefined') {
            const translatorPropMap = Array.isArray(translator[oldProp]) ? translator[oldProp] : [translator[oldProp]];
            translatorPropMap.forEach(translatorProp => {
                if (typeof translatorProp === 'string') {
                    ret[translatorProp] = '' + err[oldProp]
                } else {
                    ret[translatorProp.prop] = translatorProp.val(err[oldProp])
                }
            })
        }
    })

    if ('code' in ret) {
        ret.code = paramCase(`${prefix}${PREFIX_SEPARATOR}${ret.code.replace(/^ERR_/i, '')}`)
    }

    return ret;
}