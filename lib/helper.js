
import { getLogger } from './logger.js'
import { cliValid } from './client_helper.js'

export function measuresValid(measures){
    if(measures &&  measures instanceof Object){
        return true
    } 
    throw new Error("FATAL: invalid measures: " + JSON.stringify(measures))
}

export function printResultsSorted(cli, measures, emptyJsonFiles, precision=2){
    cliValid(cli)
    const log = getLogger(cli)
    for(const date of Object.keys(measures).sort()){
        log.debug(date + ": ")
        for(const time of Object.keys(measures[date]).sort()){
            log.debug("\t" + time + " download at " +
                        ((measures[date][time].download_mbit).toFixed(precision)) + " MBit/s. upload at " +
                        ((measures[date][time].upload_mbit).toFixed(precision)) + " MBit/s. Ping: " + measures[date][time]["ping"])
        }
    }
}
