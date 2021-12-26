
export function measuresValid(measures){
    if(measures &&  measures instanceof Object){
        return true
    } 
    throw new Error("FATAL: invalid measures: " + JSON.stringify(measures))
}

export function printResultsSorted(measures, emptyJsonFiles, precision=2){
    for(const date of Object.keys(measures).sort()){
        console.log(date + ": ")
        for(const time of Object.keys(measures[date]).sort()){
            console.debug("\t" + time + " download at " +
                        ((measures[date][time].download_mbit).toFixed(precision)) + " MBit/s. upload at " +
                        ((measures[date][time].upload_mbit).toFixed(precision)) + " MBit/s. Ping: " + measures[date][time]["ping"])
        }
    }
}
