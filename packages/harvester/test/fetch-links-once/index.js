import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import yargs from 'yargs'
import { Harvester } from "../../lib/harvester/index.js"
import saveRecords from "../save-records.js"
import { console } from '../../../core/index.js'
import configs from "./config.js"

const DIRNAME = dirname(fileURLToPath(import.meta.url))

const argv = yargs
    .options({
        r: {
            alias: 'resume',
            default: false,
            type: 'boolean',
            describe: 'Resumes a previously stoped job.',
        }
    })
    .help()
    .argv;

const harvester = new Harvester(configs);

saveRecords(DIRNAME, harvester);

// logErrorCodes(harvester, join(DIRNAME, "./error-codes.json"));

const runOptions = {
    resume: argv.resume
}

console.info(runOptions)

async function start() {
    try {
        await harvester.run(runOptions)
    } catch (e) {
        console.error(e);
        process.exit();
    }
}

start();