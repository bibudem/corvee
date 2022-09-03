export default {
    code: 'http-200',
    description: 'Matches simple `200 OK` responses, without any redirects.',
    test: function (report) {

        return 'httpStatusCode' in report &&
            report.httpStatusCode === 200 &&
            (
                !report.redirectChain ||
                report.redirectChain.length === 0
            ) &&
            this.isMuted(report);
    },
    level: 'info'
}