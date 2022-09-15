#!/usr/bin/env node

Function = Function //;node --module "$0" "$@";exit

'use strict';

import yargs from 'yargs'
import { Corvee as Harvester } from '../lib/index.js'
import { console, inspect } from '../../core/index.js';

const argv = yargs
    .usage(`Usage:
  $ $0 [options] <url>[, <url>]*`)
    .example('$0 https://bib.umontreal.ca')
    .options({
        'assets': {
            alias: 'a',
            type: 'boolean',
            default: false,
            describe: 'Analyzes page assets (css, js, images, etc.)'
        },
        'depth': {
            alias: 'd',
            type: 'number',
            describe: 'If set, will max the level of recursions.'
        },
        'requests': {
            alias: 'r',
            type: 'number',
            describe: 'If set, will set the max number of requests.'
        },
        'trials': {
            alias: 't',
            type: 'number',
            default: 0,
            describe: 'Number of retries if a request fails.'
        }
    })
    .alias('help', 'h')
    .showHelpOnFail(true)
    .help()
    .demandCommand()
    .argv;

const urls = argv._
const records = [];

if (urls && urls.length) {

    const opts = {
        // fetchLinksOnce: false,
        // useCache: false,
        maxConcurrency: 1,
        maxRequests: 1,
        // maxDepth: 1,
        navigationOnly: !argv.assets,
        //schemes: ['*'],
        maxRequestRetries: argv.trials,
        internLinks: ['corvee:'],
        useChrome: true,
        ignore: [
            // 'https://bib.umontreal.ca',
            // 'https://www.umontreal.ca',
            'https://atrium.umontreal.ca',
            // Adresses simplifiées
            /^https:\/\/bib\.umontreal\.ca\/(24-7|bci|bibeclair|calendrier|calypso|citer|code-conduite|deposer-theses|geoindex|livraison|maestro|outils-traducteur|papyrus|peb|periodiques|pret|proxy|revues|salles|bibliotheque-sciences|rediger-theses|sid|soutien-informatique|theses|unequestion|zones)$/i,

            // Autres redirections sur bib.umontreal.ca
            /^https:\/\/bib\.umontreal\.ca\/(formation|gif|nouvelles-acquisitions|salle)$/i,
            /^https:\/\/bib\.umontreal\.ca\/(chercher\/mon-dossier|formations\/capsules-video-youtube|guides\/bd\/atrium)$/i,

            // Adresses simplifiées d'Atrium
            /^https:\/\/atrium\.umontreal\.ca\/(dossier|notice|UM:)$/i,
            /^http:\/\/opurl\.bib\.umontreal\.ca:8331/,
            /^https:\/\/atrium\.umontreal\.ca\/primo\-explore/i,

            // Applications des Bibliothèques
            /^https:\/\/api\.bib\.umontreal\.ca/,
            /^http:\/\/geoindex\.bib\.umontreal\.ca/i,

            'testproxy.umontreal.ca',
            'https://www.bib.umontreal.ca/une-question',
            'https://salles.bib.umontreal.ca',
            'http://permalien.bib.umontreal.ca',
            'http://expo.bib.umontreal.ca',
            'https://www.questionpoint.org',
        ]
    }

    if (argv.depth) {
        opts.maxDepth = argv.depth;
    } else if (argv.requests) {
        opts.maxDepth = Infinity;
    }

    if (argv.requests) {
        opts.maxRequests = argv.requests;
    } else if (argv.depth) {
        opts.maxRequests = Infinity;
    }

    if (argv.links) {
        opts.internLinks = urls
    }

    const harvester = new Harvester(opts);

    harvester.setPlugins([webScrapingPlugin()])

    harvester.on('record', record => records.push(record))

    // harvester.on('asset-links', data => {
    //     console.log(process.cwd())
    //     fs.writeFileSync(path.join(process.cwd(), 'asset-links.csv'), data)
    // })

    harvester.on('end', () => {

        if (records.length) {
            if (records.length === 1) {
                console.log(inspect(records[0], {
                    depth: 3
                }));
            } else {
                console.log(inspect(records, {
                    depth: 4
                }))
            }
        }

        // process.env.APIFY_LOCAL_STORAGE_DIR = harvester.config.storageDir;
        //     const assetsLinkStore = await Dataset.open('assets-urls');
        //     const data = await assetsLinkStore.getData({
        //         format: 'csv',
        //         clean: true
        //     })
        //     fs.writeFileSync(path.join(process.cwd(), 'asset-links.csv'), data);
        console.log('Finished.')
    })

    harvester.addUrl(urls)

    // Apify.main(harvester.run())
    harvester.run();
} else {
    // argv.help();
}