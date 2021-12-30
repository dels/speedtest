
import winston from "winston";

import { resolve } from "path";
import { fileURLToPath } from "url";

const { format, transports, createLogger } = winston;
// eslint-disable-next-line no-unused-vars
const { combine, timestamp, printf, colorize } = format;
/*
import pkg from 'winston';
import { resolve } from "path";
import { fileURLToPath } from "url";

const { createLogger, format, transports,  } = pkg;

const { combine, timestamp, printf } = format;
*/

export function getLogger(cli, meta_url){
    if(null == cli || null == meta_url){
        throw new Error("cli or meta_url is null or undefined")
    }
    let transportsFlags = []
    let logfile = "./analyzer.log"
    if(cli.flags.logFile){
        logfile = cli.flags.logFile
    }
    const root = resolve("./")
    const file = fileURLToPath(new URL(meta_url))
    const file_path = file.replace(root, "")
    const customFormat = printf(({ level, message, timestamp, stack }) => {
        return `[${level}] ${timestamp} ${file_path}: ${stack || message}`
    })
    if(null == cli.flags.logFile && (null == cli.flags.silent || cli.flags.silent)){
        transportsFlags.push(new transports.Console(
            {
                format: combine(colorize(), customFormat),
            }
        ))
    }
    if(null == cli.flags.silent || false === cli.flags.silent){
        transportsFlags.push(new transports.Console(
            {
                format: combine(colorize(), customFormat),
            }
        ))
    }
    if(cli.flags.logFile){
        transportsFlags.push(new transports.File({
            filename: logfile,
            format: combine(colorize(), customFormat),
        }))
    }
    
    let log = createLogger({
        level: cli.logLevel,
        
        transports: [
            ...transportsFlags
        ],
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.printf(info => `[${info.level}]: ${[info.timestamp]} ${[info.filename]}: ${info.message}`),
        )
    })
    
    //console.log("current loglevel: " + log.level)
    log.silly("logger configured with loglevel " + log.level + " called from file " + file + ". will log to logfile: " + logfile)
    return log
}
