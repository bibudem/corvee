import path from "path";
import Apify from "apify";
import www from "./www";

import {
  Harvester
} from "../../lib/harvester";

import saveRecords from "../save-records";

import {
  logErrorCodes
} from "../../lib/utils";

import {
  console
} from "../../../core/lib/logger";

import configs from "./config";

const harvester = new Harvester(configs);

saveRecords(__dirname, harvester);

logErrorCodes(harvester, path.join(__dirname, "./error-codes.json"));

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