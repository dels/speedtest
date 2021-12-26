#!/usr/bin/env node

import meow from 'meow';

import { printResultsSorted } from './lib/helper.js'
import { checkConfig, checkAndAdjustFlags } from './lib/config_helper.js'
import { readJsonFiles } from './lib/measures.js'
import {
    printGermanComplianceReport
} from './lib/analytics.js'

import dotenv from "dotenv"
dotenv.config()

const cli = meow(`
        Usage
          $ ./analyser.js

        Options
          --debug, -d
          --verbose, -v
          --days-back, -dB
          --print-empty-files, -ef
          --german, -g               (default: false)
          --silent, -q
          --data-dir                 (default: ./data)

        Examples
          $ ./analyser.js --data-dir /home/user/speedtest/data
`, {
    importMeta: import.meta,
    booleanDefault: undefined,
    flags: {
        debug: {
            type: 'boolean',
            default: false,
            alias: 'd'
        },
        verbose: {
            type: 'boolean',
            default: false,
            alias: 'v'
        },
        dataDir: {
            type: 'string',
            default: "./data",
        },
        printEmptyFiles: {
            type: 'boolean',
            default: false,
            alias: 'ef'
        },
        daysBack: {
            type: 'string',
            default: "14",
            alias: 'dB'
        }
    }
});

checkAndAdjustFlags(cli)
checkConfig()

const { measures, emptyJsonFiles }  = readJsonFiles(cli)

if(null == measures){
    process.exit(-1)
}

if(cli.flags.debug){
    printResultsSorted(measures, emptyJsonFiles)
}

if(cli.flags.printEmptyFiles){
    if(0 !== emptyJsonFiles.length){
        if(cli.flags.debug || cli.flags.verbose){
            console.log("\n --- BEGIN EMPTY FILES --- ")
        }
        let deleteStr = "rm "
        for(const f of emptyJsonFiles){
            console.log(f + " is empty")
            deleteStr += f + " "
        }
        console.log("delete all: rm " + deleteStr)
        if(cli.flags.debug || cli.flags.verbose){
            console.log("\n --- END EMPTY FILES --- ")
        }
    }
}

const daysBack = cli.flags.daysBack


printGermanComplianceReport(cli, measures, daysBack)

/*
  https://www.bundesnetzagentur.de/DE/Vportal/TK/InternetTelefon/Internetgeschwindigkeit/start.html

  - sanity check: if there has been a break of at least 3 hours after 5th and 6th measure
  - sanity check: has there been a break of at least 5 minutes between checks
  - sanity : where there at least 10 measures per day in three non-consquitive days
  - sanity check: have there been breaks between days? 
  - sanity check: has threse been all sanity checks?
  - check: we need to add "minimale Geschwindigkeit" which must not be fallenn below which is another check
*/



//console.log(JSON.stringify(process.env))
