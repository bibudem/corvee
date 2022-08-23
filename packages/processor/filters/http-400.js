export default {
    code: 'http-400',
    description: 'Matches any report with a 400 http status code.',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 400
    },
    level: 'error'
}