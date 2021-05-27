export default {
    code: 'net-*',
    test: record => {
        if (!('reports' in record) || !Array.isArray(record.reports) || record.reports.length === 0) {
            return false;
        }
        if (!record.reports.some(report => report.code.startsWith('net-'))) {
            return false;
        }

        record.reports = record.reports.map(report => {
            if (report.code.startsWith('net-')) {
                const ret = {
                    code: 'net-*',
                    level: 'warning'
                }
                if ('data' in report) {
                    ret.data = report.data;
                }
                return ret;
            }
            return report;
        })

        return record;
    }
}