
import { dirname } from 'path';
import { fileURLToPath } from 'url';

export function printDebug(cli){
    if(false === cli.flags.debug){
        return
    }
    console.log("\n --- DEBUG BEGIN --- ")
    console.log("input: " + JSON.stringify(cli.input))
    console.log("flags: " + JSON.stringify(cli.flags))
    console.log(" --- DEBUG END --- ")
}


export function getDataDir(cli){
    if(null == cli || null == cli.flags){
        console.log("FATAL (lib/helper->getDataDir): invalid client configuration: " + JSON.stringify(cli))
        return null
    }
    if(null == cli.flags.dataDir){
        const dirName = dirname(fileURLToPath(import.meta.url)) + "/../data"
        if(cli.flags.debug){
            console.log("DEBUG: using " + dirName + " as --data-dir")
        }
        return dirName
    }
    const dirName = cli.flags.dataDir
    if(cli.flags.debug){
        console.log("DEBUG: using " + dirName + " as --data-dir")
    }
    return dirName
}
