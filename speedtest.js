#!/usr/bin/env node

import meow from 'meow';

import { getLogger } from './lib/logger.js'
import { printResultsSorted } from './lib/helper.js'
import { checkAndAdjustFlags } from './lib/client_helper.js'
import { readJsonFiles } from './lib/measures.js'
import { execute } from './lib/speedtest_exec.js'

import { measurementNowWouldComplyGermanComplianceReport } from './lib/measures.js'

const cli = meow(`        
	Description
	  runs the speedtest, usally using cronjob that runs every hours. 
	  parameters should be set using speedtest script in same directory. 
	  however, you should customize paramters.

	Usage
	  $ speedtest.js --execute

	Options
          --debug, -d,  debug
          --verbose, -v, verbose
          --execute, -e, execute     (default: false)
          --silent, -q, silent
          --sleep, -s, --no-sleep    (default: true)
          --min-sleep,               (default: 5)
          --max-sleep,               (default: 45)
          --executable
          --home                     root-path of speedtest git checkout
          --data-dir                 (default: ./data)
          --german, -g               (default: false)

         Logging Options
          --log-file                 (logfile to log infos to)
          --error                    (only errors are logged)
          --warn                     (errors and warnings are logged)
          --info                     (errors, warnings and infos are logged)
          --verbose, -v              (for verbose logging)
          --debug, -d                (for debugging purposes)
          --silly                    (log all steps and data - for tracing errors)

        Debugging Options
          --date                     (format: YYYY-MM-DD)
          --time                     (format: HH:MM)

        Examples
          $ speedtest.js --execute
`, {
    importMeta: import.meta,
    booleanDefault: undefined,
    version: "0.0.1",
    flags: {
        debug: {
            type: 'boolean',
            default: false,
            alias: 'd'
        },
        verbose: {
            type: 'boolean',
            default: false,
            alias: 'v'
        },
        dataDir: {
            type: 'string',
            default: "./data",
        },

        execute: {
            type: 'boolean',
            default: false,
            alias: 'e'
        },
        silent: {
            type: 'boolean',
            default: false,
        },
        sleep: {
            type: 'boolean',
            default: true,
            alias: 's'
        },
        maxSleep: {
            type: 'number',
            default: 45,
        },
        minSleep: {
            type: 'number',
            default: 5,
        },
        executable: {
            type: "string",
        },
        date: {
            type: "string",
        },
        home: {
            type: "string",
        }

    }
});

checkAndAdjustFlags(cli)
const log = getLogger(cli)

const {measures, emptyJsonFiles }  = readJsonFiles(cli)

if(null == measures){
    process.exit(-1)
}

if(cli.flags.debug){
    printResultsSorted(cli, measures, emptyJsonFiles)
}

if(cli.flags.german){
    if(false === measurementNowWouldComplyGermanComplianceReport(cli, measures)){
        process.exit(0)
    }
}
if(cli.flags.sleep){
    const sleepTimeMin = Math.floor(Math.random() * (cli.flags.maxSleep - cli.flags.minSleep + 1)) + cli.flags.minSleep
    const sleepTimeMs = sleepTimeMin * 60 * 1000
    if(cli.flags.debug || cli.flags.verbose){
        log.debug("will sleep for " + sleepTimeMin + " minutes")
    }
        await new Promise(resolve => {
            setTimeout(resolve, sleepTimeMs);
        })
}

execute(cli)

