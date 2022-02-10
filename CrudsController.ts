import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ValidateValidator from 'App/Validators/ValidateValidator'
import * as fs from 'fs'

export default class CrudsController {
  public async postNew({ request, response }: HttpContextContract) {
    try {
      await request.validate(ValidateValidator)
      const detail = request.all()
      let d = fs.readFileSync('Details.json').toString()
      d = d ? JSON.parse(d) : []
      if (Object.entries(d).length === 0) {
        response.send('The file is empty')
      } else {
        d.push(detail)
        fs.writeFileSync('Details.json', JSON.stringify(d))
        response.send('posted successfully')
      }
    } catch {
      response.send('could not post the details')
    }
  }
  public getAll({ response }) {
    try {
      const d = fs.readFileSync('Details.json').toString()
      if (Object.entries(d).length === 0) {
        response.send('The file is empty')
      } else {
        response.send(JSON.parse(d))
      }
    } catch {
      response.send('cannot fetch the details')
    }
  }
  public detail({ request, response }) {
    try {
      let d = fs.readFileSync('Details.json').toString()
      d = JSON.parse(d)
      const { email } = request.all()
      let index = d.find((i) => i.email === email)
      response.send(index)
    } catch (e) {
      response.send(e.message)
    }
  }

  public putDetails({ request, response }) {
    try {
      let d = fs.readFileSync('Details.json').toString()
      d = JSON.parse(d)
      const { email } = request.all()
      let index = d.find((i) => i.email === email)
      if (index !== null) {
        d.push(request.body())
      }
      d.pop(index)
      response.send('updated successfully')
      fs.writeFileSync('Details.json', JSON.stringify(d))
    } catch (e) {
      response.send(e.message)
    }
  }
  public patchDetails({ request, response }) {
    try {
      let d = fs.readFileSync('Details.json').toString()
      d = JSON.parse(d)
      let r = request.all()
      let index = d.find((d, i) => {
        if (d.email === r.email) {
          d[i] = { ...d[i], ...r }
        }
      })
      if (index === undefined) {
        response.send('Can not update')
      } else {
        fs.writeFileSync('Details.json', JSON.stringify(d))
        response.send('updated successfully')
      }
    } catch (e) {
      response.send(e.message)
    }
  }
  public deleteDetails({ request, response }) {
    try {
      let d = fs.readFileSync('Details.json').toString()
      d = JSON.parse(d)
      const { email } = request.all()
      let index = d.find((i) => i.email === email)
      d.pop(index)
      fs.writeFileSync('Details.json', JSON.stringify(d))
      response.send('deleted successfully')
    } catch (e) {
      response.send(e.message)
    }
  }
}
