import { normalizeUrl } from '@corvee/core'

export default {
    code: 'http-30x-redirect-to-welcome-page',
    description: 'Matches redirects from a domain URL to a welcome page. Ex: http://www.exemple.com -> http://www.exemple.com/welcome.html',
    test: record => {

        if (record.finalUrl === null) {
            return
        }

        let url, finalUrl

        try {
            url = new URL(normalizeUrl(record.url))
            finalUrl = new URL(normalizeUrl(record.finalUrl))
        } catch (e) {
            return false
        }

        return url.protocol === finalUrl.protocol &&
            url.hostname === finalUrl.hostname &&
            url.pathname === '/' &&
            finalUrl.search === '' &&
            // Looking for paths like '/welcome' or '/fr/' or '/fr/index.php'
            finalUrl.pathname.split('/').filter(step => step).length <= 1 &&
            // ... is a successfull response
            !Number.isNaN(record.httpStatusCode) &&
            record.httpStatusCode >= 300 &&
            record.httpStatusCode < 400
    },
    exclude: true
}