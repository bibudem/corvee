export default {
    code: 'http-410',
    description: 'Matches any report with a http status code `410 Gone`.',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 410
    },
    level: 'error'
}