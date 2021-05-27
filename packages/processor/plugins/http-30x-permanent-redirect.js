export default {
    code: 'http-30x-permanent-redirect',
    description: 'Matches a successful response after one or more redirections where at least one of that is permanent. Returns the URL of the last permanent redirect.',
    test: (report) => {
        if ('redirectChain' in report &&
            report.redirectChain.length > 0 &&
            !Number.isNaN(report.httpStatusCode) &&
            report.httpStatusCode < 400
        ) {
            const permanentRedirects = report.redirectChain.filter(r => {
                return [301, 308].includes(r.status) || (r.status === 307 && r.statusText === 'Internal Redirect');
            });

            // return permanentRedirects.length > 0 ? permanentRedirects[permanentRedirects.length - 1].url : false;
            if (permanentRedirects.length > 0) {

                report.finalUrl = permanentRedirects[permanentRedirects.length - 1].url;
                report.reports.push({
                    code: 'http-30x-permanent-redirect',
                    level: 'error'
                })
                return report;
                // return true;
            }
        }
    },
    level: 'warning',
    priority: -1
}