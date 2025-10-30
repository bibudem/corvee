import fs from 'node:fs'
import { join } from 'node:path'

import { console, inspect } from '@corvee/core'

export function saveReportCodes(harvester, jobId) {

    const dir = join(import.meta.url, '..', 'data')
    const fileName = join(dir, `${jobId}_report-codes.json`)

    const reportCodes = new Map()

    let i = 0

    const reportCodesStream = fs.createWriteStream(fileName, {
        autoClose: false
    })

    harvester.on('record', function onRecord(record) {
        if (record.reports) {
            record.reports.forEach(report => {
                let reportCode = null
                let reportType

                i++

                if ('code' in report) {
                    reportCode = report.code

                    if ('type' in report) {
                        reportType = report.type
                    }
                } else {
                    console.todo('This report has no code')
                    console.todo(inspect(record))
                    reportCode = '???'
                }

                if (!reportCodes.has(reportCode)) {
                    reportCodes.set(reportCode, {
                        reportCode,
                        reportType,
                        count: 0
                    })
                }
                reportCodes.get(reportCode).count++
            })
        }
    })

    harvester.on('end', () => {
        reportCodesStream.write(JSON.stringify([...reportCodes.values()].sort((a, b) => {
            const nameA = a.reportCode.toUpperCase() // ignore upper and lowercase
            const nameB = b.reportCode.toUpperCase() // ignore upper and lowercase
            if (nameA < nameB) {
                return -1
            }
            if (nameA > nameB) {
                return 1
            }

            // names must be equal
            return 0
        }), null, 2))

        console.info(`${reportCodes.size} report codes types saved to ${fileName}`)

        reportCodesStream.end()
    })
}