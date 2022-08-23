export default {
  code: 'net-certificate',
  description: 'Matches any report of the NetError class that has a property `type` === `certificate`.',
  test: record => {
    if (record.reports.some(report => {
      return typeof report.name !== 'undefined'
        && report.name === 'NetError'
        && typeof report.type !== 'undefined'
        && report.type === 'certificate'
    })) {
      record.reports = record.reports.map(report => {
        if (
          report.name && report.name === 'NetError'
          && report.type && report.type === 'certificate'
        ) {
          report.code = 'net-certificate'
          report.level = 'error'
        }

        return report;

      })

      return record;
    }

  },
  level: 'error'
}