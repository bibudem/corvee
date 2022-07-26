import fs from 'fs'
import { console } from '../../../core/lib/logger';

export function logErrorCodes(harvester, filePath) {

    const errorCodes = new Set();

    const errorCodesStream = fs.createWriteStream(filePath, {
        autoClose: false
    })

    harvester.on('record', function onRecord(record) {
        if ('reports' in record && Array.isArray(record.reports)) {
            record.reports.forEach(report => {
                //console.debug(report)
                let errorCode = null;

                if ('code' in report) {
                    errorCode = report.code
                } else if (report && 'normalized' in report && 'code' in report.normalized) {
                    errorCode = report.normalized.code
                } else {
                    console.todo('??????????????????????????????????????????')
                    console.todo(report)
                    errorCode = '???'
                }

                if (!errorCodes.has(errorCode)) {
                    errorCodes.add(errorCode)
                    errorCodesStream.write(errorCode + '\n')
                }
            })
        }
    })

    harvester.on('end', () => {
        //fs.writeFileSync(path.join(__dirname, './error-codes.json'), JSON.stringify(Array.from(errorCodes), null, 2), 'utf8');
        //errorCodesStream.write(Array.from(errorCodes).join('\n'))
        errorCodesStream.end()
    })
}