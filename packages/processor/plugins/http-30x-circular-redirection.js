export default {
    code: 'http-30x-circular-redirection',
    test: (report) => {
        return report.finalUrl === report.url && 'redirectChain' in report && report.redirectChain.length > 0;
    },
    level: 'info'
}