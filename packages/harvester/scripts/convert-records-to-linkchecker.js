import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import {
    toXML,
    toSQL
} from '../lib/utils/link-checker'

const srcFile = path.join(process.cwd(), yargs.argv._[0])
const data = JSON.parse(fs.readFileSync(srcFile, 'utf-8'))
const outDir = path.dirname(srcFile)
console.log(`Processing ${srcFile}`)
toXML(outDir, data)
toSQL(outDir, data)
console.log('Done.')