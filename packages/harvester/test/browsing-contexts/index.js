import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import www from "./www.js"
import { Harvester } from "../../lib/harvester/index.js"
import saveRecords from "../save-records.js"
import saveBrowsingContexts from "../save-browsing-contexts.js"
import { console } from "../../../core/index.js"
import configs from "./config.js"

const DIRNAME = dirname(fileURLToPath(import.meta.url))

const harvester = new Harvester(configs);

saveRecords(DIRNAME, harvester, { resume: false });
saveBrowsingContexts(DIRNAME, harvester)

async function start() {
    try {
        await www();
        await harvester.run()
    } catch (e) {
        console.error(e);
        process.exit();
    }
}

start();