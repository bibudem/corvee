import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { adressesSimplifiees } from './adresses-simplifiees.js'

const DIRNAME = dirname(fileURLToPath(import.meta.url))

export const config = {
    apifyLocalStorageDir: join(DIRNAME, '../.storage'),
    puppeteerCacheDir: join(DIRNAME, '../.cache'),
    startUrl: 'https://bib.umontreal.ca/',
    // startUrl: 'https://bib.umontreal.ca/anthropologie-demographie-sociologie',
    internLinks: [
        /https?:\/\/[^\/]*bib\.umontreal\.ca(:\d+)?(\/.*)?/
    ],
    checkExtern: true,
    pageWaitUntil: 'networkidle',
    navigationOnly: true,
    useCache: true,
    maxConcurrency: 40,
    maxRequests: 400000,
    maxRequestRetries: 3,
    waitInterval: 150,

    // URLs matching the given regular expressions / strings will be ignored and not checked.
    // /^https:\/\/bib\.umontreal\.ca\/[^#?]/, 
    ignore: [
        ...adressesSimplifiees,
        // 
        /^https:\/\/bib\.umontreal\.ca\/activites/i,
        /^https:\/\/bib\.umontreal\.ca\/communications\/nouvelles/i,
        'https://www.bib.umontreal.ca/une-question',
        /^https:\/\/atrium\.umontreal\.ca\/primo\-explore/i,

        // Applications des Bibliothèques
        /^http:\/\/opurl\.bib\.umontreal\.ca:8331/i,
        /^http:\/\/opurl\.bib\.umontreal\.ca:9003\/sfx_local/i,
        /^https:\/\/api\.bib\.umontreal\.ca/,
        /^http:\/\/geoindex\.bib\.umontreal\.ca/i,
        'testproxy.umontreal.ca',
        'https://salles.bib.umontreal.ca',
        'http://permalien.bib.umontreal.ca',
        'http://expo.bib.umontreal.ca',
        'https://www.questionpoint.org',

        // Adresses UdeM connues
        /^https:\/\/www\.umontreal\.ca\/?$/i, // page d'accueil de l'UdeM
        /^https:\/\/identification\.umontreal\.ca/i,
        'https://outlook.umontreal.ca',
        'https://monportail.umontreal.ca',
        'http://bottin.dgtic.umontreal.ca',
        /^http:\/\/jade\.daa\.umontreal\.ca/,
        /^https:\/\/plancampus\.umontreal\.ca\/?$/, // redirige vers https://plancampus.umontreal.ca/montreal/

        // Widgets / médias sociaux
        /^https?:\/\/platform\.twitter\.com\/widgets/i,
        /^https?:\/\/www\.facebook\.com\/plugins/i,
        /^https?:\/\/connect\.facebook\.net/i,
        /^https?:\/\/www\.facebook\.com\/v\d/i,
        /^https?:\/\/platform\.linkedin\.com/i,
        /^https?:\/\/([^.\/]+\.)?addthis.com/i,
        /^https?:\/\/([^.\/]+\.)?sharethis.com/i,

        // Abonnements
        /^http:\/\/ovidsp\.ovid\.com/i,

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