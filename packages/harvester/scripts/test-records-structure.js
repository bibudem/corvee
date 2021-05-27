import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import util from 'util';

(async () => {

    const filePath = yargs.argv._[0];

    const records = (await import(path.join(process.cwd(), filePath))).default;

    const wrongRecords = [];

    records.forEach(rec => {
        if (!rec.userData) {
            return;
        }

        var recFields = Object.keys(rec),
            usrDataFields = Object.keys(rec.userData),
            unmatchedDataFields = usrDataFields.filter(item => !recFields.includes(item)),
            unmatchedDataValues = usrDataFields.filter(item => recFields.includes(item) && rec[item] !== rec.userData[item]).filter(item => {
                if (item === 'reports') {
                    return rec.userData[item].length !== 0;
                }

                if (item === '_from') {
                    return false;
                }

                return true;
            });

        //console.log(unmatchedDataFields, unmatchedDataValues);

        if (unmatchedDataValues.length > 0) {
            const wrongRec = {
                unmatchedDataValues,
                rec,
                //userData: rec.userData
            }
            wrongRecords.push(wrongRec)
            console.log('--------------------------------------------------------')
            console.log(util.inspect(wrongRec, {
                showHidden: false,
                depth: null
            }))
        }
    });


    // console.log(util.inspect(wrongRecords, {
    //     showHidden: false,
    //     depth: null
    // }))
    console.log(`${wrongRecords.length} wrong records found.`)

})()