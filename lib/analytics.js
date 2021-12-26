
import { measuresValid } from './helper.js'
import { getDataDir, cliValid } from './config_helper.js'

import { getTodayDate, getTodayTime, } from './date_time_utils.js'

export function daysUnderMinimalDownload(cli, measures, minimalDown, minimalUp, daysBack){
    cliValid(cli)
    measuresValid(measures)
    if(isNaN(process.env.SPEEDTEST_MIN_DOWNLOAD)){
        throw new Error("could not read .env, missing value for SPEEDTEST_MIN_DOWNLOAD or given value is invalid.")
    }
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
            if(cli.flags.debug){
                console.debug("found measures for " + date)
            }
            days.days += 1
        }
        for(const time of Object.keys(measures[date])){
            if(null == measures[date][time]){
                continue
            }
            if(measures[date][time].download_mbit < (process.env.SPEEDTEST_MIN_DOWNLOAD)){
                if(false === days[date]){
                    days.days_below += 1
                    days[date] = true
                }
            }
        }
    }
    if(cli.flags.debug){
        console.debug("found " + days.days + " in measures")
    }
    return days
}

export function analyzeDailyNintyPercentDownloadAtLeast(cli, measures, down, up, daysBack){
    cliValid(cli)
    measuresValid(measures)
    if(isNaN(process.env.SPEEDTEST_DOWNLOAD)){
        throw new Error("could not read .env, missing value for SPEEDTEST_DOWNLOAD or given value is invalid.")
    }
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
            if(cli.flags.debug){
                console.debug("found measures for " + date)
            }
            days.days += 1
        }
        for(const time of Object.keys(measures[date])){
            if((measures[date][time].download_mbit >= (process.env.SPEEDTEST_DOWNLOAD * 0.9))){
                if(false === days[date]){
                    days.days_reached += 1
                    days[date] = true
                }
            }
        }
    }
    if(cli.flags.debug){
        console.debug("found " + days.days + " in measures")
    }
    return days
}

export function analyzeBelowNintyPercentDownload(cli, measures, down, up, daysBack){
    cliValid(cli)
    measuresValid(measures)
    let times = {}
    times.times_below = 0
    times.times_above = 0
    times.times = 0
    for(let i = 0; i < daysBack; i++){
        const date = getTodayDate(cli, (i * -1))
        if(null == measures[date]){
            if(false === cli.flags.silent)
                console.warn("for " + date + " no measures have been found")
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
    times.percent_below = Math.floor((((times.times_below / times.times) * 100) * 10)) / 10
    return times
}
