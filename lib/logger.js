
import pkg from 'winston';
const { createLogger, format, transports } = pkg;

export function getLogger(cli){
    //console.log("setting loglevel to " + cli.logLevel)

    let transportsFlags = []
    if(cli.flags.silent && false === cli.flags.silent){
        transportsFlags.push(new transports.Console())
    }
    if(cli.flags.logfile){
        transportsFlags.push(new transports.File({
          filename: "./analyzer.log",
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
