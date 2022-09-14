import { console, inspect } from '../../core/index.js'

export function messageFactory(messages) {

    Object.keys(messages).forEach(m => {
        if ('pattern' in messages[m] && typeof messages[m].pattern === 'string') {
            messages[m].pattern = new RegExp(messages[m].pattern,)
        }
    })

    return function message(key, rawMsg) {

        if (typeof messages[key] === 'undefined') {
            return;
        }

        const msg = messages[key];

        if (msg.pattern && rawMsg) {
            const reg = msg.pattern.exec(rawMsg);
            if (reg && reg.length > 1) {
                let message = msg.substitution;
                for (var i = 1; i < reg.length; i++) {
                    message = message.replace(`$${i}`, reg[i])
                }

                return message;

            } else if (msg.msg) {
                // Use default message if it exists
                return msg.msg;
            }
        }

        return msg.msg;
    }
}