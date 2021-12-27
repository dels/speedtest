

import { exec } from "child_process"
import dotenv  from "dotenv"
import os from "os"

dotenv.config("../")

const arr = {
    "linux": "/usr/bin/speedtest",
    "darwin": "/usr/local/Cellar/speedtest-cli/2.1.3/bin/speedtest",
}

export function execute(cli){
    if(null == cli || null == cli.flags){
        console.log("missing flags as parameter.")
        return false
    }
    let home = cli.flags.home
    if(null == home){
        console.warn("FATAL: no speedtest home dir could not been determined")
        process.exit(-1)        
    }
    if(cli.flags.debug){
        console.debug("SPEEDTEST_DIR: " + home)
    }
    const now = new Date()
    const date = "" + now.getFullYear()
          + ("0" + (now.getMonth() + 1)).slice(-2)
          + ("0" + now.getDate()).slice(-2)
          + "-"
          + ("0" + now.getHours()).slice(-2)
          + ("0" + now.getMinutes()).slice(-2)

    if(cli.flags.debug || cli.flags.verbose)
        console.log("will set name file to date str: " + date)

    let bin = null
    if(cli.flags.executable){
        if(cli.flags.debug){
            console.log("received executable via commandline")
        }
        bin = cli.flags.executable
    }
    else {
        if(null == arr[os.platform()]){
            console.error("ERROR: no binary for platform '" + os.platform() + "'")
            return 
        }
        bin = arr[os.platform()]
    }
    if(null == bin){
        console.error("ERROR: no binary available for speedtest")
        return
    }
    if(cli.flags.debug){
        console.log("using " + bin + " for speedtest.")
    }
    if(false === cli.flags.execute) {
        if(false === cli.flags.quiet){
            console.log("will NOT execute speedtest. use --execute to run the speedtest")
        }
        return
    }
    const jsonFileStr = cli.flags.dataDir + "/" + date + ".json"
    if(false === cli.flags.quiet && (cli.flags.debug || cli.flags.verbose)){
        console.log("starting speedtest... saving file to " + jsonFileStr)
    }
    exec(bin + " --json > " + jsonFileStr, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        if(cli.flags.debug)
            console.log(`stdout: ${stdout}`);
        if(cli.flags.debug || cli.flags.verbose)
            console.log("measure result saved at " + process.env.SPEEDTEST_DIR + "/data/" + date + ".json")
    })
}
