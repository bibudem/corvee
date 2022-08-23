export default {
    code: 'url-shorten',
    test: (report) => {
        return /^(https?:\/\/youtu\.be\/)|(http?s:\/\/tinyurl\.com)/i.test(report.url);
    },
    exclude: true
}