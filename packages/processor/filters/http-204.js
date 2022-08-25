export default {
    code: 'http-204',
    description: 'Matches any report with a http status code `204 No Content`.',
    test: (report) => {
        return 'httpStatusCode' in report && report.httpStatusCode === 204
    },
    level: 'error'
}