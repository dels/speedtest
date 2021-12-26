
import { cliValid } from './client_helper.js'

function getTodayTimeAsDate(cli, adjustMinutesBy=null, now=undefined){
    cliValid(cli)
    if(cli.flags.time){
        now = new Date(Date.parse(cli.flags.date + "T" + cli.flags.time))
    }
    if(null == now){
        now = new Date()
    }
    if( adjustMinutesBy && false === isNaN(adjustMinutesBy) || 0 < adjustMinutesBy){
        now.setMinutes(now.getMinutes() + adjustMinutesBy)
    }
    return now
}

export function getParseableTodayTime(cli, adjustMinutesBy, now=undefined){
    now = getTodayTimeAsDate(cli, adjustMinutesBy, now)
    return "" + (now.getHours() < 10 ? "0" + now.getHours() : now.getHours())
        + ":"
        + (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes())
}

export function getTodayTime(cli, adjustMinutesBy, now=undefined){
    now = getTodayTimeAsDate(cli, adjustMinutesBy, now)
    return "" + (now.getHours() < 10 ? "0" + now.getHours() : now.getHours())
        + (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes())

}

function getTodayDateAsDate(cli, adjustDaysBy=null, now=undefined){
    cliValid(cli)
    if(cli.flags.date){
        now = new Date(Date.parse(cli.flags.date))
    }
    if(null == now){
        now = new Date()
    }
    if(adjustDaysBy && false === isNaN(adjustDaysBy) || 0 < adjustDaysBy){
        now.setDate(now.getDate() + adjustDaysBy)
    }
    return now
}

export function getParseableTodayDate(cli, adjustDaysBy=null, now=undefined){
    now = getTodayDateAsDate(cli, adjustDaysBy, null)
    return ""
        + now.getFullYear() + "-"
        + ((1 + now.getMonth()) < 10 ? "0" + (1 + now.getMonth()) : "" + (1 + now.getMonth())) + "-"
        +  (now.getDate() < 10 ? "0" + now.getDate() : "" + now.getDate())
}

export function getTodayDate(cli, adjustDaysBy=null, now=undefined){
    now = getTodayDateAsDate(cli, adjustDaysBy, null)
    return ""
        + now.getFullYear()
        + ((1 + now.getMonth()) < 10 ? "0" + (1 + now.getMonth()) : "" + (1 + now.getMonth()) )
        + (now.getDate() < 10 ? "0" + now.getDate() : "" + now.getDate())
}

export function getNow(cli){
    cliValid(cli)
    return getTodayDate(cli) + "-" + getTodayTime(cli)

}
