import Logger from '@ioc:Adonis/Core/Logger'
import {clickHouse} from '../../Services/ClickHouse'
import Error from '../Utils/Error';

export default class ClickHouse {
    static async CH(query: any, request:any){
        return await new Promise(async (resolve,reject) => {
            const result = { status: 0 }
            await clickHouse.query(query, async (err:any, data:any) => {
                if(err){
                    result['err'] = err
                    Logger.error({request},`ERROR_IN_GET_CLUSTER_DATA_WHEN_PROCESSING_CLICKHOUSE_DATA`)
                    reject(result)
                }
                try {
                    if (data.length<=0) {
                        result['msg'] = "No Data Found"
                        Logger.error({request},`NO_DATA_FOUND_IN_CLICKHOUSE_WITHIN_THE_GIVEN_RANGE`)
                        reject(result)
                    } else {
                        result.status = 1
                        result['data'] = data
                        resolve(result)
                    }
                } catch (e) {
                    const err = await Error.getError(e)
                    result['err'] = err
                    Logger.error({request},`ERROR_IN_GET_CLUSTER_DATA_WHEN_PROCESSING_CLICKHOUSE_DATA`)
                    reject(result)
                }
            })
        });
    }
}
