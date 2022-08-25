export default {
    code: 'http-512-599',
    description: 'Matches any report with a http status code between 512 and 599.',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode >= 512 && report.httpStatusCode < 600
    },
    level: 'error'
}