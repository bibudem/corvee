export default [
    'http://papyrus.bib.umontreal.ca',
    /^http:\/\/hdl\.handle\.net\//i,
    report => 'finalUrl' in report && report.finalUrl && report.finalUrl.startsWith('https://www.tumblr.com/login'),
    /^http:\/\/ovidsp\.ovid\.com\/ovidweb/i,
    'https://jcr.clarivate.com'
]