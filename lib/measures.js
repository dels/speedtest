
import fs from 'fs'
import path from 'path'

import { getLogger } from './logger.js'

import { measuresValid } from './helper.js'
import { getDataDir, cliValid } from './client_helper.js'
import { getTodayDate, getTodayTime } from './date_time_utils.js' 

export function measureWithinLastMinutes(cli, measures, scanMinutesBeforeNow=5){
    cliValid(cli)
    const log = getLogger(cli, import.meta.url)

    measuresValid(measures)
    let date = getTodayDate(cli)
    if(null == scanMinutesBeforeNow || isNaN(scanMinutesBeforeNow) || 0 > scanMinutesBeforeNow){
        log.warn("WARN: minutes scanning radius is invalid: " + scanMinutesBeforeNow)
        return null
    }
    // was there a measure today, in this hour
    if(undefined === measures[date] || 0 === Object.keys(measures[date]).length){
        //log.debug("found no measures for date " + getTodayDate(cli, -1) + "")
        log.verbose("there was no measure today... continuing\n")
        return false
    }

    for(let i = 0; i < scanMinutesBeforeNow; i++){
        let now = getTodayTime(cli, i * -1)
        log.debug("checking if we have a measure at " + now)
        if(measures[date][now]){
            log.debug("\tfound measure at " + now + ": " + measures[date][now])
            return true
        }
        log.debug("\tfound no measure at " + now)
    }
    log.debug("-- no measures found")
    return false   
    
}

export function lastMeasureWithinLastDays(cli, measures, days=1){
    cliValid(cli)
    const log = getLogger(cli, import.meta.url)

    if(null == days || isNaN(days) || 0 > days){
        log.error("ERROR: days are invalid: " + days)
        return null
    }
    log.verbose("checking if we had measures yesterday (" + getTodayDate(cli, (-1 * days)) + ")...")
    log.debug("\tDEBUG: checking if we have measures at measures[getTodayDate(cli, -1)] (" + getTodayDate(cli, (-1)) + ") ")
    if(undefined === measures[getTodayDate(cli, (-1 * days))]){
        log.silly("found NO measures for date " + getTodayDate(cli, (-1 * days)) + "")
        log.verbose("\tthere was no measure yesterday... continuing\n")
        return false
    }
    log.verbose("\tfound " + Object.keys(measures[getTodayDate(cli, (-1 * days))]).length + " measures at date (" + getTodayDate(cli, (-1 * days)) + "). ")
    log.debug("\t  keys (times of measurement) are: " + Object.keys(measures[getTodayDate(cli, (-1 * days))]).toString())
    return true
}

export function longerBreakRequired(cli, measures){
    cliValid(cli)
    const log = getLogger(cli, import.meta.url)

    if(undefined === measures[getTodayDate(cli)]){
        log.debug("found no measures for today (" + getTodayDate(cli) + ") at all")
        log.silly("all measures received: " + JSON.stringify(measures, null, 2))
        return false
    }
    log.debug("found " + Object.keys(measures[getTodayDate(cli)]).length + " measures at date (" + getTodayDate(cli) + "). ")
    log.debug(Object.keys(measures[getTodayDate(cli)]).length + " times of measurement are: " + Object.keys(measures[getTodayDate(cli)]).toString())
    log.verbose("checking if we had 5 measures today already (checking for date " + getTodayDate(cli) + ")")
    if(5 !== Object.keys(measures[getTodayDate(cli)]).length){
        log.verbose("\twith " + Object.keys(measures[getTodayDate(cli)]).length + " not being exactly 5 measures, we don't need to take a break ... continuing.")
        return false
    }
    // so we have already 5 measures today and need to check if the latest measure is longer in the past as 3 hours
    let now = undefined
    const parseDateStr = cli.flags.date + "T" + cli.flags.time
    if(null == cli.flags.date || null == cli.flags.time){
        now = new Date()
    } else {
        now = new Date(Date.parse(parseDateStr))
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
    log.silly("parsed str " + parseDateStr + " to " + 
              "\n\tdate param: " + cli.flags.date +
              "\n\ttime param: " + cli.flags.time +
              "\n\tgenerated date: " + getTodayDate(cli) +
              "\n\tgenerated time: " + getTodayTime(cli))
    log.debug("\tgenerated timestamp: " + now.toString())

    log.silly("my current time: " + getTodayTime(cli))
    log.silly("my current hours: " + (now.getHours()))
    /*
     * to make things easier, we just ensure that there has been no speedtest within last 
     * 4 hours (not last 3 which would be "as specified")
     */
    let i = 0
    for(i = 0; i < 4; i++){
        log.info("\t simulation hours " + (i - now.getHours()) + ". i: " + i)
        for(const timeMeasure of Object.keys(measures[getTodayDate(cli)])){
            const currentHours = ("0" + (now.getHours())).slice(-2)
            log.silly("\tfound a measure at: " + timeMeasure + "h")
            log.silly("checking if " + timeMeasure + ".startsWith(" + currentHours + "): " + timeMeasure.startsWith(currentHours))
            if(timeMeasure.startsWith(currentHours)){
                log.silly(timeMeasure + " starts with current hour: " + currentHours)
                log.silly("\twe are between 5th and 6th measure "
                          + "and have to take a break of at least 3 hours (now: "
                          + ("0" + (now.getHours() + i)).slice(-2) + "h).")
                log.silly("\tfound a measure at "
                          + currentHours
                          + "h. will further pause until "
                         + ("0" + (now.getHours() + 4)).slice(-2) + "h")
                return true
            }
        }
        now.setHours(now.getHours() - 1)
    }
    log.verbose("\twe already had five measures today, however, the last check was before " + ("0" + (now.getHours() + i)).slice(-2) + "h. we can continue.")
    return false
}

export function readJsonFiles(cli){
    cliValid(cli)
    const log = getLogger(cli, import.meta.url)
    let res = {}
    res.measures = {}
    res.emptyJsonFiles = []
    let jsonsInDir
    const directory = getDataDir(cli)
    log.debug("reading json files in " + directory + "... ")
    try{
        jsonsInDir = fs.readdirSync(directory).filter(file => path.extname(file) === ".json")
    }
    catch(error){
        log.error(error.toString())
        return null
    }
    if(null == jsonsInDir){
        log.error("error reading " + directory + " for measures (jsonsInDir was null or undefined)")
        return null
    }
    if(0 === jsonsInDir.length){
        log.info("no json files could been found in " + directory + "")
        return res
    }
    log.silly("found files in " + directory + ": " + JSON.stringify(jsonsInDir))

    jsonsInDir.forEach((file) => {
	const fileData = fs.readFileSync(path.join(directory, file))
	if(0 === fileData.length){
            if(cli.flags.printEmptyFiles){
                res.emptyJsonFiles.push(file)
            }
            return
        }
        log.silly(file + ": " + fileData.toString())
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
        log.debug("found " + countOfMeasures + " measures at " + Object.keys(res.measures).length + " different days")
        log.silly("res: " + JSON.stringify(res, null, 2))
    }
    return res
}

export function measurementNowWouldComplyGermanComplianceReport(cli, measures){
    cliValid(cli)
    const log = getLogger(cli, import.meta.url)
    /*
     * https://www.bundesnetzagentur.de/DE/Vportal/TK/InternetTelefon/Internetgeschwindigkeit/start.html
     */
    log.verbose("checking for german bundesnetzagentur compliancy "
                    + "(https://www.bundesnetzagentur.de/DE/Vportal/TK/InternetTelefon/Internetgeschwindigkeit/start.html)")
    /*
     * measuring must happen on non-consequitive days
     */
    if(lastMeasureWithinLastDays(cli, measures, 1)){
        log.verbose("found measures taken yesterday. not measuring today.")
        return false
    }
    /*
     * between measure 5 and 6 there must be a break of at least 3 hours
     */
    if(longerBreakRequired(cli, measures)){
        log.verbose("we are about to take the sixth measure today. we need to have a break of at least 3 hours. pausing")
        return false
    } 
    /*
     * there must be at least 5 minutes between two checks
     */
    // this is handled by the minimum minSleep value of 5. //FIXME: is there a check that the minSleep val is correct?
    if(measureWithinLastMinutes(cli, measures)){
        log.verbose("last speed test was within last 5 minutes. pausing.")
        return false
    }
    return true
}
