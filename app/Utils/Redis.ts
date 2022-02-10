import Env from '@ioc:Adonis/Core/Env'
const redisConnection = require('redis')
const redisClient = redisConnection.createClient({
  host: Env.get('REDIS_HOST'),
  port: Env.get('REDIS_PORT'),
  db: Env.get('REDIS_DB'),
})

class Redis {
  public async getcustomerCtidMapping(id) {
    return new Promise((resolve) => {
      const data = { success: false }
      redisClient.hmget('customerId_ctid_mapping', id, (err, result) => {
        if (err) data['message'] = 'ERROR_IN_REDIS_EXECUTION'
        if (!err && !result.length) data['message'] = 'NO_DATA_IN_REDIS'
        else {
          data.success = true
          data['result'] = result[0]
        }
        return resolve(data)
      })
    })
  }
}
export default new Redis()
