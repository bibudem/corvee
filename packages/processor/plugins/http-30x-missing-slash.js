export default {
    code: 'http-30x-missing-slash',
    test: (report) => {
        return report.finalUrl && report.finalUrl === `${report.url}/`;
    },
    level: 'info'
}