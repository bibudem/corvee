export default {
    code: 'http-201',
    description: 'Matches simple `201 Created` responses, without any redirects.',
    test: function (report) {

        return 'httpStatusCode' in report &&
            report.httpStatusCode === 201 &&
            (
                !'redirectChain' in report ||
                report.redirectChain.length === 0
            ) &&
            this.isMuted(report);
    },
    level: 'info'
}