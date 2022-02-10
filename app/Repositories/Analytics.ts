import Env from '@ioc:Adonis/Core/Env'
import ClickHouse from '../../Execution/ClickHouse'
import { ClickhouseData } from 'App/Data/Types'
import Exception from 'App/Exceptions/index'
import AnalyticsDomain from 'App/Domains/AnalyticsDomain'

class Analytics {
  constructor() {}
  public async analysisWithRes(
    startTime: string,
    endTime: string,
    resolution: number,
    aggStr: any,
    circuitId: any,
    condition: string
  ) {
    const query = `select circuit_id,(toUnixTimestamp(source_ts) - ((toUnixTimestamp(source_ts)-toUnixTimestamp('${startTime}')) % ${resolution}))*pow(10,3) as start,(toUnixTimestamp(max(source_ts)) - (toUnixTimestamp(max(source_ts)) %60))*pow(10,3) as end,max(source_ts) as max_time,${aggStr} from ${Env.get(
      'CLICKHOUSE_DB'
    )}.${Env.get(
      'CLICKHOUSE_TABLE'
    )} where source_ts>='${startTime}' and source_ts<'${endTime}' and circuit_id in (${circuitId}) ${condition} and active = 1 group by circuit_id,start order by circuit_id,start`
    const chData: ClickhouseData = await ClickHouse.execute(query)
    if (chData && (!chData.success || (chData.data && !Object.keys(chData.data).length)))
      throw Exception.internalServerError(chData.message)
    let tempData: any = {}
    chData.data.forEach((data) => {
      let addData = {
        ...data,
      }
      delete addData.circuit_id
      if (tempData[data.circuit_id]) tempData[data.circuit_id].push(addData)
      else
        tempData = {
          ...tempData,
          [data.circuit_id]: [addData],
        }
    })
    let finalData = {}
    Object.keys(tempData).map((m: any) => {
      let temp: Array<Object> = tempData[m].map((e: any) => {
        return AnalyticsDomain.createData(e).asJson()
      })
      finalData[m] = temp
    })
    return finalData
  }

  public async analysisWithoutRes(startTime: string, endTime: string, aggStr: any, circuitId: any) {
    const query = `SELECT circuit_id,(toUnixTimestamp(min(source_ts)) - (toUnixTimestamp(min(source_ts)) %60))*pow(10,3) as start,(toUnixTimestamp(max(source_ts)) - (toUnixTimestamp(max(source_ts)) %60))*pow(10,3) as end,${aggStr} FROM ${Env.get(
      'CLICKHOUSE_DB'
    )}.${Env.get(
      'CLICKHOUSE_TABLE'
    )} where source_ts>='${startTime}' and source_ts<'${endTime}' and circuit_id in (${circuitId}) and active = 1 group by circuit_id`
    const chData: ClickhouseData = await ClickHouse.execute(query)
    if (chData && (!chData.success || (chData.data && !Object.keys(chData.data).length)))
      throw Exception.internalServerError(chData.message)
    let tempData: any = {}
    if (!chData.success) return chData
    chData.data.forEach((data) => {
      let addData = {
        ...data,
      }
      delete addData.circuit_id
      if (tempData[data.circuit_id]) tempData[data.circuit_id].push(addData)
      else
        tempData = {
          ...tempData,
          [data.circuit_id]: [addData],
        }
    })
    let finalData = {}
    Object.keys(tempData).map((m: any) => {
      let temp: Array<Object> = tempData[m].map((e: any) => {
        return AnalyticsDomain.createData(e).asJson()
      })
      finalData[m] = temp
    })
    return finalData
  }
}

export default new Analytics()
