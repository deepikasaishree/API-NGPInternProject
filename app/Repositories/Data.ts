import ENV from '@ioc:Adonis/Core/Env'
import ClickHouse from '../../Execution/ClickHouse'
import Exceptions from 'App/Exceptions'
import { ClickhouseData } from 'App/Data/Types'

const database = ENV.get('CLICKHOUSE_DB')
const table = ENV.get('DB_TABLE')

export default class CHquery {
  public static async missingCustomers() {
    const query = `select circuit_id,expected,actual,missings from (
            SELECT
                distinct circuit_id,
                (max(toStartOfMinute(source_ts)) - min(toStartOfMinute(source_ts))) / 60 as expected,
                count(source_ts) as actual,
                (max(toStartOfMinute(source_ts)) - min(toStartOfMinute(source_ts))) / 60 - count(source_ts) as missings
                FROM ${database}.${table} where active=1
				GROUP BY circuit_id)where missings>0`
    const chMissing: ClickhouseData = await ClickHouse.execute(query)
    if (chMissing && (!chMissing.success || (chMissing.data && !chMissing.data.length)))
      throw Exceptions.internalServerError(chMissing.message)
    return chMissing
  }

  public static async nonStreamingQuery(startDate: any, endDate: any, ctids: string) {
    const query = `select s.circuit_id,s.cou from
			(select a.circuit_id,sum(b.c) cou from
			( select cast(arrayJoin(range(toUnixTimestamp('${startDate}'),toUnixTimestamp('${endDate}'),86400)) as date) as ts ,
			cast(arrayJoin([${ctids}]) as UInt16)  as circuit_id) a 
			left join( select circuit_id,toDate(source_ts) date,count(*) c from ${database}.${table} 
			where active=1 and toDate(source_ts)>= '${startDate}' and toDate(source_ts)<= '${endDate}' 
			group by circuit_id,date) b on a.ts=b.date and a.circuit_id=b.circuit_id group by circuit_id
			order by a.circuit_id) s where s.cou=0`
    const chData: ClickhouseData = await ClickHouse.execute(query)
    if (chData && (!chData.success || (chData.data && !chData.data.length)))
      throw Exceptions.internalServerError(chData.message)
    return chData
  }
}
