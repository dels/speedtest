
export function cli(date=null, time=null) {
    const cli = {
        input: [],
        flags: {
            dataDir: "./data2",
            debug:false,
            verbose:false,
            printEmptyFiles:false,
            daysBack:14,
            silent: true,
            date: date,
            time: time
        }
    }
    return cli
}

export function cliDebugNotVerbose(date=null, time=null) {
    const cli = {
        input: [],
        flags: {
            dataDir: "./data2",
            debug: true,
            verbose:false,
            printEmptyFiles:false,
            daysBack:14,
            silent: false,
            date: date,
            time: time
        }
    }
    return cli
}


export function cliDebugVerboseAndSilent(date=null, time=null) {
    const cli = {
        input: [],
        flags: {
            dataDir: "./data2",
            debug: true,
            verbose:true,
            printEmptyFiles:false,
            daysBack:14,
            silent: true,
            date: date,
            time: time
        }
    }
    return cli
}
