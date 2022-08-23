export default {
    code: 'http-404',
    description: 'Matches any report with a 404 http status code.',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 404
    },
    level: 'error'
}