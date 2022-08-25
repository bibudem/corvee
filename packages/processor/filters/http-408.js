export default {
    code: 'http-408',
    description: 'Matches any report with a http status code `408 Request Timeout`.',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 408
    },
    level: 'error'
}