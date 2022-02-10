import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CalculationsController {
  public getValue({ request, response }: HttpContextContract) {
    const { a } = request.all()
    const { b } = request.all()
    response.send(parseInt(a) + parseInt(b))
  }
  public getSubValue({ request, response }: HttpContextContract) {
    const { a } = request.qs()
    const { b } = request.all()
    //console.log(a)
    response.send(a - b)
  }
  public getMulValue({ request, response }: HttpContextContract) {
    const { a } = request.all()
    const { b } = request.all()
    response.send(a * b)
  }
  public getDivValue({ request, response }: HttpContextContract) {
    const { a } = request.all()
    const { b } = request.all()
    response.send(a / b)
  }
}
