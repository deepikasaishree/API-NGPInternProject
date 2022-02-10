import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import JWT from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import Compression from '../Utils/Compression'

const SECRET_KEY = Env.get('JWT_SECRET_KEY') || ''

export default class Jwt {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const genericErrorMessage = 'Error while handling JWT.'
    try {
      let authHeader = request.header('authorization')

      if (!authHeader)
        return response.unauthorized({
          success: false,
          message: genericErrorMessage,
        })

      if (authHeader && authHeader.startsWith('Bearer '))
        authHeader = authHeader.split('Bearer ')[1]
      else return response.unauthorized({ success: false, message: genericErrorMessage })

      const token: any = JWT.verify(authHeader, SECRET_KEY)

      const userType = token.claims.roles
        .map((role: any) => {
          if (role.active === true) return role.key
        })
        .filter((d) => d)
      token.userType = userType

      if (token.claims.verified !== true)
        return response.unauthorized({ success: false, message: genericErrorMessage })

      // if (request.ctx) request.ctx.token = { parsed: token, base64: authHeader }
      request['decoded'] = { parsed: token, base64: authHeader }

      await next()

      const finalResult = await Compression.zipResponse(response)
      return response.send(finalResult)
    } catch (err) {
      return response.unauthorized({
        success: false,
        message: genericErrorMessage,
      })
    }
  }
}
