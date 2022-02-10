import ClickHouse from '../../Execution/ClickHouse'
import { ClickHouseData } from 'App/Data/ClickHouseData'
import Env from '@ioc:Adonis/Core/Env'
import Exceptions from 'App/Exceptions'
import { redis } from '../../Services/Redis'
import {
  MissingCustomerDomain,
  MissingDomain,
  NonStreamingDomain,
  DuplicatesDomain,
} from '../Domains/index'

class DataRepo {
  public readonly database = Env.get('CLICKHOUSE_DB')
  public readonly table = Env.get('CLICKHOUSE_TABLE')
  constructor() {}

  public async missing(startTime: string, endTime: string, circuitIds: any, sourceRes: any) {
    const query = `select cast(arrayJoin([${circuitIds}]) as UInt16)  as ctid, cast(arrayJoin(range(toUnixTimestamp('${startTime}'),toUnixTimestamp('${endTime}'),${sourceRes})) as datetime) as source_ts where (source_ts,ctid) not in (select (cast((toUnixTimestamp(source_ts)-modulo(toUnixTimestamp(source_ts),${sourceRes})) as datetime),circuit_id) from ${this.database}.${this.table} where source_ts>='${startTime}' and source_ts<='${endTime}' and active = 1 and circuit_id in (${circuitIds})) order by ctid,source_ts`
    const chData: ClickHouseData = await ClickHouse.execute(query)

    if (chData && (!chData.success || (chData.data && !chData.data.length)))
      throw Exceptions.internalServerError(chData.message)

    const result = {}

    chData.data.map((d) => {
      if (result[d.ctid]) result[d.ctid].ts_s.push(d.source_ts)
      else {
        result[d.ctid] = {
          ctid: d.ctid,
          ts_s: [d.source_ts],
        }
      }
    })
    let totalCount = 0
    const finalData: Array<object> = Object.values(result).map((v: any) => {
      let count = v.ts_s.length || 0
      v.count = count
      totalCount += count
      return v
    })
    const chMissing: Array<object> = finalData.map((m: any) => MissingDomain.createData(m).asJson())
    return { total: totalCount, data: chMissing }
  }

  public async duplicates(startTime: string, endTime: string, circuitIds: any, sourceRes: any) {
    const query = `SELECT circuit_id as ctid, count(*) as duplicates, CAST(toUnixTimestamp(source_ts) - (toUnixTimestamp(source_ts) % ${sourceRes}),'datetime') as source_ts FROM ${this.database}.${this.table} where source_ts>='${startTime}' and source_ts<='${endTime}' and active=1 and circuit_id in (${circuitIds}) group by source_ts,ctid having duplicates>1 order by ctid,source_ts`
    const chData: ClickHouseData = await ClickHouse.execute(query)

    if (chData && (!chData.success || (chData.data && !chData.data.length)))
      throw Exceptions.internalServerError(chData.message)
    const chDuplicate: Array<object> = chData.data.map((m: any) =>
      DuplicatesDomain.createData(m).asJson()
    )
    return chDuplicate
  }

  public async missingCustomers() {
    const query = `select circuit_id,expected,actual,missings from (
        SELECT
            distinct circuit_id,
            (max(toStartOfMinute(source_ts)) - min(toStartOfMinute(source_ts))) / 60 as expected,
            count(source_ts) as actual,
            (max(toStartOfMinute(source_ts)) - min(toStartOfMinute(source_ts))) / 60 - count(source_ts) as missings
            FROM ${this.database}.${this.table} where active=1
            GROUP BY circuit_id)where missings>0`

    const chData: ClickHouseData = await ClickHouse.execute(query)

    if (chData && (!chData.success || (chData.data && !chData.data.length)))
      throw Exceptions.internalServerError(chData.message)

    const redisCustCtid: any = await redis.getcustomerCtidMapping()

    const ctidCustomerIDmapping = {}

    const totalCustomersInRedis = Object.keys(redisCustCtid)

    await Promise.all(
      totalCustomersInRedis.map(async (custId) => {
        const custCtids = JSON.parse(redisCustCtid[custId])

        await Promise.all(custCtids.map((ctid: any) => (ctidCustomerIDmapping[ctid] = custId)))
      })
    )

    const missingCustomerList = {}

    await Promise.all(
      chData.data.map((val) => {
        const customerId = ctidCustomerIDmapping[val.circuit_id]

        if (customerId) {
          if (missingCustomerList[customerId]) missingCustomerList[customerId].push(val)
          else missingCustomerList[customerId] = [val]
        }
      })
    )

    const final: any = {
      totalCustomers: totalCustomersInRedis.length,
      missingCustomers: Object.keys(missingCustomerList).length,
      missingCustomersData: missingCustomerList,
    }
    const chMissingCustomers: Array<object> = final.map((m: any) =>
      MissingCustomerDomain.createData(m).asJson()
    )
    return chMissingCustomers
  }

  public async nonStreamingQuery(startDate: any, endDate: any, ctids: string) {
    const query = `select s.circuit_id,s.cou from
			(select a.circuit_id,sum(b.c) cou from
			( select cast(arrayJoin(range(toUnixTimestamp('${startDate}'),toUnixTimestamp('${endDate}'),86400)) as date) as ts ,
			cast(arrayJoin([${ctids}]) as UInt16)  as circuit_id) a 
			left join( select circuit_id,toDate(source_ts) date,count(*) c from ${this.database}.${this.table} 
			where active=1 and toDate(source_ts)>= '${startDate}' and toDate(source_ts)<= '${endDate}' 
			group by circuit_id,date) b on a.ts=b.date and a.circuit_id=b.circuit_id group by circuit_id
			order by a.circuit_id) s where s.cou=0`
    const chData: ClickHouseData = await ClickHouse.execute(query)
    if (chData && (!chData.success || (chData.data && !chData.data.length)))
      throw Exceptions.internalServerError(chData.message)
    const nonStreamingCtids: any = []
    const resData: any = {}
    await Promise.all([
      chData.data.map((el: any) => {
        nonStreamingCtids.push(el.circuit_id)
      }),
    ])

    resData['data'] = nonStreamingCtids
    resData['activeCtids'] = ctids.split(',')
    resData['nonStreamingCtids'] = nonStreamingCtids
    const nonStreaming: object = NonStreamingDomain.createData(resData).asJson()
    return nonStreaming
  }
}

export default new DataRepo()
