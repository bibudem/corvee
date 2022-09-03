export default {
    code: 'http-502',
    description: 'Matches any report with a http status code === 502 (Bad Gateway).',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 502
    },
    level: 'error'
}