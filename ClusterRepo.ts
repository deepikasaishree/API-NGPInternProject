import ClusterDomain from "App/Domains/Clusters"
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import {clickHouse} from '../../Services/ClickHouse'
import Error from '../Utils/Error'
import { ClusterRepo } from "."

class ClusterRepository{
    constructor(){}

    public async getClusterQuery({request}){
        const database: string = Env.get('CLICKHOUSE_DB');
        const table: string = Env.get('CLICKHOUSE_TABLE');
        
        const query = `SELECT a.host_name as host_name,database,table,is_readonly,last_queue_update,absolute_delay,active_replicas,zookeeper_exception,b.table_size as table_size FROM system.replicas,(select host_name from system.clusters where is_local = 1) as a,(SELECT formatReadableSize(sum(bytes)) AS table_size FROM system.parts WHERE database = '${database}' and table = '${table}') as b WHERE database = '${database}' and table = '${table}'`;
        const data: any = ClusterRepo.CH(query, request)
        const Data: any = data.toJSON()
        return Data && Data.data.length
              ? Data.data.map((m: any) => ClusterDomain.createFromJson(m).asJson())
              : []
    }

    public async getReplicasQuery({request}){
        const database: string = Env.get('CLICKHOUSE_DB');
        const table: string = Env.get('CLICKHOUSE_TABLE'); 
        const query = `SELECT b.*,* from system.replicas,(SELECT formatReadableSize(sum(bytes)) AS table_size FROM system.parts WHERE  database = '${database}' and table='${table}')as b where table = '${table}'`
        const data = ClusterRepo.CH(query, request)
        return data
    }
    
    async childProcess(cmd: string){
        return new Promise((resolve, reject) => {
            try {
                exec(cmd, (err:any, stdout: any, stderr: any) => {
                    console.log(stdout, stderr)
                    if (err) {
                        reject(err)
                    } else {
                        resolve(true)
                    }
                });
            } catch (error) {
                reject(error)
            }
        })
    
    }

    async getActiveCount({request}){
        const database: string = Env.get('CLICKHOUSE_DB')
        const table: string = Env.get('CLICKHOUSE_TABLE')
        const query = `select count(*) as count,active,max(source_ts) as last_updated  from ${database}.${table}  GROUP BY active`
        const data = ClusterRepo.CH(query, request)
        return data
    }
    
    public async CH(query: any, request:any){
        return await new Promise(async (resolve,reject) => {
            const result: any = { status: 0 }
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
        })
    }
}

export default new ClusterRepository()