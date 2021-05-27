export default {
    code: 'http-30x-https-upgrade-any',
    description: 'Matches any redirects that includes a http -> https upgrade AND a change in the origin/pathname. Ex: http://store.exemple.com -> https://exemple.com/new-store',
    test: record => {

        if (!(typeof record.finalUrl === 'string' && record.finalUrl.length > 0)) {
            return;
        }

        let url, finalUrl;

        try {
            url = new URL(record.url);
            finalUrl = new URL(record.finalUrl);
        } catch (e) {
            return false;
        }

        // Stop processing if any http-3* error has already been detected
        if (record.reports.some(report => report.code.startsWith('http-3') && report.level !== 'info')) {
            return false;
        }

        return (url.protocol === 'http:' &&
            finalUrl.protocol === 'https:' &&
            `${url.host}${url.pathname}` !== `${finalUrl.host}${finalUrl.pathname}` &&
            `${url.host}${url.pathname}` !== `www.${finalUrl.host}${finalUrl.pathname}` &&
            // ... is a successfull response
            !Number.isNaN(record.httpStatusCode) &&
            record.httpStatusCode >= 300 &&
            record.httpStatusCode < 400) ? record.finalUrl : false;
    },
    level: 'warning'
}