import fs from 'fs'
import path from 'path'
import util from 'util'

import xml2js from 'xml2js'
import yargs from 'yargs'

const argv = yargs
    .usage(`Usage
      $ $0 <file>`)
    .help()
    .argv;

if (argv._.length === 0) {
    argv.showHelp();
    process.exit()
}

const parseOpts = {
    trim: true,
    explicitArray: false,
    charsAsChildren: true,
    explicitRoot: false,
    mergeAttrs: true
}
const parser = new xml2js.Parser(parseOpts);

fs.readFile(path.join(process.cwd(), argv._[0]), (err, data) => {
    if (err) {
        throw err;
    }
    parser.parseString(data, (err, result) => {
        if (err) {
            throw err;
        }
        // console.log(JSON.stringify(result))
        console.log(util.inspect(result.urldata[0], false, null))

        const reports = [];

        result.urldata.forEach(urldata => {

            urldata.parent = urldata.parent._;
            urldata.extern = !!urldata.extern;
            urldata.level = +urldata.level;
            urldata.timing = +urldata.checktime;
            delete urldata.checktime;
            urldata.text = urldata.name;
            delete urldata.name;

            ['infos']

        });
        console.log(util.inspect(result.urldata[0], false, null))
    })
})