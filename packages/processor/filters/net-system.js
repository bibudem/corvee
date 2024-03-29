export default {
  code: 'net-system',
  description: 'Matches any report of the NetReport class or MozillaReport class that has a property `type` === `system`.',
  test: record => {
    if (record.reports.some(report => {
      return typeof report.name !== 'undefined'
        &&
        (
          report.name === 'NetReport'
          || report.name === 'MozillaReport'
        )
        && typeof report.type !== 'undefined'
        && report.type === 'system'
    })) {
      record.reports = record.reports.map(report => {
        if (
          report.name
          &&
          (
            report.name === 'NetReport'
            || report.name === 'MozillaReport'
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