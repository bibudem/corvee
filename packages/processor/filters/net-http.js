export default {
  code: 'net-http',
  description: 'Matches any report of the NetReport class or MozillaReport class that has a property `type` === `http`.',
  test: record => {
    if (record.reports.some(report => {
      return typeof report.name !== 'undefined'
        &&
        (
          report.name === 'NetReport'
          || report.name === 'MozillaReport'
        )
        && typeof report.type !== 'undefined'
        && report.type === 'http'
    })) {
      record.reports = record.reports.map(report => {
        if (
          report.name &&
          (
            report.name === 'NetReport'
            || report.name === 'MozillaReport'
          )
          && report.type && report.type === 'http'
        ) {
          report.code = 'net-http'
          report.level = 'error'
        }

        return report;

      })

      return record;
    }

  },
  level: 'error'
}