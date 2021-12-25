
import fs from 'fs'
import path from 'path'

import { getDataDir, getTodayDate, getTodayTime, cliValid } from './helper.js'

export function lastMeasureWithinLastMinutes(cli, measures, minutes){
    cliValid(cli)
    if(null == minutes || isNaN(minutes) || 0 > minutes){
        if(cli.flags.verbose){
            console.log("WARN: minutes are invalid: " + minutes)
        }
        return null
    }
    // was there a measure today, in this hour
    if(undefined === measures[getTodayDate(cli)]){
        if(cli.flags.debug){
            //console.log("found NO measures for date " + getTodayDate(cli, -1) + "")
        }
        if(cli.flags.verbose){
            console.log("there was no measure today... continuing\n")
        }
        return false
    }
    
}

export function lastMeasureWithinLastDays(cli, measures, days){
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
        console.log("DEBUG: checking if we have measures at measures[getTodayDate(cli, -1)] (" + getTodayDate(cli, -1) + ") ")
    }
    if(undefined === measures[getTodayDate(cli, -1)]){
        if(cli.flags.debug){
            //console.log("found NO measures for date " + getTodayDate(cli, -1) + "")
        }
        if(cli.flags.verbose){
            console.log("there was no measure yesterday... continuing\n")
        }
        return false
    }
    if(cli.flags.verbose){
        console.log("found " + Object.keys(measures[getTodayDate(cli, -1)]).length + " measures at date (" + getTodayDate(cli, -1) + "). ")
        if(cli.flags.debug){
            console.log("  keys (times of measurement) are: " + Object.keys(measures[getTodayDate(cli, -1)]).toString())
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
        return false
    }
    if(cli.flags.debug){
        console.log("found " + Object.keys(measures[getTodayDate(cli)]).length + " measures at date (" + getTodayDate(cli) + "). ")
        if(cli.flags.debug){
            console.log("  keys (times of measurement) are: " + Object.keys(measures[getTodayDate(cli)]).toString())
        }
    }
    if(cli.flags.verbose){
        console.log("checking if we had exactly 5 measures today already... (" + getTodayDate(cli) + ")")
    }
    if(4 !== Object.keys(measures[getTodayDate(cli)]).length){
        if(cli.flags.verbose){
            console.log("with " + Object.keys(measures[getTodayDate(cli)]).length + " measures, we don't need to take a longer break... no break required... continuing")
        }
        return false
    }
    // so we have already 5 measures today and need to check if the latest measure is longer in the past as 3 hours

    console.log("date: " + getTodayDate(cli))
    console.log("time: " + getTodayTime(cli))
    const now = new Date(Date.parse(getTodayDate(cli) + "T" + getTodayTime(cli)))
    if(cli.flags.debug){
        console.log("my current time: " + getTodayTime(cli))
    }
    /*
     * to make things easier, we just ensure that there has been no speedtest within last 
     * 4 hours (not last 3 which would be "as specified")
     */
    for(let i = 0; i < 4; i++){
        if(cli.flags.debug){
            console.log("-- " + now.getHours())
        }
        for(const timeMeasure of Object.keys(measures[getTodayDate(cli)])){
            if(cli.flags.debug){
                console.log("found timeMeasure: " + timeMeasure )
            }
            if(timeMeasure.startsWith(now.getHours())){
                if(cli.flags.debug){
                    console.log(timeMeasure + " start with current hour: " + now.getHours())
                }
                if(cli.flags.verbose){
                    console.log("we are between 5th and 6th measure and have to take a break of at least 3 hours.")
                    console.log("found a measure at " + now.getHours() + "h. will further pause.")
                }
                return true
            }
        }
        now.setHours(now.getHours() - 1)        
    }
    if(cli.flags.verbose){
        console.log("we already had five measures today, however, the last check was before " + (now.getHours() + 1) + "h.")
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
        console.info("INFO: no json files could been found in " + directory + "")
        return null
    }
    //console.log("jsonsInDir: " + JSON.stringify(jsonsInDir))
    jsonsInDir.forEach((file) => {
	const fileData = fs.readFileSync(path.join(directory, file))
	if(0 === fileData.length){
            if(cli.flags.printEmptyFiles){
                res.emptyJsonFiles.push(file)
            }
            return
        }
        const json = JSON.parse(fileData.toString())
        /*
         * check if file has at least mandatory fields given
         */
        if(null == json.download || null == json.upload || null == json.timestamp){
            if(null == cli.flags.quiet || false === cli.flags.quiet){
                console.log("WARN: " + file + " misses mandatory field(s) (download, upload, timestamp)")
            }
            return
        }
        const ts = new Date(Date.parse(json.timestamp))
        const date = ts.getFullYear() +  ("0" + (ts.getMonth() + 1)).slice(-2) + ("0" + ts.getDate()).slice(-2)
        //const time = ("0" + ts.getHours()).slice(-2) + ("0" + ts.getMinutes()).slice(-2) + ("0" + ts.getSeconds()).slice(-2)
        const time = ("0" + ts.getHours()).slice(-2) + ("0" + ts.getMinutes()).slice(-2)
        if(null == res.measures[date]){
            res.measures[date] = {}
        }
        res.measures[date][time] = json
        res.measures[date][time].download_mbit = res.measures[date][time].download / 1024 / 1024
        res.measures[date][time].upload_mbit = res.measures[date][time].upload / 1024 / 1024
    })
    if(cli.flags.debug || cli.flags.verbose){
        let countOfMeasures = 0
        for(const measureDate of Object.keys(res.measures)){
            countOfMeasures += Object.keys(res.measures[measureDate]).length
        }
        console.log("found " + countOfMeasures + " measures at " + Object.keys(res.measures).length + " different days")
        //console.log("res: " + JSON.stringify(res, null, 2))
    }
    return res
}
