export default {
    code: 'http-30x-slash',
    test: (report) => {

        if (report.finalUrl === null) {
            return
        }

        if (
            report.httpStatusCode === null
            || report.httpStatusCode < 300
            || report.httpStatusCode >= 400
        ) {
            return
        }

        if (report.url.endsWith('/')) {
            return `${report.finalUrl}/` === report.url
        }

        return report.finalUrl === `${report.url}/`;
    },
    level: 'info'
}