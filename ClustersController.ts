import Logger from '@ioc:Adonis/Core/Logger'
const { exec } = require("child_process")
const csv = require('csvtojson')
import { 
    rowFields, CHActiveCountFields 
} from '../../contracts/Interface/cluster'
import Error from '../Utils/Error';
import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ClusterRepo } from 'App/Repositories'

export default class GetClustersController {
    
    static async getData({request, response}: HttpContextContract){
        const result: any = { status: 'failure' }
        try {
    
            const data: any = await ClusterRepo.getClusterQuery(request)
            //const data: any =  await ClickHouse.CH(query, request)

            if(!data.status){
                data.status = 'failure'
                return response.send(data)
            }
        
            /*const respData:rowFields[] = data.data.map((value) => {
                const rows: rowFields = {
                    // "database": value.database,
                    // "table": value.table,
                    "is_readonly": value.is_readonly,
                    "last_queue_update": value.last_queue_update,
                    "absolute_delay": value.absolute_delay,
                    "active_replicas": value.active_replicas,
                    "zookeeper_exception": value.zookeeper_exception,
                    "table_size": value.table_size
                }
                return rows 
        })*/

            result.status = "success"
            result['host'] = data.data[0]['host_name']
            result['data'] = data
            Logger.info({request},`RESPONSE_FOR_GET_CLUSTER`)
        } catch (e) {
            // console.log(e)
            result['err'] = e
            Logger.error({request},`ERROR_IN_GET_CLUSTER_DATA`)
        }
        return response.send(result)
    }

    // Get Replicas Information
    static async getReplicasData({request, response}:HttpContextContract){
        const result: any = { status: 'failure' }
        try {            
            const data: any = await ClusterRepo.getReplicasQuery(request)
            // console.log(query)
            //const data: any =  await ClickHouse.CH(query, request)

            if(!data.status){
                data.status = 'failure'
                return response.send(data)
            }

            result.status= "success",
            result['data']= data.data
            Logger.info({request},`RESPONSE_FOR_GET_CLUSTER`)
        } catch (e) {
            const err = await Error.getError(e)
            result['err'] = err
            Logger.error({request},`ERROR_IN_GET_CLUSTER_DATA`)
        }
        return response.send(result)
    }
    
    static async getReplicasStatus({request, response}:HttpContextContract){
        const result: any = { status: 'failure' }
        try {
            const table: string = request.all().table_name || Env.get('CLICKHOUSE_TABLE')
            const scriptPath: string = Env.get('SH_SCRIPT_PATH')
            const csvFileName: string = Env.get('CSV_FILE_NAME')
            const cmd: string = `bash ${scriptPath}/replica_uptime.sh  ${table}`
            const csvFilePath: string = `${scriptPath}/${csvFileName}`
            const done: any = await ClusterRepo.childProcess(cmd)

            if (!done) {
                result['error'] = "cmd failed"
                Logger.error({request},`ERROR_IN_SSH_COMMAND`)
                return response.send(result)
            }
            const csvResult = await new Promise(async (resolve, reject) => { 
                csv().fromFile(csvFilePath).then((jsonObj) => {
                    result['status'] = "success",
                    result['data'] = jsonObj
                    Logger.info({request},`RESPONSE_FOR_GET_REPLICA_STATUS`)
                    resolve(result)
                }).catch(async (e: any) => {
                    const err = await Error.getError(e)
                    result['err'] = err
                    Logger.error({request},`ERROR_IN_GET_REPLICA_STATUS`)
                    reject(result)
                })
            });
            return csvResult
        } catch (e) {
            // console.log(e)
            const err = await Error.getError(e)
            result['err'] = err
            Logger.error({request},`ERROR_IN_GET_REPLICA_STATUS`)
            return result
        }
    }
    
    static async getActiveCount({request, response}: HttpContextContract){
        const result: any = { status: 'failure' }
        try {
            //const table: string = request.all().table_name || Env.get('CLICKHOUSE_TABLE')
            // console.log(table)
            
            //const query = `select count(*) as count,active,max(source_ts) as last_updated  from ${Env.get('CLICKHOUSE_DB')}.${table}  GROUP BY active`
            const data: any = ClusterRepo.getActiveCount(request)
            //const data: any =  await ClickHouse.CH(query, request)
            if(!data.status){
                result.status = 'failure'
                return response.send(result)
            }

            const respData: CHActiveCountFields = {total:0};
            const reduced = data.data.reduce((el:any,ch:any)=>{
                if(ch.active){
                    el.active = Number(ch.count)
                    el.activeTime = ch.last_updated
                } else {
                    el.inactive = Number(ch.count)
                    el.inactiveTime = ch.last_updated
                }
                el.total += Number(ch.count)
                return el
            },respData)

            result.status = "success"
            result['data'] = reduced
            Logger.info({request},`RESPONSE_FOR_GET_COUNT`)
        } catch (e) {
            // console.log(e)
            result['err'] = await Error.getError(e)
            Logger.error({request},`ERROR_IN_GET_COUNT`)
        }
        return response.send(result)
    }
}