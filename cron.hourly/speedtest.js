#!/usr/bin/env node

import { execute } from '../lib/speedtest_exec.js'
import meow from 'meow';

const cli = meow(`
        
	Description
	  runs the speedtest, usally using cronjob that runs every hours. 
	  parameters should be set using speedtest script in same directory. 
	  however, you should customize paramters.

	Usage
	  $ speedtest.js

	Options
	  --debug, -d,  debug
          --verbose, -v, verbose
          --execute, -e, execute
          --quiet, -q, quiet
          --min-sleep, min-sleep
          --max-sleep, max-sleep

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
	execute: {
	    type: 'boolean',
	    default: false,
	    alias: 'e'
	},
	quiet: {
	    type: 'boolean',
	    default: false,
	    alias: 'q'
	},
	maxSleep: {
	    type: 'number',
	    default: 45,
	},
	minSleep: {
	    type: 'number',
	    default: 5,
	}

    }
});

/*
  https://www.bundesnetzagentur.de/DE/Vportal/TK/InternetTelefon/Internetgeschwindigkeit/start.html

  todo for compliant checking:
  - fixme: we cant just work for the three days, we need to find timeframes which are suitable for checking the following parameters
  - sanity check: if there has been a break of at least 3 hours after 5th and 6th measure
  - sanity check: has there been a break of at least 5 minutes between checks
  - sanity check: where there at least 10 measures per day in three non-consquitive days
  - sanity check: have there been breaks between days? 
  - sanity check: has threse been all sanity checks?
  - check: we need to add "minimale Geschwindigkeit" which must not be fallenn below which is another check
*/

if(cli.flags.debug){
    cli.flags.printEmptyFiles = true
    console.log("flags: " + JSON.stringify(cli.flags))
    console.log("input: " + JSON.stringify(cli.input))
    console.log("debug? " + cli.flags.debug)
}

execute(cli.flags)


// wait a random amount of seconds smaller than 1 hour so that, on average, we measure every hours but not everytime the same minute
// sleep $(( ($RANDOM % 60) * 60 ))

///usr/bin/speedtest --json > $SPEEDTEST_DIR/data/$(date +'%Y%m%d-%H%M%S').json ; 
//chown -R $SPEEDTEST_USER:$SPEEDTEST_USER  $SPEEDTEST_DIR ;
