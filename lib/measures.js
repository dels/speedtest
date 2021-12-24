
import fs from 'fs'
import path from 'path'

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const directory = __dirname + "/../data"

export function readJsonFiles(collectEmptyJsonFiles=true){
    let res = {}
    res.measures = {}
    res.emptyJsonFiles = []
    let jsonsInDir = undefined
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
        
    jsonsInDir.forEach((file) => {
	const fileData = fs.readFileSync(path.join(directory, file))
	if(0 === fileData.length){
            if(collectEmptyJsonFiles){
	        res.emptyJsonFiles.push(file)
            }
	    return
	}
	const json = JSON.parse(fileData.toString())
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
    return res
}
