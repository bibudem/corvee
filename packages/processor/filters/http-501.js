export default {
    code: 'http-501',
    description: 'Matches any report with a http status code === 501(Not Implemented).',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 501
    },
    level: 'error'
}