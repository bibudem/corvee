export default {
    code: 'http-403',
    description: 'Matches any report with a 403 http status code.',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 403
    },
    level: 'error'
}