const correlator = require('correlation-id')
const {
    createLogger
} = require('logger')
import Env from '@ioc:Adonis/Core/Env'
const logger = createLogger(Env.get('LOG_PATH'))

export default class Log {

    static async clickHouseLog(level: string, req:any, data:any, message:string, status:string) {
        level = level ? level.toUpperCase() : 'info'
        const corrID = req ? req.headers['x-correlation-id'] : ''
        const timestamp = new Date()
        const url = req ? `${req.protocol}://${req.get('host')}${req.originalUrl}` : ''
        const method = 'clickHouseLog'
        const type = 'trace'
    
        const correlationId = corrID ? corrID : correlator.withId(() => {
                                                    return correlator.getId()
                                                });
        // console.log({corrID,correlationId})
        data = (typeof data == 'object') ? JSON.stringify(data) : data
        const logMessage = {
            level,
            correlationId,
            timestamp,
            url,
            method,
            type,
            data,
            message,
            status
        }
        logger.format = (level:string, date:any, message: string) => {
            console.log(level,date)
            return message;
        }
        logger.log(`notice: ${JSON.stringify(logMessage)}`)
        return correlationId
    }
}