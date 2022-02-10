import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  GetValidateValidator,
  PostValidateValidator,
  PutValidateValidator,
  PatchValidateValidator,
} from 'App/Validators/Index'
import { Employees } from 'App/Repositories'

export default class EmployeesController {
  public async get({ request }: HttpContextContract): Promise<any> {
    const { field, name, order, page, limit } = await request.validate(GetValidateValidator)
    return await Employees.search(field, name, order, page, limit)
  }

  public async post({ request }: HttpContextContract): Promise<any> {
    const { employeeName, mobile, email, dob, department } = await request.validate(
      PostValidateValidator
    )
    return await Employees.create(employeeName, mobile, email, dob, department)
  }

  public async put({ params, request }: HttpContextContract): Promise<any> {
    const { employeeName, mobile, email, dob, department } = await request.validate(
      PutValidateValidator
    )
    return await Employees.update(params.id, employeeName, mobile, email, dob, department)
  }

  public async patch({ params, request }: HttpContextContract): Promise<any> {
    const { employeeName, mobile, email, dob, department } = await request.validate(
      PatchValidateValidator
    )
    return await Employees.update(params.id, employeeName, mobile, email, dob, department)
  }

  public async delete({ params }: HttpContextContract): Promise<any> {
    return await Employees.delete(params.id)
  }
}
