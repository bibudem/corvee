export default {
  code: 'harvester-timed-out',
  description: 'Matches any report where the request or response timed out.',
  test: (record) => {
    if (record.reports.some(report => report.code && report.code === 'harvester-timed-out')) {
      return record;
    }
  },
  level: 'error'
}