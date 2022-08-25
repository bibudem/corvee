export default {
    code: 'http-30x-all-temporary-redirects',
    description: 'Matches a successful response after one or more redirections where all of them are temporary (302, 303, 307).',
    test: (report) => {
        return 'redirectChain' in report &&
            report.redirectChain.length > 0 &&
            !Number.isNaN(report.httpStatusCode) &&
            report.httpStatusCode < 400 &&
            report.redirectChain.every(r => [302, 303, 307].includes(r.status)) &&
            !report.redirectChain.some(r => {
                // This is a protocole upgrade done by Chromium due to a
                // Content Security Policy previously obtained from the server
                // We'll consider this a permanent redirect
                return r.status === 307 && r.statusText === 'Internal Redirect'
            })
    },
    level: 'info'
}