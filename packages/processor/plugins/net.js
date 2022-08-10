export default {
    code: 'net-*',
    priority: -1,
    test: record => {
        if (!('reports' in record) || !Array.isArray(record.reports) || record.reports.length === 0) {
            return false;
        }
        if (!record.reports.some(report => report.code && report.code.startsWith('net-'))) {
            return false;
        }

        record.reports = record.reports.map(report => {
            if (
                report.code
                && report.code.startsWith('net-')
                && !report.code.startsWith('net-cert-')
            ) {
                const ret = {
                    code: 'net-*',
                    level: 'warning'
                }
                if ('data' in report) {
                    ret._data = report.data;
                }
                return ret;
            }
            return report;
        })

        return record;
    }
}