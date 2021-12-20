#!/usr/bin/env node

const fs = require('fs');
const path = require('path')

const directory = __dirname + "/data"

let emptyJsonFiles = []

function getJsonFiles(){
    const jsonsInDir = fs.readdirSync(directory).filter(file => path.extname(file) === ".json")
    let results = {}

    jsonsInDir.forEach((file) => {
	const fileData = fs.readFileSync(path.join(directory, file))
	if(0 === fileData.length){
	    emptyJsonFiles.push(file)
	    return
	}
	const json = JSON.parse(fileData.toString())
	const ts = new Date(Date.parse(json.timestamp))
	const date = ts.getFullYear() +  ("0" + (ts.getMonth() + 1)).slice(-2) + ("0" + ts.getDate()).slice(-2)
	//const time = ("0" + ts.getHours()).slice(-2) + ("0" + ts.getMinutes()).slice(-2) + ("0" + ts.getSeconds()).slice(-2)
	const time = ("0" + ts.getHours()).slice(-2) + ("0" + ts.getMinutes()).slice(-2)
	if(null == results[date]){
	    results[date] = {}
	}
	results[date][time] = json
    })
    return results
}

function printSortedResults(results, precision=2){
    for(const date of Object.keys(results).sort()){
	console.log(date + ": ")
	for(const time of Object.keys(results[date]).sort()){
	    console.log("\t" + time + " download at " +
			((results[date][time]["download"] / 1024 / 1024).toFixed(precision)) + " MBit/s. upload at " +
			((results[date][time]["upload"] / 1024 / 1024).toFixed(precision)) + " MBit/s. Ping: " + results[date][time]["ping"])
	}
    }
}

function printEmptyJsonFiles(){
    if(null == emptyJsonFiles || false === Array.isArray(emptyJsonFiles) || 0 === emptyJsonFiles.length){
	return
    }    
    for(const file of emptyJsonFiles){
	console.log(file + " is empty")
    }
}

function printEmptyJsonFilesForDeletion(){
    if(null == emptyJsonFiles || false === Array.isArray(emptyJsonFiles) || 0 === emptyJsonFiles.length){
	return
    }
    let res = "rm "
    for(const file of emptyJsonFiles){
	res += (directory + "/" + file + " ")
    }
    console.log("to delete all empty files: " + res)
}

printSortedResults(getJsonFiles())
console.log("---")
printEmptyJsonFiles()
printEmptyJsonFilesForDeletion()
