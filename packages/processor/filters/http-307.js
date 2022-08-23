export default {
    code: 'http-307',
    test: (report) => {
        return 'redirectChain' in report &&
            report.redirectChain.length > 0 &&
            report.redirectChain.some(r => {
                r.status === 307
            })
    },
    level: 'warning'
}