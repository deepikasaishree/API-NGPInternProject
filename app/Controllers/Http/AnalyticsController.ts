//import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Analytics from 'App/Repositories/Analytics'
import AnalyticsValidator from 'App/Validators/AnalyticsValidator'
import Exceptions from 'App/Exceptions/index'
import Redis from 'App/Utils/Redis'

export default class AnalyticsController {
  public static async getAnalytics({ request, response }) {
    const analytics: any = await request.validate(AnalyticsValidator)
    if (!analytics.customerId) analytics.customerId = request.ctx.token.parsed.customerId
    if (!analytics.userType) analytics.userType = request.ctx.token.parsed.userType
    const { startTime, endTime, resolution, circuitIds, tags, customerId, userType }: any =
      analytics
    let reqCtids: any = circuitIds

    if (userType.length === 0) {
      const ctids: any = await Redis.getcustomerCtidMapping(customerId)
      if (!ctids.success) throw Exceptions.invalid(ctids.message)
      reqCtids = await circuitIds.map(Number).filter((ctid) => ctids.includes(ctid))
    }

    const circuitId = reqCtids.join(',')
    let aggStr: any = []
    let fields: any = []
    let condition: any = []

    const aggregations = {
      sum: 'sum',
      mean: 'avg',
      avg: 'avg',
      max: 'max',
      min: 'min',
      count: 'count',
    }
    const fieldCalculation = {
      kw: 'p/1000',
      kva: 's/1000',
      kwh: 'e/1000',
      msm: 'msm',
    }

    tags.map((tag) => {
      //
      tag.aggregator.map((agg) => {
        aggStr.push(
          `(CAST(${aggregations[agg.toLowerCase()]}(${
            fieldCalculation[tag.field.toLowerCase()]
          }) as float)) as ${agg.toLowerCase()}_${tag.field.toLowerCase()}`
        )
      })
      let isCondition = tag.condition ? (tag.condition.length > 0 ? true : false) : false

      if (isCondition) {
        tag.condition.map((c) => {
          condition.push(`${tag.field} ${c.key} cast(${c.value} as Float32)`)
        })
      }
      fields.push(tag.field.toLowerCase())
    })

    if (condition.length > 0) condition = `and ${condition.join(' and ')}`
    else condition = ''

    aggStr = aggStr.join(',')
    fields = fields.join(',')
    let finalData: any
    if (resolution)
      finalData = await Analytics.analysisWithRes(
        startTime,
        endTime,
        resolution,
        aggStr,
        circuitId,
        condition
      )
    else finalData = await Analytics.analysisWithoutRes(startTime, endTime, aggStr, circuitId)

    return response.ok({ success: true, data: finalData })
  }
}
