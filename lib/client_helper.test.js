
import {jest} from '@jest/globals';

import {
    cliDefault, cliDebugNotVerbose, cliInfoLogLevel, cliDebugVerboseAndSilent, cliGermanAndSleep
} from '../__fixtures__/client_helper.fixtures.js'

import {
    cliValid, checkAndAdjustFlags, getDataDir
} from './client_helper.js'



import dotenv from "dotenv"
dotenv.config()

test('flags valid and not adjusted - as no other log level is given, logLevel is set to error', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    const clientConfig = {
        "flags":  {
            "dataDir": "./data2",
            "date": null,
            "daysBack": 14,
            "debug": false,
            "verbose": false,
            "printEmptyFiles": false,
            "silent": true,
            "time": null,
            "silent": true,
            "home": "./",
            "avgDownload": 225,
            "avgUpload": 22.5,
            "minDownload": 150,
            "minUpload": 10,
            "download": 250,
            "upload": 25
        },
        "input": [],
        "logLevel": "error",
    }
    expect(checkAndAdjustFlags(cliDefault())).toStrictEqual(clientConfig)
})


test('flags with info as log level', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    const clientConfig = {
        "flags":  {
            "dataDir": "./data2",
            "date": null,
            "daysBack": 14,
            "debug": false,
            "verbose": false,
            "printEmptyFiles": false,
            "silent": true,
            "info": true,
            "time": null,
            "silent": true,
            "home": "./",
            "avgDownload": 225,
            "avgUpload": 22.5,
            "minDownload": 150,
            "minUpload": 10,
            "download": 250,
            "upload": 25
        },
        "input": [],
        "logLevel": "info",
    }
    expect(checkAndAdjustFlags(cliInfoLogLevel())).toStrictEqual(clientConfig)
})


test('flags debug set but not verbose - log level is debug', () => {
    //const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    const clientConfig = {
        "flags":  {
            "dataDir": "./data2",
            "date": null,
            "daysBack": 14,
            "debug": true,
            "verbose": false,
            "printEmptyFiles": false,
            "silent": false,
            "time": null,
            "silent": false,
            "home": "./",
            "avgDownload": 225,
            "avgUpload": 22.5,
            "minDownload": 150,
            "minUpload": 10,
            "download": 250,
            "upload": 25
        },
        "input": [],
        "logLevel": "debug",
    }
    expect(checkAndAdjustFlags(cliDebugNotVerbose())).toStrictEqual(clientConfig)
})

test('flags silent and also debug and verbose - flags adjusted', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    const clientConfig = {
        "flags":  {
            "dataDir": "./data2",
            "date": null,
            "daysBack": 14,
            "debug": true,
            "verbose": true,
            "printEmptyFiles": false,
            "silent": false,
            "time": null,
            "silent": true, 
            "home": "./",
            "avgDownload": 225,
            "avgUpload": 22.5,
            "minDownload": 150,
            "minUpload": 10,
            "download": 250,
            "upload": 25
        },
        "input": [], 
        "logLevel": "debug",
    }
    expect(checkAndAdjustFlags(cliDebugVerboseAndSilent())).toStrictEqual(clientConfig)
})


test('flags german and sleep can be combined', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    const clientConfig = {
        "flags":  {
            "dataDir": "./data2",
            "daysBack": 14,
            "debug": false,
            "verbose": false,
            "printEmptyFiles": false,
            "german": true,
            "sleep": true,
            "home": "./",
            "avgDownload": 225,
            "avgUpload": 22.5,
            "minDownload": 150,
            "minUpload": 10,
            "download": 250,
            "upload": 25
        },
        "logLevel": "error",
        "input": [], 
    }
    expect(checkAndAdjustFlags(cliGermanAndSleep())).toStrictEqual(clientConfig)
})

test('test invalid client config', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    expect(() => {
        cliValid(null)
    }).toThrow()
    expect(() => {
        cliValid({})
    }).toThrow()
    expect(() => {
        cliValid({"input": []})
    }).toThrow()
})

test('transform parameters correctly to flags', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    expect(checkAndAdjustFlags(cliDefault())).not.toBeNull()
})


test('check if connection parameters are validated', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    let cli = checkAndAdjustFlags(cliDefault())
    expect(cli).not.toBeNull()
    // test with both values empty
    cli.flags.download = null
    process.env.SPEEDTEST_DOWNLOAD = undefined
    expect(() => {
        checkAndAdjustFlags(cli) 
    }).toThrow()
    // testing with an invalid number
    cli.flags.download = "test string - not a number"
    process.env.SPEEDTEST_DOWNLOAD = undefined
    expect(() => {
        checkAndAdjustFlags(cli) 
    }).toThrow()
    // testing with a NaN number
    cli.flags.download = parseFloat("a")
    process.env.SPEEDTEST_DOWNLOAD = undefined
    expect(() => {
        checkAndAdjustFlags(cli) 
    }).toThrow()
    // we should prefer parameter over .env
    cli.flags.download = 100
    process.env.SPEEDTEST_DOWNLOAD = 200
    cli = checkAndAdjustFlags(cli)
    expect(cli.flags.download).toBe(100)
})

// test if loglevels are given set correctly when multiple loglevels are given
test('check if loglevels are set in the right priority', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    let cli = checkAndAdjustFlags(cliDefault())
    expect(cli.logLevel).toBe("error")
    cli.flags.verbose = true
    cli.flags.debug = true
    cli = checkAndAdjustFlags(cli)
    expect(cli.logLevel).toBe("debug")
    cli.flags.silly = true
    cli = checkAndAdjustFlags(cli)
    expect(cli.logLevel).toBe("silly")
    cli.flags.silly = false
    cli.flags.debug = false
    cli.flags.verbose = true
    cli = checkAndAdjustFlags(cli)
    expect(cli.logLevel).toBe("verbose")
    cli.flags.verbose = false
    cli.flags.warn = true
    cli.flags.error = true
    cli = checkAndAdjustFlags(cli)
    expect(cli.logLevel).toBe("warn")
    cli.flags.verbose = false
    cli.flags.info = true
    cli.flags.warn = true
    cli.flags.error = true
    cli = checkAndAdjustFlags(cli)
    expect(cli.logLevel).toBe("info")
})



test('adjust --data-dir if flag is empty', () => {
    const spy = jest.spyOn(console, 'log');
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
        throw new Error('process.exit() was called.')
    })
    let cli = checkAndAdjustFlags(cliDefault())
    expect(cli).not.toBeNull()
    cli.flags.dataDir = undefined
    checkAndAdjustFlags(cliDefault())
    expect(getDataDir(cli)).toBe("/Users/dels/git/github/speedtest/lib/../data")
    
    expect(cli.flags.dataDir).toBe("/Users/dels/git/github/speedtest/lib/../data")
})
