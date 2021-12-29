

import { exec } from "child_process"
import os from "os"

import { getLogger } from './logger.js'

import { cliValid } from './client_helper.js'

const arr = {
    "linux": "/usr/bin/speedtest",
    "darwin": "/usr/local/Cellar/speedtest-cli/2.1.3/bin/speedtest",
}

export function execute(cli){
    cliValid(cli)
    const log = getLogger(cli)
    let home = cli.flags.home
    if(null == home){
        log.error("FATAL: no speedtest home dir could not been determined")
        process.exit(-1)        
    }
    log.debug("speedtest home: " + home)
    const now = new Date()
    const date = "" + now.getFullYear()
          + ("0" + (now.getMonth() + 1)).slice(-2)
          + ("0" + now.getDate()).slice(-2)
          + "-"
          + ("0" + now.getHours()).slice(-2)
          + ("0" + now.getMinutes()).slice(-2)

    log.verbose("will set name file to date str: " + date)

    let bin = null
    if(cli.flags.executable){
        log.debug("received executable via commandline")
        bin = cli.flags.executable
    }
    else {
        if(null == arr[os.platform()]){
            log.error("ERROR: no binary for platform '" + os.platform() + "'")
            return 
        }
        bin = arr[os.platform()]
    }
    if(null == bin){
        log.error("ERROR: no binary available for speedtest")
        return
    }
    log.debug("using " + bin + " for speedtest.")
    if(false === cli.flags.execute) {
        log.verbose("will NOT execute speedtest. use --execute to run the speedtest")
        return
    }
    const jsonFileStr = cli.flags.dataDir + "/" + date + ".json"
    if(false === cli.flags.quiet && (cli.flags.verbose)){
        log.debug("starting speedtest... saving file to " + jsonFileStr)
    }
    exec(bin + " --json > " + jsonFileStr, (error, stdout, stderr) => {
        if (error) {
            log.error(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            log.error(`stderr: ${stderr}`);
            return;
        }
        log.debug(`stdout: ${stdout}`);
        log.debug("measure result saved at " + jsonFileStr)
    })
}
