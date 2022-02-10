import Env from '@ioc:Adonis/Core/Env'

export default class GetDataQueries {
    static async getClusterQuery(){
        const database = Env.get('CLICKHOUSE_DB');
        const table = Env.get('CLICKHOUSE_TABLE');
        
        return `SELECT a.host_name as host_name,database,table,is_readonly,last_queue_update,absolute_delay,active_replicas,zookeeper_exception,b.table_size as table_size FROM system.replicas,(select host_name from system.clusters where is_local = 1) as a,(SELECT formatReadableSize(sum(bytes)) AS table_size FROM system.parts WHERE database = '${database}' and table = '${table}') as b WHERE database = '${database}' and table = '${table}'`;
    }

    static async getReplicasQuery(){
        const database = Env.get('CLICKHOUSE_DB');
        const table = Env.get('CLICKHOUSE_TABLE'); 
        return `SELECT b.*,* from system.replicas,(SELECT formatReadableSize(sum(bytes)) AS table_size FROM system.parts WHERE  database = '${database}' and table='${table}')as b where table = '${table}'`
    }
}