export default {
    code: 'url-shorten',
    test: (report) => {
        return /^https?:\/\/(youtu\.be)|(tinyurl\.com)|(goo\.gl)|(bit\.ly)\//i.test(report.url);
    },
    exclude: true
}