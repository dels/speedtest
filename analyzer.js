#!/usr/bin/env node

import meow from 'meow';

import { printResultsSorted } from './lib/helper.js'
import { checkConfig, checkAndAdjustFlags } from './lib/config_helper.js'
import { readJsonFiles } from './lib/measures.js'
import {
    analyzeDailyNintyPercentDownloadAtLeast,
    analyzeBelowNintyPercentDownload,
    daysUnderMinimalDownload, 
} from './lib/analytics.js'

import dotenv from "dotenv"
dotenv.config()

const cli = meow(`
        Usage
          $ ./analyser.js

        Options
          --debug, -d,  debug
          --verbose, -v, verbose
          --data-dir, data-dir
          --days-back, -dB, days-back
          --print-empty-files, -ef, print-empty-files  

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





console.log("\n --- STATS BEGIN --- ")
/*
 * 1. Nicht an mindestens zwei von drei Messtagen jeweils mindestens einmal 90 % der vertraglich 
 * vereinbarten maximalen Geschwindigkeit erreicht werden
 */
const nintyPercentAtLeast = analyzeDailyNintyPercentDownloadAtLeast(
    cli,
    measures,
    process.env.SPEEDTEST_DOWNLOAD,
    process.env.SPEEDTEST_UPLOAD,
    daysBack)

// TODO: this must not go through all days but through 3 day blocks
console.log("\non " + nintyPercentAtLeast.days_reached + " out of " + nintyPercentAtLeast.days
            + " days we reached ninty percent at least once!" )

if(3 > nintyPercentAtLeast.days){
    console.log("too few measures for analyze 2 out of 3 days we reached at least 90% once a day")
} else {
    if(2 > nintyPercentAtLeast.days_reached){
        console.log("\n\tATTENTION: we reached at least once a day 90% of maximum download speed on less than 2 days within last 14 days \n")
    } else {
        console.log("\n\tCHECK PASSED: we reached on at least two days at least 90% of maximum download speed within last 14 days\n")
    }
}

/*
 * 2. die normalerweise zur Verfügung stehende Geschwindigkeit nicht in 90 % der Messungen erreicht wird 
 */
const belowNintyPercentDownoload = analyzeBelowNintyPercentDownload(
    cli,
    measures,
    process.env.SPEEDTEST_USUAL_DOWNLOAD,
    process.env.SPEEDTEST_USUAL_UPLOAD,
    daysBack)

console.log("\nwithin last " + daysBack + " days: "
            + belowNintyPercentDownoload.times_below + "/" + belowNintyPercentDownoload.times
            + " times the measured download was below. this means " + ((belowNintyPercentDownoload.percent_above *100) /100) + "% were above)")
if(90.0 > Math.floor(belowNintyPercentDownoload.percent_above)){
    console.log("\n\tATTENTION: we reached only " + ((belowNintyPercentDownoload.percent_above *100) /100)
                + "%. required are 90% at least\n")
} else {
    console.log("\n\tCHECK PASSED: we reached on average per measure 90% of maximum download speed within last 14 days\n")
}

/*
 * 3. an mindestens zwei von drei Messtagen jeweils mindestens einmal die minimale Geschwindigkeit unterschritten
 */
const countBelowMinimalDownload = daysUnderMinimalDownload(
    cli,
    measures,
    process.env.SPEEDTEST_MIN_DOWNLOAD,
    process.env.SPEEDTEST_UPLOAD,
    daysBack)

// TODO: this must not go through all days but through 3 day blocks
console.log("\non " + countBelowMinimalDownload.days_below + " out of " + countBelowMinimalDownload.days + " days "
            + "we dropped below minimal speed at least once.")

if(3 > countBelowMinimalDownload.days){
    console.log("too few measures for analyze 2 out of 3 days we measured below minimum speed.")
} else {
    if(2 < countBelowMinimalDownload.days_below){
        console.log("\n\tATTENTION: we fall in more than 2 measures below minimal download speed "
                    + "at least once per day "
                    + "within the last " + daysBack + " days\n")        
    } else {
        console.log("\n\tCHECK PASSED: within last 14 days there were less than 3 days on which "
                    + "we fall below minimal download speed at least once\n")
}
}


console.log(" --- STATS END --- ")
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
