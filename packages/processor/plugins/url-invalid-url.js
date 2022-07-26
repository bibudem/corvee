export default {
  code: 'url-invalid-url',
  description: 'Matches any report with an invalid URL.',
  test: (record) => {
    if (record.reports.some(report => report.code && report.code === 'url-invalid-url')) {
      return record;
    }
  },
  level: 'error'
}