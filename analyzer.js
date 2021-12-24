#!/usr/bin/env node

import meow from 'meow';

import { readJsonFiles } from './lib/measures.js'

import dotenv from "dotenv"
dotenv.config()

function printResultsSorted(measures, emptyJsonFiles, precision=2){
    for(const date of Object.keys(measures).sort()){
	console.log(date + ": ")
	for(const time of Object.keys(measures[date]).sort()){
	    console.log("\t" + time + " download at " +
			((measures[date][time].download_mbit).toFixed(precision)) + " MBit/s. upload at " +
			((measures[date][time].upload_mbit).toFixed(precision)) + " MBit/s. Ping: " + measures[date][time]["ping"])
	}
    }
}

function analyzeNintyPercentDownloadAtLeast(measures, down, up, daysBack){
    let days = {}
    days.days_reached = 0
    days.days = 0
    const now = new Date()
    for(let i = 0; i < daysBack; i++){
        now.setDate(now.getDate() - 1)
        const date = "" + now.getFullYear() + now.getMonth() + (now.getDate() < 10 ? "0" + now.getDate() : "" + now.getDate())
        if(null == measures[date]){
            //console.warn("for " + date + " no measures have been found")
            continue
        }
        days[date] = false
        for(const time of Object.keys(measures[date])){
            days.days += 1
            if((measures[date][time].download_mbit) >= (process.env.SPEEDTEST_DOWNLOAD * 0.9)){
                if(false === days[date]){
                    days.days_reached += 1
                    days[date] = true
                }
            }
        }
    }
    return days
}

function analyseBelowNintyPercentDownload(measures, down, up, daysBack){
    let times = {}
    times.times_below = 0
    times.times_above = 0
    times.times = 0
    const now = new Date()
    for(let i = 0; i < daysBack; i++){
        now.setDate(now.getDate() - 1)
        const date = "" + now.getFullYear() + now.getMonth() + (now.getDate() < 10 ? "0" + now.getDate() : "" + now.getDate())
        if(null == measures[date]){
            //console.warn("for " + date + " no measures have been found")
            continue
        }
        for(const time of Object.keys(measures[date])){
            times.times += 1
            if((measures[date][time].download_mbit) < (process.env.SPEEDTEST_DOWNLOAD * 0.9)){
                times.times_below += 1
            } else {
                times.times_above += 1
            }
        }
    }
    times.percent_below = (times.times_below / times.times) * 100 
    return times
}

const cli = meow(`
	Usage
	  $ foo

	Options
	  --debug, -d,  debug
          --verbose, -v, verbose
          --days-back, -dB, days-back
          --print-empty-files, -ef, print-empty-files  

	Examples
	  $ foo --debug
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
	printEmptyFiles: {
	    type: 'boolean',
	    default: false,
	    alias: 'ef'
	},
        daysBack: {
            type: 'string',
	    default: "7",
	    alias: 'dB'
        }
    }
});

if(cli.flags.debug){
    cli.flags.printEmptyFiles = true
    console.log("flags: " + JSON.stringify(cli.flags))
    console.log("input: " + JSON.stringify(cli.input))
    console.log("debug? " + cli.flags.debug)
}

const {measures, emptyJsonFiles }  = readJsonFiles(cli.flags.printEmptyFiles)

if(null == measures){
    process.exit(-1)
}

if(cli.flags.debug || cli.flags.verbose){
    printResultsSorted(measures, emptyJsonFiles)
}

if(0 !== emptyJsonFiles.length){
    if(cli.flags.debug){
        console.log("---")
    }
    let deleteStr = "rm "
    for(const f of emptyJsonFiles){
        console.log(f + " is empty")
        deleteStr += f + " "
    }
    console.log("delete all: rm " + deleteStr)
}

const daysBack = cli.flags.daysBack


const belowNintyPercentDownoload = analyseBelowNintyPercentDownload(measures, process.env.SPEEDTEST_DOWNLOAD, process.env.SPEEDTEST_UPLOAD, daysBack)
const nintyPercentAtLeast = analyzeNintyPercentDownloadAtLeast(measures, process.env.SPEEDTEST_DOWNLOAD, process.env.SPEEDTEST_UPLOAD, daysBack)

console.log("--- STATS BEGIN ---")
console.log("within last " + daysBack + " days: " + belowNintyPercentDownoload.times_below + "/ " + belowNintyPercentDownoload.times + " times the measures was below (" + Math.floor(belowNintyPercentDownoload.percent_below) + "% are below)")

console.log("on " + nintyPercentAtLeast.days_reached + " out of " + nintyPercentAtLeast.days_reached + " days we reached ninty percent at least once!" )
console.log("--- STATS END ---")
/*
  https://www.bundesnetzagentur.de/DE/Vportal/TK/InternetTelefon/Internetgeschwindigkeit/start.html

  todo for compliant checking:
  - fixme: we cant just work for the three days, we need to find timeframes which are suitable for checking the following parameters
  - sanity check: if there has been a break of at least 3 hours after 5th and 6th measure
  - sanity check: has there been a break of at least 5 minutes between checks
  - sanity check: where there at least 10 measures per day in three non-consquitive days
  - sanity check: have there been breaks between days? 
  - sanity check: has threse been all sanity checks?
  - check: we need to add "minimale Geschwindigkeit" which must not be fallenn below which is another check
*/

//console.log(JSON.stringify(process.env))
