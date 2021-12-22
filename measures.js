
const fs = require('fs');
const path = require('path')


const directory = __dirname + "/data"

function readJsonFiles(emptyJsonFiles=undefined){
    let measures = {}
    const jsonsInDir = fs.readdirSync(directory).filter(file => path.extname(file) === ".json")

    jsonsInDir.forEach((file) => {
	const fileData = fs.readFileSync(path.join(directory, file))
	if(0 === fileData.length){
            if(emptyJsonFiles){
	        emptyJsonFiles.push(file)
            }
	    return
	}
	const json = JSON.parse(fileData.toString())
	const ts = new Date(Date.parse(json.timestamp))
	const date = ts.getFullYear() +  ("0" + (ts.getMonth() + 1)).slice(-2) + ("0" + ts.getDate()).slice(-2)
	//const time = ("0" + ts.getHours()).slice(-2) + ("0" + ts.getMinutes()).slice(-2) + ("0" + ts.getSeconds()).slice(-2)
	const time = ("0" + ts.getHours()).slice(-2) + ("0" + ts.getMinutes()).slice(-2)
	if(null == measures[date]){
	    measures[date] = {}
	}
	measures[date][time] = json
        measures[date][time].download_mbit = measures[date][time].download / 1024 / 1024
        measures[date][time].upload_mbit = measures[date][time].upload / 1024 / 1024
    })
    return measures
}

module.exports = {
    readJsonFiles: readJsonFiles,
}
