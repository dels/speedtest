
import fs from 'fs'
import path from 'path'

import { getDataDir } from './helper.js'

export function readJsonFiles(cli){
    if(null == cli || null == cli.flags){
        console.log("FATAL: invalid client configuration: " + JSON.stringify(cli))
        return null
    }
    let res = {}
    res.measures = {}
    res.emptyJsonFiles = []
    let jsonsInDir
    const directory = getDataDir(cli)
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
    if(cli.flags.debug){
        console.log("found " + Object.keys(res.measures).length + " measures")
        //console.log("res: " + JSON.stringify(res, null, 2))
    }
    return res
}
