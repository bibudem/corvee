import Apify from "apify";
import www from "./www";
import { Harvester } from "../../lib/harvester";
import saveRecords from "../save-records";
import saveBrowsingContexts from "../save-browsing-contexts";
import { console } from "../../../core/lib/logger";
import configs from "./config";

const harvester = new Harvester(configs);

saveRecords(__dirname, harvester, { resume: false });
saveBrowsingContexts(__dirname, harvester)

async function start() {
    try {
        await www();
        Apify.main(harvester.run());
    } catch (e) {
        console.error(e);
        process.exit();
    }
}

start();