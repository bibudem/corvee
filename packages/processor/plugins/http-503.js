export default {
    code: 'http-503',
    description: 'Matches any report with a http status code === 503.',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 503
    },
    level: 'error'
}