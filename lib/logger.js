
import pkg from 'winston';
const { createLogger, format, transports } = pkg;

export function getLogger(cli){
    //console.log("setting loglevel to " + cli.logLevel)
    let transportsFlags = []
    let logfile = "./analyzer.log"
    if(cli.flags.logFile){
        logfile = cli.flags.logFile
    }
    //console.log("will use " + logfile + " for logging")
    if(null == cli.flags.logFile && (null == cli.flags.silent || cli.flags.silent)){
        //console.log("WARN: neither --log-file nor --no-silent set. will use console to log.")
        transportsFlags.push(new transports.Console())
    }
    if(cli.flags.silent && false === cli.flags.silent){
        transportsFlags.push(new transports.Console())
    }
    if(cli.flags.logFile){
        transportsFlags.push(new transports.File({
            filename: logfile,
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
            format.printf(info => `[${info.level}]: ${[info.timestamp]}: ${info.message}`),
        )
        /*
          new transports.File({
          filename: "analyzer.log",
          format:format.combine(
          format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
          format.align(),
          format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
          )}),
          
        */
    })
    
    //console.log("current loglevel: " + log.level)
    return log
}
/*
  const log = createLogger({
  transports: [
  new transports.Console()
  ],
  format: format.combine(
  format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss'
  }),
  format.printf(info => `[${info.level}]: ${[info.timestamp]}: ${info.message}`),
  )
  /*
  new transports.File({
  filename: "analyzer.log",
  format:format.combine(
  format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
  format.align(),
  format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
  )}),
  
*//*
    })
  */
