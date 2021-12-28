
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { getTodayDate,  } from './date_time_utils.js'


/*
 * exported functions
 */
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
        if(false === cli.flags.silent){
            console.log("WARN: time without date flag might cause issues")
        }
    }
    if(cli.flags.german && cli.flags.sleep){
        if(false === cli.flags.silent){
            console.log("WARN: flags --german and -sleep cant be combined. disabling --german")
        }
        cli.flags.german = false
    }
    if(null == cli.flags.home){
        cli.flags.home = "./"
    }
    checkConfig(cli)
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


/*
 * not exported functions
 */
function printDebug(cli){
    cliValid(cli)
    if(false === cli.flags.debug || false === cli.flags.verbose){
        return
    }
    console.log("\n --- BEGIN DEBUG --- ")
    console.log("input: " + JSON.stringify(cli.input))
    console.log("flags: " + JSON.stringify(cli.flags, null, 2))
    console.log("date today: " + getTodayDate(cli))
    console.log(" --- END DEBUG --- ")
}

function checkConfig(cli){
    cliValid(cli)
    const parameters = [
        "SPEEDTEST_DOWNLOAD",
        "SPEEDTEST_UPLOAD",
        "SPEEDTEST_AVG_DOWNLOAD",
        "SPEEDTEST_AVG_UPLOAD",
        "SPEEDTEST_MIN_DOWNLOAD",
        "SPEEDTEST_MIN_UPLOAD",
    ]
    for(const param of parameters){
        const paramCamelCase = param.replace(/SPEEDTEST_/, "").toLowerCase().replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
        //console.debug("param " + param + " as camelcase: " + paramCamelCase)
        if(cli.flags[paramCamelCase]){
            //console.debug("found " + paramCamelCase + " as flag: " + cli.flags[paramCamelCase])
            continue
        }
        if(isNaN(process.env[param]) || 0 > process.env[param]){
            console.log("\n\n\tHINT: specify " + param + " in .env\n\n")
            let err = new Error()
            err.message = (param + " not defined or invalid: " + param)
            throw err
        }

        const paramFloatValue = parseFloat(process.env[param])
        if(isNaN(paramFloatValue)){
            console.log("\n\n\tWARN " + param + " is not valid in flags or .env\n\n")
            let err = new Error()
            err.message = (param + " is not a valid number (float): " + param)
            throw err
        }
        //console.debug(paramCamelCase + " not found in flags but in params: " + process.env[param] + ". setting as flag")
        cli.flags[paramCamelCase] = parseFloat(process.env[param])
    }
}
