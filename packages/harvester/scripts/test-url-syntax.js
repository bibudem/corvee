import {
    ParsedURL
} from '../lib/parsed-url'
import urlList from '../test/urls/url-list'

function testLibrary({
    fn,
    name
}) {
    const results = {
        passed: 0,
        failed: 0,
        crashed: 0
    }

    const labels = {
        true: String.fromCodePoint(0x2713),
        false: 'x',
        null: '?'
    }
    console.group(`Testing library ${name}\n`)

    urlList.forEach(({
        url,
        valid
    }) => {
        let result = null;
        try {
            result = fn(url);
        } catch (e) {}

        let lbl = false;
        if (result === valid) {
            results.passed++;
            lbl = true;
        } else if (result === null) {
            results.crached++;
        } else {
            results.failed++;
        }
        console.log(`${labels[lbl]} ${result ? '[true]   ' : result === false ? '[false]  ' : '[crashed]'} ${url}`)
    })

    console.log(`\nPassed: ${results.passed}\nFailed: ${results.failed}\nCrashed: ${results.crashed}`)
    console.groupEnd();
    console.log('\n')
}

testLibrary({
    name: 'ParsedUrl',
    fn: (url) => {
        try {
            return (new ParsedURL(url)).isValid;
        } catch (e) {
            return null
        }
    }
})

// var re_weburl = new RegExp(
//   "^" +
//     // protocol identifier (optional)
//     // short syntax // still required
//     "(?:(?:(?:https?|ftp):)?\\/\\/)" +
//     // user:pass BasicAuth (optional)
//     "(?:\\S+(?::\\S*)?@)?" +
//     "(?:" +
//       // IP address exclusion
//       // private & local networks
//       "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
//       "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
//       "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
//       // IP address dotted notation octets
//       // excludes loopback network 0.0.0.0
//       // excludes reserved space >= 224.0.0.0
//       // excludes network & broacast addresses
//       // (first & last IP address of each class)
//       "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
//       "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
//       "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
//     "|" +
//       // host & domain names, may end with dot
//       // can be replaced by a shortest alternative
//       // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
//       "(?:" +
//         "(?:" +
//           "[a-z0-9\\u00a1-\\uffff]" +
//           "[a-z0-9\\u00a1-\\uffff_-]{0,62}" +
//         ")?" +
//         "[a-z0-9\\u00a1-\\uffff]\\." +
//       ")+" +
//       // TLD identifier name, may end with dot
//       "(?:[a-z\\u00a1-\\uffff]{2,}\\.?)" +
//     ")" +
//     // port number (optional)
//     "(?::\\d{2,5})?" +
//     // resource path (optional)
//     "(?:[/?#]\\S*)?" +
//   "$", "i"
// );

import {
    isValidUrl
} from '../../core'

testLibrary({
    name: 'https://gist.github.com/dperini/729294',
    fn: isValidUrl
})

// import urlRegex from 'url-regex'

// testLibrary({
//     name: 'url-regex',
//     fn: (url) => {
//         try {
//             return urlRegex().test(url);
//         } catch (e) {
//             return null
//         }
//     }
// })