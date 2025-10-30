import { console, inspect } from '@corvee/core'

/**
 * @typedef {string | RegExp} StringPattern
 */

/**
 * @typedef {string} StringReplacement
 */

/**
 * @typedef {object} MessageType
 * @property {string} msg
 * @property {StringPattern} [pattern]
 * @property {StringReplacement} [substitution]
 */

/**
 * @typedef {string} MessageCodeType
 */

/**
 * @typedef {{ [code: MessageCodeType]: MessageType; }} MessagesDictionnaryType
 */

/**
 * @param {MessagesDictionnaryType} messages
 */
export function messageFactory(messages) {

    Object.keys(messages).forEach(m => {
        if ('pattern' in messages[m] && typeof messages[m].pattern === 'string') {
            /**
             * @type {RegExp}
             */
            (messages[m].pattern) = new RegExp(messages[m].pattern,)
        }
    })

    return function message(/** @type {MessageCodeType} */ key, /** @type {string} */ rawMsg) {
        if (typeof messages[key] === 'undefined') {
            return
        }

        const msg = messages[key]

        if (msg.pattern && rawMsg) {
            const resultArray = /** @type {RegExp} */ (msg.pattern).exec(rawMsg)
            if (resultArray && resultArray.length > 1) {
                let message = msg.substitution
                for (var i = 1; i < resultArray.length; i++) {
                    message = message.replace(new RegExp(`\\$${i}`, 'g'), resultArray[i])
                }

                return message

            } else if (msg.msg) {
                // Use default message if it exists
                return msg.msg
            }
        }

        return msg.msg
    }
}