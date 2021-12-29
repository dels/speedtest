
import { getLogger } from './logger.js'

import { measuresValid } from './helper.js'
import { cliValid } from './client_helper.js'

import { getTodayDate, } from './date_time_utils.js'

export function daysUnderMinimalDownload(cli, measures, daysBack){
    cliValid(cli)
    const log = getLogger(cli)
    measuresValid(measures)
    let days = {}
    days.days_below = 0
    days.days = 0
    for(let i = 0; i < daysBack; i++){
        const date = getTodayDate(cli, (i * -1))
        if(null == measures[date]){
            continue
        }
        days[date] = false
        if(0 < Object.keys(measures[date]).length){
            log.debug("found measures for " + date)
            days.days += 1
        }
        for(const time of Object.keys(measures[date])){
            if(null == measures[date][time]){
                continue
            }
            if(measures[date][time].download_mbit < (cli.flags.minDownload)){
                if(false === days[date]){
                    days.days_below += 1
                    days[date] = true
                }
            }
        }
    }
    log.debug("found " + days.days + " days in measures")
    return days
}

export function analyzeDailyNintyPercentDownloadAtLeast(cli, measures, daysBack){
    cliValid(cli)
    const log = getLogger(cli)
    measuresValid(measures)
    let days = {}
    days.days_reached = 0
    days.days = 0
    for(let i = 0; i < daysBack; i++){
        const date = getTodayDate(cli, (i * -1))
        if(null == measures[date]){
            continue
        }
        days[date] = false
        if(0 < Object.keys(measures[date]).length){
                log.debug("found measures for " + date)
            days.days += 1
        }
        for(const time of Object.keys(measures[date])){
            if((measures[date][time].download_mbit >= (cli.flags.download * 0.9))){
                if(false === days[date]){
                    days.days_reached += 1
                    days[date] = true
                }
            }
        }
    }
    log.debug("found " + days.days + " in measures")
    return days
}

export function analyzeBelowNintyPercentDownload(cli, measures, daysBack){
    cliValid(cli)
    const log = getLogger(cli)
    measuresValid(measures)
    let times = {}
    times.times_below = 0
    times.times_above = 0
    times.times = 0
    for(let i = 0; i < daysBack; i++){
        const date = getTodayDate(cli, (i * -1))
        if(null == measures[date]){
            log.warn("for " + date + " no measures have been found")
            continue
        }
        for(const time of Object.keys(measures[date])){
            times.times += 1
            //log.silly("checking if " + (measures[date][time].download_mbit) + " < " + (cli.flags.avgDownload * 0.9) + ": (" + ((measures[date][time].download_mbit) < (cli.flags.avgDownload * 0.9)) + ")")
            if((measures[date][time].download_mbit) < (cli.flags.avgDownload * 0.9)){
                times.times_below += 1
            } else {
                times.times_above += 1
            }
        }
    }
    times.percent_below = Math.floor((((times.times_below / times.times) * 100) * 10)) / 10
    times.percent_above = Math.floor(((((times.times - times.times_below) / times.times) * 100) * 10)) / 10
    return times
}

export function printGermanComplianceReport(cli, measures, daysBack=14){
    cliValid(cli)
    const log = getLogger(cli)
    measuresValid(measures)
    log.info(" --- BEGIN GERMAN COMPLIANCE REPORT --- ")
    /*
     * 1. Nicht an mindestens zwei von drei Messtagen jeweils mindestens einmal 90 % der vertraglich 
     * vereinbarten maximalen Geschwindigkeit erreicht werden
     */
    const nintyPercentAtLeast = analyzeDailyNintyPercentDownloadAtLeast(
        cli,
        measures,
        daysBack)

    // TODO: this must not go through all days but through 3 day blocks
    log.verbose("\n\ton " + nintyPercentAtLeast.days_reached + " out of " + nintyPercentAtLeast.days
                + " days we reached ninty percent at least once!" )

    if(3 > nintyPercentAtLeast.days){
        log.info("too few measures for analyze 2 out of 3 days we reached at least 90% once a day")
    } else {
        if(2 > nintyPercentAtLeast.days_reached){
            log.info("\n\tCHECK FAILED: we reached at least once a day 90% of maximum download speed on less than 2 days within last 14 days \n")
        } else {
            log.info("\n\tCHECK PASSED: we reached on at least two days at least 90% of maximum download speed within last 14 days\n")
        }
    }

    /*
     * 2. die normalerweise zur Verfügung stehende Geschwindigkeit nicht in 90 % der Messungen erreicht wird 
     */
    const belowNintyPercentDownoload = analyzeBelowNintyPercentDownload(
        cli,
        measures,
        daysBack)

    log.verbose("\n\twithin last " + daysBack + " days: "
                + belowNintyPercentDownoload.times_above + "/" + belowNintyPercentDownoload.times
                + " times the measured download was above.  (" + ((belowNintyPercentDownoload.percent_above * 100) /100) + "%)")
    if(90.0 > Math.floor(belowNintyPercentDownoload.percent_above)){
        log.info("\n\tCHECK FAILED: we reached only " + ((belowNintyPercentDownoload.percent_above  * 100) /100)
                    + "%. required are 90% at least\n")
    } else {
        log.info("\n\tCHECK PASSED: we reached on average per measure 90% of maximum download speed within last 14 days\n")
    }

    /*
     * 3. an mindestens zwei von drei Messtagen jeweils mindestens einmal die minimale Geschwindigkeit unterschritten
     */
    const countBelowMinimalDownload = daysUnderMinimalDownload(
        cli,
        measures,
        daysBack)

    // TODO: this must not go through all days but through 3 day blocks
    log.verbose("\n\ton " + countBelowMinimalDownload.days_below + " out of " + countBelowMinimalDownload.days + " days "
                + "we dropped below minimal speed at least once.")

    if(3 > countBelowMinimalDownload.days){
        log.info("too few measures for analyze 2 out of 3 days we measured below minimum speed.")
    } else {
        if(2 < countBelowMinimalDownload.days_below){
            log.info("\n\tCHECK FAILED: we fall in more than 2 measures below minimal download speed "
                        + "at least once per day "
                        + "within the last " + daysBack + " days\n")        
        } else {
            log.info("\n\tCHECK PASSED: within last 14 days there were less than 3 days on which "
                        + "we fall below minimal download speed at least once\n")
        }
    }
    log.info(" --- END GERMAN COMPLIANCE REPORT --- ")
}


