
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { getLogger } from './logger.js'

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

function setLogLevel(cli){
    if(cli.flags.silly){
        cli.logLevel = 'silly'
        return
    }
    if(cli.flags.debug){
        cli.logLevel = 'debug'
        return
    }
    if(cli.flags.verbose){
        cli.logLevel = 'verbose'
        return
    }
    if(cli.flags.info){
        cli.logLevel = 'info'
        return
    }
    if(cli.flags.warn){
        cli.logLevel = 'warn'
        return
    }
    cli.logLevel = 'error'
}

export function checkAndAdjustFlags(cli){
    cliValid(cli)
    setLogLevel(cli)
    //console.log("recevied loglevel: " + cli.logLevel)
    const log = getLogger(cli)
    if(cli.flags.time && null == cli.flags.date){
        log.warn("WARN: time without date flag might cause issues")
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
    const log = getLogger(cli)
    if(null == cli.flags.dataDir){
        const dirName = dirname(fileURLToPath(import.meta.url)) + "/../data"
        log.debug("using " + dirName + " as --data-dir (default for cron)")
        cli.flags.dataDir = dirName
        return dirName
    }
    const dirName = cli.flags.dataDir
    log.debug("using " + dirName + " as --data-dir")
    return dirName
}


/*
 * not exported functions
 */
function printDebug(cli){
    cliValid(cli)
    const log = getLogger(cli)
    if(false === cli.flags.silly){
        return
    }
    log.debug("\n --- BEGIN DEBUG --- ")
    log.debug("input: " + JSON.stringify(cli.input))
    log.debug("flags: " + JSON.stringify(cli.flags, null, 2))
    log.debug("date today: " + getTodayDate(cli))
    log.debug(" --- END DEBUG --- ")
}

function checkConfig(cli){
    cliValid(cli)
    const log = getLogger(cli)
    const parameters = [
        "SPEEDTEST_DOWNLOAD",
        "SPEEDTEST_UPLOAD",
        "SPEEDTEST_AVG_DOWNLOAD",
        "SPEEDTEST_AVG_UPLOAD",
        "SPEEDTEST_MIN_DOWNLOAD",
        "SPEEDTEST_MIN_UPLOAD",
    ]
    printDebug(cli)
    for(const param of parameters){
        const paramCamelCase = param.replace(/SPEEDTEST_/, "").toLowerCase().replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
        log.debug("param " + param + " as camelcase: " + paramCamelCase)
        if(process.env[param] && null == cli.flags[paramCamelCase]){
            log.debug("we found no value in params for " + paramCamelCase + " but in .env (" + param + ") - using .env value")
            cli.flags[paramCamelCase] = process.env[param]
        }
        if(process.env[param] && cli.flags[paramCamelCase]){
            log.debug(paramCamelCase + ": found value in params and in .env - using parameter value")
        }
        log.debug("paramCamelCase: " + paramCamelCase)
        log.debug("cli.flags[paramCamelCase]: " + cli.flags[paramCamelCase])
        const paramFloatValue = parseFloat(cli.flags[paramCamelCase])
        if(isNaN(paramFloatValue) || 0 >= paramFloatValue){
            log.error("" + param + " is not valid in pareters or .env\n\n")
            let err = new Error()
            err.message = (param + " is not a valid number (float): " + cli.flags[paramCamelCase])
            throw err
        }
        log.silly("setting cli.flags[paramCamelCase] to: " + cli.flags[paramCamelCase])
        cli.flags[paramCamelCase] = parseFloat(cli.flags[paramCamelCase])
    }
}
