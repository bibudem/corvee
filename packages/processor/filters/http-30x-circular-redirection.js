export default {
    code: 'http-30x-circular-redirection',
    test: (report) => {
        return report.finalUrl && report.finalUrl === report.url && report.redirectChain && report.redirectChain.length > 0;
    },
    level: 'info'
}