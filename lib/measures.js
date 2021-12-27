
import fs from 'fs'
import path from 'path'

import { measuresValid } from './helper.js'
import { getDataDir, cliValid } from './client_helper.js'
import { getTodayDate, getTodayTime, } from './date_time_utils.js' 

export function measureWithinLastMinutes(cli, measures, scanMinutesBeforeNow=5){
    cliValid(cli)
    measuresValid(measures)
    let date = getTodayDate(cli)
    if(null == scanMinutesBeforeNow || isNaN(scanMinutesBeforeNow) || 0 > scanMinutesBeforeNow){
        if(cli.flags.verbose){
            console.log("WARN: minutes scanning radius is invalid: " + scanMinutesBeforeNow)
        }
        return null
    }
    // was there a measure today, in this hour
    if(undefined === measures[date] || 0 === Object.keys(measures[date]).length){
        if(cli.flags.debug){
            console.log("found no measures for date " + getTodayDate(cli, -1) + "")
        }
        if(cli.flags.verbose){
            console.log("there was no measure today... continuing\n")
        }
        return false
    }

    for(let i = 0; i < scanMinutesBeforeNow; i++){
        let now = getTodayTime(cli, i * -1)
        if(cli.flags.debug){
            console.debug("checking if we have a measure at " + now)
        }
        if(measures[date][now]){
            if(cli.flags.debug){
                console.debug("\tfound measure at " + now + ": " + measures[date][now])
            }
            return true
        }
        if(cli.flags.debug){
            console.debug("\tfound no measure at " + now)
        }
    }
    if(cli.flags.debug){
        console.log("-- no measures found")
    }
    return false   
    
}

export function lastMeasureWithinLastDays(cli, measures, days=1){
    cliValid(cli)
    if(null == days || isNaN(days) || 0 > days){
        if(cli.flags.verbose){
            console.log("WARN: days are invalid: " + days)
        }
        return null
    }
    if(cli.flags.verbose){
        console.log("checking if we had measures yesterday (" + getTodayDate(cli, -1) + ")...")
    }
    if(cli.flags.debug){
        console.log("\tDEBUG: checking if we have measures at measures[getTodayDate(cli, -1)] (" + getTodayDate(cli, -1) + ") ")
    }
    if(undefined === measures[getTodayDate(cli, -1)]){
        if(cli.flags.debug){
            //console.log("found NO measures for date " + getTodayDate(cli, -1) + "")
        }
        if(cli.flags.verbose){
            console.log("\tthere was no measure yesterday... continuing\n")
        }
        return false
    }
    if(cli.flags.verbose){
        console.log("\tfound " + Object.keys(measures[getTodayDate(cli, -1)]).length + " measures at date (" + getTodayDate(cli, -1) + "). ")
        if(cli.flags.debug){
            console.log("\t  keys (times of measurement) are: " + Object.keys(measures[getTodayDate(cli, -1)]).toString())
        }
    }
    return true
}

export function longerBreakRequired(cli, measures){
    cliValid(cli)
    if(undefined === measures[getTodayDate(cli)]){
        if(cli.flags.verbose){
            console.log("found NO measures for today (" + getTodayDate(cli) + ") ")
        }
        if(cli.flags.debug){
            console.log("measures received: " + JSON.stringify(measures, null, 2))
        }
        return false
    }
    if(cli.flags.debug){
        console.log("found " + Object.keys(measures[getTodayDate(cli)]).length + " measures at date (" + getTodayDate(cli) + "). ")
        if(cli.flags.debug){
            console.log(Object.keys(measures[getTodayDate(cli)]).length + " times of measurement are: " + Object.keys(measures[getTodayDate(cli)]).toString())
        }
    }
    if(cli.flags.verbose){
        console.log("checking if we had exactly 5 measures today already... (" + getTodayDate(cli) + ")")
    }
    if(5 !== Object.keys(measures[getTodayDate(cli)]).length){
        if(cli.flags.verbose){
            console.log("\twith " + Object.keys(measures[getTodayDate(cli)]).length + " measures, we don't need to take a longer break... no break required... continuing")
        }
        return false
    }
    // so we have already 5 measures today and need to check if the latest measure is longer in the past as 3 hours
    let now = undefined
    if(cli.flags.date && cli.flags.time){
        const parseDateStr = cli.flags.date + "T" + cli.flags.time
        now = new Date(Date.parse(parseDateStr))
    } else {
        now = new Date()
    }
    if(false == (now instanceof Date) || isNaN(now)){
        let e = new Error()
        e.message = "unable to parse date: " + parseDateStr +
            "\n\tdate param: " + cli.flags.date +
            "\n\ttime param: " + cli.flags.time +
            "\n\tgenerated date: " + getTodayDate(cli) +
            "\n\tgenerated time: " + getTodayTime(cli)
        throw e
    }
        if(cli.flags.debug){
            console.debug("parsed str " + parseDateStr + " to " + 
                          "\n\tdate param: " + cli.flags.date +
                          "\n\ttime param: " + cli.flags.time +
                          "\n\tgenerated date: " + getTodayDate(cli) +
                          "\n\tgenerated time: " + getTodayTime(cli))
            console.debug("\tgenerated timestamp: " + now.toString())
    }
    if(cli.flags.debug){
        console.log("my current time: " + getTodayTime(cli))
        console.log("my current hours: " + now.getHours())
    }
    /*
     * to make things easier, we just ensure that there has been no speedtest within last 
     * 4 hours (not last 3 which would be "as specified")
     */
    let i = 0
    for(i = 0; i < 4; i++){
        if(cli.flags.debug){
            console.log("\t-- " + now.getHours())
        }
        for(const timeMeasure of Object.keys(measures[getTodayDate(cli)])){
            if(cli.flags.debug){
                console.log("\tfound a measure at: " + timeMeasure + "h")
            }
            if(timeMeasure.startsWith(now.getHours())){
                if(cli.flags.debug){
                    console.log(timeMeasure + " start with current hour: " + now.getHours())
                }
                if(cli.flags.verbose){
                    console.log("\twe are between 5th and 6th measure and have to take a break of at least 3 hours (now: " + (now.getHours() + i) + "h).")
                    console.log("\tfound a measure at " + now.getHours() + "h. will further pause until " + (now.getHours() + 4) + "h")
                }
                return true
            }
        }
        now.setHours(now.getHours() - 1)
    }
    if(cli.flags.verbose){
        console.log("\twe already had five measures today, however, the last check was before " + (now.getHours() + 1) + "h. we can continue.")
    }
    return false
}

export function readJsonFiles(cli){
    cliValid(cli)
    let res = {}
    res.measures = {}
    res.emptyJsonFiles = []
    let jsonsInDir
    const directory = getDataDir(cli)
    if(cli.flags.debug || cli.flags.verbose){
        console.log("reading json files in " + directory + "... ")
    }
    try{
        jsonsInDir = fs.readdirSync(directory).filter(file => path.extname(file) === ".json")
    }
    catch(error){
        console.error(error.toString())
        return null
    }
    if(null == jsonsInDir){
        console.error("ERROR: reading " + directory + " for measures (jsonsInDir was null or undefined)")
        return null
    }
    if(0 === jsonsInDir.length){
        if(null == cli.flags.silent && false === cli.flags.silent){
            console.info("INFO: no json files could been found in " + directory + "")
        }
        return res
    }
    if(cli.flags.debug){
        console.debug("found files in " + directory + ": " + JSON.stringify(jsonsInDir))
    }
    jsonsInDir.forEach((file) => {
	const fileData = fs.readFileSync(path.join(directory, file))
	if(0 === fileData.length){
            if(cli.flags.printEmptyFiles){
                res.emptyJsonFiles.push(file)
            }
            return
        }
        if(cli.flags.debug){
            console.debug(file + ": " + fileData.toString())
        }
        const json = JSON.parse(fileData.toString())
        /*
         * check if file has at least mandatory fields given
         */
        if(null == json.download || null == json.upload || null == json.timestamp){
            let err = new Error()
            err.message("FATAL: " + file + " misses mandatory field(s) (download, upload, or timestamp)")
            throw err
        }
        const ts = new Date(Date.parse(json.timestamp))
        const date = ts.getFullYear() +  ("0" + (ts.getMonth() + 1)).slice(-2) + ("0" + ts.getDate()).slice(-2)
        const time = ("0" + ts.getHours()).slice(-2) + ("0" + ts.getMinutes()).slice(-2)
        
        if(null == res.measures[date]){
            res.measures[date] = {}
        }
        res.measures[date][time] = json
        res.measures[date][time].download_mbit = res.measures[date][time].download / 1024 / 1024
        res.measures[date][time].upload_mbit = res.measures[date][time].upload / 1024 / 1024
    })
    if(cli.flags.verbose){
        let countOfMeasures = 0
        for(const measureDate of Object.keys(res.measures)){
            countOfMeasures += Object.keys(res.measures[measureDate]).length
        }
        console.log("found " + countOfMeasures + " measures at " + Object.keys(res.measures).length + " different days")
        if(cli.flags.debug){
            console.debug("res: " + JSON.stringify(res, null, 2))
        }
    }
    return res
}

export function measurementNowWouldComplyGermanComplianceReport(cli, measures){
    /*
     * https://www.bundesnetzagentur.de/DE/Vportal/TK/InternetTelefon/Internetgeschwindigkeit/start.html
     */
    if(false === cli.flags.silent){
        console.log("\nchecking for german bundesnetzagentur compliancy "
                    + "(https://www.bundesnetzagentur.de/DE/Vportal/TK/InternetTelefon/Internetgeschwindigkeit/start.html)")
    }
    /*
     * measuring must happen on non-consequitive days
     */
    if(lastMeasureWithinLastDays(cli, measures, 1)){
        if(cli.flags.verbose){
            console.log("found measures taken yesterday. not measuring today.")
        }
        return false
    }
    /*
     * between measure 5 and 6 there must be a break of at least 3 hours
     */
    if(longerBreakRequired(cli, measures)){
        if(cli.flags.verbose){
            console.log("we are about to take the sixth measure today. we need to have a break of at least 3 hours. pausing")
        }
        return true
    }
    /*
     * there must be at least 5 minutes between two checks
     */
    // this is handled by the minimum minSleep value of 5. //FIXME: is there a check that the minSleep val is correct?
    if(measureWithinLastMinutes(cli, measures)){
        if(cli.flags.verbose){
            console.log("last speed test was within last 5 minutes. pausing.")
        }
        return false
    }
    return true
}
