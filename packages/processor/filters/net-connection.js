export default {
  code: 'net-connection',
  description: 'Matches any report of the NetError class or MozillaError class that has a property `type` === `connection`.',
  test: record => {
    if (record.reports.some(report => {
      return typeof report.name !== 'undefined'
        &&
        (
          report.name === 'NetError'
          || report.name === 'MozillaError'
        )
        && typeof report.type !== 'undefined'
        && report.type === 'connection'
    })) {
      record.reports = record.reports.map(report => {
        if (
          report.name
          &&
          (
            report.name === 'NetError'
            || report.name === 'MozillaError'
          )
          && report.type && report.type === 'connection'
        ) {
          report.code = 'net-connection'
          report.level = 'error'
        }

        return report;

      })

      return record;
    }

  },
  level: 'error'
}