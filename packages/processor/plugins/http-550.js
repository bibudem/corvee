export default {
    code: 'http-550',
    description: 'Matches any report with a http status code === 550.',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 550
    },
    level: 'error'
}