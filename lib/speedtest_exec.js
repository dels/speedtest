

import { exec } from "child_process"
import dotenv  from "dotenv"

const default_speedtest_bin = "/usr/local/Cellar/speedtest-cli/2.1.3/bin/speedtest"

dotenv.config("../")

function fillWithZero(doubleDigitNumber){
    if(doubleDigitNumber < 10){
        return "0" + doubleDigitNumber
    }
    return "" + doubleDigitNumber
}

export function execute(flags, speedtest_bin){
    if(null == flags){
        console.log("missing flags as parameter. setting default values")
        flags = {}
        flags.debug = true
        flags.verbose = true
    }
    
    if(null == process.env.SPEEDTEST_DIR){
        console.warn("WARN: no speedtest dir found")
        process.exit(-1)
    }
    if(flags.debug)
        console.log("SPEEDTEST_DIR: " + process.env.SPEEDTEST_DIR)
    const now = new Date()
    const date = "" + now.getFullYear() + (now.getMonth() + 1) + now.getDate() + "-" + fillWithZero(now.getHours()) + fillWithZero(now.getMinutes()) + (now.getSeconds())

    if(flags.debug)
        console.log("will set date to : " + date)
    
    // speedtest_bin could be replaced by parameters
    let bin = undefined
    if(speedtest_bin){
        bin = speedtest_bin
    }
    else{ 
        bin = default_speedtest_bin
    }
    if(flags.debug){
        console.log("using " + bin + " for speedtest.")
    }
    if(false === flags.execute) {
        return
    }
    exec(bin + " --json > " + process.env.SPEEDTEST_DIR + "/data/" + date + ".json", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        if(flags.verbose)
            console.log(`stdout: ${stdout}`);
        if(flags.debug || flags.verbose)
            console.log("measure result saved at " + process.env.SPEEDTEST_DIR + "/data/" + date + ".json")
    })
}
