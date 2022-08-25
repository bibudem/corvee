export default {
  code: 'mail-unverified-address',
  description: 'Matches any report.urlData with an syntaxically valid email.',
  test: (record) => {
    if (record.reports.some(report => report.code && report.code === 'mail-unverified-address')) {
      return record.urlData;
    }
  },
  level: 'info'
}