import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import Compression from '../Utils/Compression'

const SECRET_KEY = Env.get('JWT_SECRET_KEY') || ''
const TOKEN_EXPIRY_HOURS: any = Env.get('JWT_TOKEN_EXPIRY_HOURS') || 4
// let token  = jwt.sign({ 
//   "password": "213",
//   "username": "sridevi",
//   "verified": true
// }, SECRET_KEY, {
//   expiresIn: 60 * 60 * TOKEN_EXPIRY_HOURS
// })
// console.log(token)

export default class Jwt {
  public async handle({
    request,
    response
  }: HttpContextContract, next: () => Promise < void > ) {

    let token = request.headers().authorization || request.input('token') || ''

    if (token && token.startsWith("Bearer ")) token = token.slice(7, token.length);

    if (token) {

      const decoded = await jwt.verify(token, SECRET_KEY, async (err, decodedData) => {
        if (err) return false
        return decodedData
      })

      if (!decoded) return response.status(401).send({
        msg: `JWT Expired / Invalid`
      })

      const isVerified = decoded.verified || decoded.claims.verified

      if (isVerified != true) return response.status(401).send({
        msg: 'User not verified'
      });

      request['decoded'] = decoded
      await next()
      const final_result = await Compression.zipResponse(response)
      return response.send(final_result)
    } else {
      return response.status(401).send({
        msg: 'Auth Token Not Supplied'
      });
    }
  }

  static async generateToken(data) {
    try {
      return jwt.sign(data, SECRET_KEY, {
        expiresIn: 60 * 60 * TOKEN_EXPIRY_HOURS
      })
    } catch (error) {
      return error
    }
  }
}
