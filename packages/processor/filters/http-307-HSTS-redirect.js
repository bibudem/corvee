export default {
    code: 'http-307-HSTS-redirect',
    description: 'Matches browsers internal redirect due to preloaded HTTP Strict Transport Security (HSTS). Even though the browser will signal this redirect with a 307 (temporary) status code, this filter signals this as a permanent redirect.',
    test: (report) => {
        return report.redirectChain?.some(r => {
            return r.status === 307
                && r.statusText?.toLowerCase() === 'internal redirect'
        })
            && report.url.startsWith('http:')
            && report.finalUrl?.startsWith('https:')
            && Array.isArray(report.redirectChain)
            && report.redirectChain[report.redirectChain.length - 1].status === 200
    },
    level: 'error'
}