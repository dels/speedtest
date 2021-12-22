#!/usr/bin/env node

const { readJsonFiles } = require('./measures')

require('dotenv').config()

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

function analyzeNintyPercentDownloadAtLeast(measures, down, up){
    let days = {}
    days.days_reached = 0
    days.days = 0
    const now = new Date()
    for(let i = 0; i <= 3; i++){
        const date = "" + now.getFullYear() + now.getMonth() + (now.getDate() - i)
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

function analyseBelowNintyPercentDownload(measures, down, up){
    let times = {}
    times.times_below = 0
    times.times_above = 0
    times.times = 0
    const now = new Date()
    for(let i = 0; i <= 3; i++){
        const date = "" + now.getFullYear() + now.getMonth() + (now.getDate() - i)
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

let measures = {}
let emptyJsonFiles = []
measures = readJsonFiles(emptyJsonFiles)
printResultsSorted(measures, emptyJsonFiles)

if(0 !== emptyJsonFiles.length){
    console.log("---")
    for(const f of emptyJsonFiles){
        console.log(f + " is empty")
    }
    console.log("delete all: rm " + emptyJsonFiles)
}

const belowNintyPercentDownoload = analyseBelowNintyPercentDownload(measures, process.env.SPEEDTEST_DOWNLOAD, process.env.SPEEDTEST_UPLOAD)
const nintyPercentAtLeast = analyzeNintyPercentDownloadAtLeast(measures, process.env.SPEEDTEST_DOWNLOAD, process.env.SPEEDTEST_UPLOAD)
console.log("within last three days: " + belowNintyPercentDownoload.times_below + "/ " + belowNintyPercentDownoload.times + " times the measures was below (" + belowNintyPercentDownoload.percent_below + "% are below)")

console.log("on " + nintyPercentAtLeast.days_reached + " out of " + nintyPercentAtLeast.days_reached + " days we reached ninty percent at least once!" )

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
