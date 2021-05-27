export default {
    code: 'http-401',
    description: 'Matches any report with a 401 http status code.',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 401
    },
    level: 'error'
}