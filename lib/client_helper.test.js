

import {jest} from '@jest/globals';

import {
    cli, cliDebugNotVerbose, cliDebugVerboseAndSilent, cliGermanAndSleep
} from '../__fixtures__/client.fixtures.js'

import {
    cliValid, checkAndAdjustFlags, getDataDir
} from './client_helper.js'

import dotenv from "dotenv"
dotenv.config()

test('flags valid and not adjusted', () => {
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
            "home": "./"
        },
        "input": [], 
    }
    expect(checkAndAdjustFlags(cli())).toStrictEqual(clientConfig)
})


test('flags debug set but not verbose - flags adjusted', () => {
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
            "verbose": true,
            "printEmptyFiles": false,
            "silent": false,
            "time": null,
            "silent": false,
            "home": "./"
        },
        "input": [], 
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
            "debug": false,
            "verbose": false,
            "printEmptyFiles": false,
            "silent": false,
            "time": null,
            "silent": true,
            "home": "./"
        },
        "input": [], 
    }
    expect(checkAndAdjustFlags(cliDebugVerboseAndSilent())).toStrictEqual(clientConfig)
})


test('flags german and sleep must not be combined - german will be switched off', () => {
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
            "german": false,
            "sleep": true,
            "home": "./"
        },
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

