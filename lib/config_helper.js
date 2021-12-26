
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { getTodayDate, getTodayTime, } from './date_time_utils.js'

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
    if(cli && cli.flags){
        return true
    }
    throw new Error("FATAL: invalid client configuration: " + JSON.stringify(cli))
}

export function checkAndAdjustFlags(cli){
    cliValid(cli)
    if(cli.flags.debug){
        cli.flags.verbose = true
    }
    if(cli.flags.silent){
        cli.flags.verbose = false
        cli.flags.debug = false
    }
    if(cli.flags.time && null == cli.flags.date){
        console.log("WARN: time without date flag might cause issues")
    }
    // --german && --sleep must not be combined
    printDebug(cli)
    return cli
}

export function getDataDir(cli){
    cliValid(cli)
    if(null == cli.flags.dataDir){
        const dirName = dirname(fileURLToPath(import.meta.url)) + "/../data"
        if(cli.flags.debug){
            console.debug("using " + dirName + " as --data-dir (default for cron)")
        }
        return dirName
    }
    const dirName = cli.flags.dataDir
    if(cli.flags.debug){
        console.debug("using " + dirName + " as --data-dir")
    }
    return dirName
}
