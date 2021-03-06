
export function cliDefault(date=null, time=null) {
    const cli = {
        input: [],
        flags: {
            dataDir: "./data2",
            debug:false,
            verbose:false,
            printEmptyFiles:false,
            daysBack:14,
            date: date,
            time: time,
            avgDownload: 225,
            avgUpload: 22.5,
            minDownload: 150,
            minUpload: 10,
            download: 250,
            upload: 25,
            silent: true,
        }
    }
    return cli
}

export function cliDebug(date=null, time=null) {
    const cli = {
        input: [],
        flags: {
            dataDir: "./data2",
            printEmptyFiles:false,
            daysBack:14,
            silent: false,
            date: date,
            time: time,
            avgDownload: 225,
            avgUpload: 22.5,
            minDownload: 150,
            minUpload: 10,
            download: 250,
            upload: 25,
            silly: false,
            debug: true,
            verbose:false,

        }
    }
    return cli
}

export function cliInfoLogLevel(date=null, time=null) {
    const cli = {
        input: [],
        flags: {
            dataDir: "./data2",
            debug:false,
            verbose:false,
            info:true,
            printEmptyFiles:false,
            daysBack:14,
            silent: true,
            date: date,
            time: time,
            avgDownload: 225,
            avgUpload: 22.5,
            minDownload: 150,
            minUpload: 10,
            download: 250,
            upload: 25
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
            time: time,
            avgDownload: 225,
            avgUpload: 22.5,
            minDownload: 150,
            minUpload: 10,
            download: 250,
            upload: 25
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
            time: time,
            avgDownload: 225,
            avgUpload: 22.5,
            minDownload: 150,
            minUpload: 10,
            download: 250,
            upload: 25
        }
    }
    return cli
}

export function cliGermanAndSleep() {
    const cli = {
        input: [],
        flags: {
            dataDir: "./data2",
            debug: false,
            verbose:false,
            printEmptyFiles:false,
            daysBack:14,
            german: true,
            sleep: true,
        }
    }
    return cli
}

export function cliEmptyDataDir(date=null, time=null) {
    const cli = {
        input: [],
        flags: {
            dataDir: "./__fixtures__/fixture_files/empty",
            debug:false,
            verbose:false,
            printEmptyFiles:false,
            daysBack:14,
            silent: true,
            date: date,
            time: time,
            avgDownload: 225,
            avgUpload: 22.5,
            minDownload: 150,
            minUpload: 10,
            download: 250,
            upload: 25,
        }
    }
    return cli
}


export function cliFullyValidDataDir(date=null, time=null) {
    const cli = {
        input: [],
        flags: {
            dataDir: "./__fixtures__/fixture_files/fully_valid_test/",
            debug:false,
            verbose:false,
            printEmptyFiles:false,
            daysBack:14,
            silent: true,
            date: date,
            time: time,
            avgDownload: 225,
            avgUpload: 22.5,
            minDownload: 150,
            minUpload: 10,
            download: 250,
            upload: 25,
        }
    }
    return cli
}
