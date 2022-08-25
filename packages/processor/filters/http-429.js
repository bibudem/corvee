export default {
    code: 'http-429',
    description: 'Matches any report with a http status code `429 Too Many Requests`.',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 429
    },
    level: 'error'
}