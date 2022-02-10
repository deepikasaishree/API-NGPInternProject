import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

export default class NewMiddleware {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const apiKey = request.headers()['apikey']
    if (!apiKey || apiKey !== Env.get('API_KEY')) {
      response.status(401).send({ success: false, message: 'API key does not match' })
      return
    }
    await next()
  }
}
