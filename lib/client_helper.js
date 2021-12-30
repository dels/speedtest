
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
    console.log("FATAL: invalid client configuration: " + JSON.stringify(cli) + "")
    let err = new Error()
    //err.message("FATAL: invalid client configuration: " + JSON.stringify(cli) + "")
    throw err
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
    const log = getLogger(cli, import.meta.url)
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
    const log = getLogger(cli, import.meta.url)
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
    const log = getLogger(cli, import.meta.url)
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
    const log = getLogger(cli, import.meta.url)
    const parameters = [
        "download",
        "upload",
        "avgDownload",
        "avgUpload",
        "minDownload",
        "minUpload",
    ]
    //printDebug(cli)
    for(const param of parameters){
        log.silly("param: " + param)
        log.silly("cli.flags[param]: " + cli.flags[param])
        const paramFloatValue = parseFloat(cli.flags[param])
        log.silly("paramFloatValue: " + paramFloatValue)
        if(isNaN(paramFloatValue) || 0 >= paramFloatValue){
            log.error(param + " is not valid in parameters: cli.flags[param]\n\n")
            let err = new Error()
            err.message = (param + " is not a valid number (float): " + cli.flags[param])
            throw err
        }
        log.silly("setting cli.flags[\"" + param + "\"] to: " + cli.flags[param])
        cli.flags[param] = paramFloatValue
    }
}
