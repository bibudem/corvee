export default {
  code: 'net-system',
  description: 'Matches any report of the NetError class or MozillaError class that has a property `type` === `system`.',
  test: record => {
    if (record.reports.some(report => {
      return typeof report.name !== 'undefined'
        &&
        (
          report.name === 'NetError'
          || report.name === 'MozillaError'
        )
        && typeof report.type !== 'undefined'
        && report.type === 'system'
    })) {
      record.reports = record.reports.map(report => {
        if (
          report.name
          &&
          (
            report.name === 'NetError'
            || report.name === 'MozillaError'
          )
          && report.type && report.type === 'system'
        ) {
          report.code = 'net-system'
          report.level = 'info'
        }

        return report;

      })

      return record;
    }

  },
  level: 'info',
  exclude: true
}