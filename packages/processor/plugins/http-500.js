export default {
    code: 'http-500',
    description: 'Matches any report with a http status code === 500.',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 500
    },
    level: 'error'
}