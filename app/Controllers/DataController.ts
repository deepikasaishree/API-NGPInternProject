import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MissingValidator, NonStreamingCircuitValidator } from 'App/Validators/index'
import DataRepo from 'App/Repository/DataRepo'
import Env from '@ioc:Adonis/Core/Env'

export default class DataController {
  public static async getMissing({ request, response }: HttpContextContract) {
    const validParams: any = await request.validate(MissingValidator)
    validParams.startTime = validParams.startTime.toFormat('yyyy-MM-dd HH:mm:ss')
    validParams.endTime = validParams.endTime.toFormat('yyyy-MM-dd HH:mm:ss')

    let { startTime, endTime, circuitIds, sourceRes }: any = validParams

    circuitIds = circuitIds.split(',').map(Number)

    const isInValidCtids: any = circuitIds.find((c: any) => isNaN(c) === true)
    if (isInValidCtids !== undefined)
      return response.badRequest({
        success: false,
        msg: 'Invalid CircuitIds',
      })

    const data: any = await DataRepo.missing(startTime, endTime, circuitIds, sourceRes)
    return response.ok({
      success: true,
      host: Env.get('CLICKHOUSE_HOST'),
      total: data.total,
      data: data.data,
    })
  }

  public static async getDuplicates({ request, response }: HttpContextContract) {
    const validParams: any = await request.validate(MissingValidator)

    validParams.startTime = validParams.startTime.toFormat('yyyy-MM-dd HH:mm:ss')
    validParams.endTime = validParams.endTime.toFormat('yyyy-MM-dd HH:mm:ss')

    let { startTime, endTime, circuitIds, sourceRes }: any = validParams

    circuitIds = circuitIds.split(',').map(Number)

    const isInValidCtids: any = circuitIds.find((c: number) => isNaN(c) === true)

    if (isInValidCtids !== undefined)
      return response.badRequest({
        success: false,
        msg: 'Invalid CircuitIds',
      })

    const data: object = await DataRepo.duplicates(startTime, endTime, circuitIds, sourceRes)
    return response.ok({ success: true, host: Env.get('CLICKHOUSE_HOST'), data: data })
  }

  public static async getMissingCustomer({ response }: HttpContextContract) {
    const repoData: object = await DataRepo.missingCustomers()
    return response.ok({ success: true, data: repoData })
  }

  public static async getNonStreaming({ request, response }: HttpContextContract) {
    const validParams: any = await request.validate(NonStreamingCircuitValidator)
    if (!validParams) return
    const { activeCircuits }: any = validParams
    const now = new Date()
    const currentDate = now.toJSON().slice(0, 10).replace(/-/g, '-')
    let pastTwoDay: any = new Date(now.setDate(now.getDate() - 1))
    pastTwoDay = pastTwoDay.toJSON().slice(0, 10).replace(/-/g, '-')

    let chQuery: object = await DataRepo.nonStreamingQuery(pastTwoDay, currentDate, activeCircuits)
    return response.ok({ success: true, ...chQuery })
  }
}
