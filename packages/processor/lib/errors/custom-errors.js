export default [{
    code: 'http-301',
    level: 'error',
    test: report => report.url && report.url.startsWith('http://www.crepuq.qc.ca'),
}]