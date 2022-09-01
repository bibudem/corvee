const code = 'http-30x-permanent-redirect-successful'
const level = 'info'
const priority = -1

export default {
    code,
    description: 'Matches a successful response after one or more redirections where at least one of that is permanent. Returns the URL of the last permanent redirect.',
    test: (report) => {
        if (report.redirectChain &&
            report.redirectChain.length > 0 &&
            !Number.isNaN(report.httpStatusCode) &&
            report.httpStatusCode < 400
        ) {
            const permanentRedirects = report.redirectChain.filter(r => {
                return [301, 308].includes(r.status) || (r.status === 307 && r.statusText === 'Internal Redirect');
            });

            if (permanentRedirects.length > 0) {

                report.finalUrl = permanentRedirects[permanentRedirects.length - 1].url;
                report.reports.push({
                    code,
                    level,
                    priority
                })
                return report;
            }
        }
    },
    level,
    priority
}