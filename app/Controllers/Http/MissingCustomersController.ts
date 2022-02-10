import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Redis from '../../../Services/Redis'
import Data from 'App/Repositories/Data'

export default class MissingCustomersController {
  public static async getMissingCustomer({ response }: HttpContextContract) {
    const query: any = await Data.missingCustomers()
    const redisCustCtid: any = await Redis.customerCtidMapping()
    const ctidCustomerIDmapping = {}
    const totalCustomersInRedis = Object.keys(redisCustCtid)

    await Promise.all(
      totalCustomersInRedis.map(async (custId) => {
        const custCtids = JSON.parse(redisCustCtid[custId])

        await Promise.all(custCtids.map((ctid: any) => (ctidCustomerIDmapping[ctid] = custId)))
      })
    )

    let missingCustomerList = {}

    await Promise.all(
      query.data.map((val) => {
        const customerId = ctidCustomerIDmapping[val.circuit_id]
        if (customerId) {
          if (missingCustomerList[customerId]) missingCustomerList[customerId].push(val)
          else missingCustomerList[customerId] = [val]
        }
      })
    )

    const final = {
      totalCustomers: totalCustomersInRedis.length,
      missingCustomers: Object.keys(missingCustomerList).length,
      missingCustomersData: missingCustomerList,
    }

    return response.ok({ success: true, data: final })
  }
}
