export default {
  code: 'net-cert-*',
  description: 'Matches any report that has a report with code starting with `net-cert-*`.',
  test: record => {
    if (record.reports.some(report => report.code && report.code.startsWith('net-cert-'))) {

      record.reports = record.reports.map(report => {
        if (
          report.code
          && report.code.startsWith('net-cert-')
        ) {

          const ret = {
            code: 'net-cert-*',
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
  },
  level: 'warning'
}