/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import Employee from 'App/Models/Employee'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }
  public async handle(error: any, ctx: HttpContextContract) {
    /**
     * Self handle the validation exception
     */
    if (error.code === 'E_ROW_NOT_FOUND') {
      return ctx.response.status(404).send({ success: false, message: 'Row Not Found' })
    }
    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.status(404).send({ success: false, message: 'Page Not Found' })
    }
    if (error.code === 'E_VALIDATION_FAILURE') {
      return ctx.response.status(400).send({
        success: false,
        message: error.messages.errors.map((m: any) => {
          return m.message
        }),
      })
    }
    if (Employee.first() === null) {
      return ctx.response.status(404).send({ success: false, message: 'Items Not Found' })
    }
    if (Env.get('NODE_ENV') === 'production') {
      return ctx.response.status(500).send({ success: false, message: 'Internal Server Error' })
    }
    return super.handle(error, ctx)
  }
}
