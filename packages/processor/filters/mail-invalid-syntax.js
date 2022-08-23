export default {
  code: 'mail-invalid-syntax',
  description: 'Matches any report with an invalid email.',
  test: (record) => {
    if (record.reports.some(report => report.code && report.code === 'mail-invalid-syntax')) {
      return record.urlData;
    }
  },
  level: 'error'
}