import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Data from 'App/Repositories/Data'
//import ClickHouse from '../../../Execution/ClickHouse'
import NonStreamingValidator from '../../Validators/NonStreamingCircuitValidator'

export default class NonStreamingsController {
  public static async get({ request, response }: HttpContextContract) {
    const resData: any = { success: true }
    const validParams: any = await request.validate(NonStreamingValidator)
    if (!validParams) return
    const { activeCircuits }: any = validParams
    const now = new Date()
    const currentDate = now.toJSON().slice(0, 10).replace(/-/g, '-')
    let pastTwoDay: any = new Date(now.setDate(now.getDate() - 1))
    pastTwoDay = pastTwoDay.toJSON().slice(0, 10).replace(/-/g, '-')

    let chQuery: any = await Data.nonStreamingQuery(pastTwoDay, currentDate, activeCircuits)

    // return chData
    const nonStreamingCtids: any = []

    if (chQuery) {
      await Promise.all([
        chQuery.map((el: any) => {
          nonStreamingCtids.push(el.circuit_id)
        }),
      ])

      resData['data'] = nonStreamingCtids
      resData['activeCtids'] = activeCircuits.split(',')
      resData['nonStreamingCtids'] = nonStreamingCtids
      // resData['customerDetails']  = await DbCircuitRepo.getCustomersByCtids(nonStreamingCtids)
    } else {
      resData.msg = 'No data'
    }
    return response.ok(resData)
  }
}
