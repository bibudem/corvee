import Apify from "apify";

import yargs from 'yargs'

import {
    Harvester
} from "../../lib/harvester";

import saveRecords from "../save-records";

import {
    console
} from '../../../core/lib/logger';

import configs from "./config";

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

saveRecords(__dirname, harvester);

// logErrorCodes(harvester, path.join(__dirname, "./error-codes.json"));

const runOptions = {
    resume: argv.resume
}

console.info(runOptions)

async function start() {
    try {
        Apify.main(harvester.run(runOptions));
    } catch (e) {
        console.error(e);
        process.exit();
    }
}

start();