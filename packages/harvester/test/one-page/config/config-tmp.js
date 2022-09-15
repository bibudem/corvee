import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { adressesSimplifiees } from './adresses-simplifiees.js'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

const startUrl = 'https://bib.umontreal.ca/gerer-diffuser/mesures-impact';
const guideUrl = 'https://guides.bib.umontreal.ca/embed/guides/38'
const internUrlObj = [
    new URL(startUrl),
    new URL(guideUrl)
]

export const config = {
    apifyLocalStorageDir: join(DIRNAME, '../.storage'),
    puppeteerCacheDir: join(DIRNAME, '../.cache'),
    startUrl,
    // startUrl: 'https://bib.umontreal.ca/guides/types-documents/applications-mobiles-sante',
    internLinks: [
        startUrl,
        /https:\/\/guides\.bib\.umontreal\.ca\/embed\/guides\/(38)(.*)/i
    ],
    checkExtern: true,
    pageWaitUntil: 'networkidle',
    navigationOnly: true,
    useCache: true,
    maxConcurrency: 50,
    maxRequests: 400000,
    maxRequestRetries: 2,
    waitInterval: 150,

    // URLs matching the given regular expressions / strings will be ignored and not checked.
    // /^https:\/\/bib\.umontreal\.ca\/[^#?]/, 
    ignore: [
        ...adressesSimplifiees,
        // 
        (url) => {
            try {
                url = new URL(url);
                if (internUrlObj.some(urlObj => {
                    return url.hostname === urlObj.hostname && url.pathname.startsWith(urlObj.pathname)
                })) {

                    return false;
                }

                if (url.hostname.includes('bib.umontreal.ca')) {

                    return true;
                }

                return /^([^\.]+\.)*umontreal\.ca/i.test(url.hostname);
            } catch (e) {
                // invalid url
                return false;
            }
        },

        // Widgets / médias sociaux
        /^https?:\/\/platform\.twitter\.com\/widgets/i,
        /^https?:\/\/www\.facebook\.com\/plugins/i,
        /^https?:\/\/connect\.facebook\.net/i,
        /^https?:\/\/www\.facebook\.com\/v\d/i,
        /^https?:\/\/platform\.linkedin\.com/i,
        /^https?:\/\/([^.\/]+\.)?addthis.com/i,
        /^https?:\/\/([^.\/]+\.)?sharethis.com/i,

        // Autres
        'www.canlii.org',
        'cairn.info',
        'advance.lexis.com',
        'nouvelles.umontreal.ca',
        /^https:\/\/fusion\.google\.com/i,
        /^https:\/\/books\.google\.com/i,

        // Temporaire
        // 'https://atrium.umontreal.ca'
    ],

    // Check but do not recurse into URLs matching the given strings / regular expressions. 
    noFollow: [
        /^https?:\/\/atrium\.umontreal\.ca/,
        /^https?:\/\/primo-test\.bib\.umontreal\.ca/,
        /^https?:\/\/bibres\.bib\.umontreal\.ca/,
        /^https?:\/\/pds\.bib\.umontreal\.ca/,
        // /^https?:\/\/dx\.doi\.org/,
        /^https?:\/\/calypso\.bib\.umontreal\.ca/,
        'http://opurl.bib.umontreal.ca',
        'https://papyrus.bib.umontreal.ca',
        'https://calypso.bib.umontreal.ca',
        'https://jupiter.bib.umontreal.ca/GIF',
        'http://mentor.bib.umontreal.ca',
        'http://olympe.bib.umontreal.ca'
    ],

    /**
     * Node.js URL class.
     * @external URL
     * @see {@link https://nodejs.org/api/url.html#url_class_url}
     */

    /** @member {(string|external:URL)} [proxy] - Url of a web proxy server (string or URL object) */
    // proxy: 'some-url',
    // proxy: 'http://localhost:8888'
};