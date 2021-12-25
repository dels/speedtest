
import { dirname } from 'path';
import { fileURLToPath } from 'url';

function printDebug(cli){
    cliValid(cli)
    if(false === cli.flags.debug || false === cli.flags.verbose){
        return
    }
    console.log("\n --- BEGIN DEBUG --- ")
    console.log("input: " + JSON.stringify(cli.input))
    console.log("flags: " + JSON.stringify(cli.flags))
    console.log("date today: " + getTodayDate(cli))
    console.log(" --- END DEBUG --- ")
}

export function cliValid(cli){
    if(null == cli || null == cli.flags){
        //console.log("FATAL: invalid client configuration: " + JSON.stringify(cli))
        throw new Error("FATAL: invalid client configuration: " + JSON.stringify(cli))
    }
    return true
}

export function checkAndAdjustFlags(cli){
    cliValid(cli)
    if(cli.flags.debug){
        cli.flags.verbose = true
    }
    if(cli.flags.quiet){
        cli.flags.verbose = false
        cli.flags.debug = false
    }
    if(cli.flags.time && null == cli.flags.date){
        console.log("WARN: time without date flag might cause issues")
    }
    // --german && --sleep must not be combined
    printDebug(cli)
}

export function printResultsSorted(measures, emptyJsonFiles, precision=2){
    for(const date of Object.keys(measures).sort()){
        console.log(date + ": ")
        for(const time of Object.keys(measures[date]).sort()){
            console.log("\t" + time + " download at " +
                        ((measures[date][time].download_mbit).toFixed(precision)) + " MBit/s. upload at " +
                        ((measures[date][time].upload_mbit).toFixed(precision)) + " MBit/s. Ping: " + measures[date][time]["ping"])
        }
    }
}

export function getDataDir(cli){
    cliValid(cli)
    if(null == cli || null == cli.flags){
        console.log("FATAL (lib/helper->getDataDir): invalid client configuration: " + JSON.stringify(cli))
        return null
    }
    if(null == cli.flags.dataDir){
        const dirName = dirname(fileURLToPath(import.meta.url)) + "/../data"
        if(cli.flags.debug){
            console.log("DEBUG: using " + dirName + " as --data-dir (default for cron)")
        }
        return dirName
    }
    const dirName = cli.flags.dataDir
    if(cli.flags.debug){
        console.log("DEBUG: using " + dirName + " as --data-dir")
    }
    return dirName
}

function getTodayTimeAsDate(cli, adjustMinutesBy=null, now=undefined){
    cliValid(cli)
    if(cli.flags.time){
        now = new Date(Date.parse(cli.flags.date + "T" + cli.flags.time))
    }
    if(null == now){
        now = new Date()
    }
    if( adjustMinutesBy && false === isNaN(adjustMinutesBy) || 0 < adjustMinutesBy){
        now.setMinutes(now.getDate() + adjustMinutesBy)
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
    return "" + now.getFullYear() + "-" +  (now.getMonth() + 1) + "-" +   (now.getDate() < 10 ? "0" + now.getDate() : "" + now.getDate())
}

export function getTodayDate(cli, adjustDaysBy=null, now=undefined){
    now = getTodayDateAsDate(cli, adjustDaysBy, null)
    return "" + now.getFullYear() + (now.getMonth() + 1) + (now.getDate() < 10 ? "0" + now.getDate() : "" + now.getDate())
}

export function getNow(cli){
    cliValid(cli)
    const now = new Date()
    getTodayDate(cli) + "-"
        + (now.getHours() < 10 ? "0" + now.getHours() : now.getHours())
        + (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()) 
        + (now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds())

}
