export default function(urlList) {
    return {
        code: 'http-404',
        description: 'Matches any report who\'s finalURL is known to be used as a 404 page.',
        test: (report) => {
            // Must have / be
            if (!('httpStatusCode' in report && report.httpStatusCode < 400 && 'finalUrl' in report && typeof report.finalUrl === 'string')) {
                return false;
            }

            return urlList.some(url => typeof url === 'string' ? report.finalUrl.includes(url) : url.test(report.finalUrl));
        },
        level: 'error'
    }
}