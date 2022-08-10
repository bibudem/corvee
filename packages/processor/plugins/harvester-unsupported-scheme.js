export default {
  code: 'harvester-unsupported-scheme',
  description: 'Matches any report with an URL that has in invalid scheme.',
  test: (record) => {
    if (record.reports.some(report => report.code && report.code === 'harvester-unsupported-scheme')) {
      return record;
    }
  },
  level: 'error'
}