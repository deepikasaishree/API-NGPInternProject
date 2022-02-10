import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MissingValidator {
  constructor(protected ctx: HttpContextContract) {}

  public get data() {
    return {
      ...this.ctx.request.all(),
    }
  }
  public schema = schema.create({
    startTime: schema.date({
      format: 'yyyy-MM-dd HH:mm:ss',
    }),
    endTime: schema.date(
      {
        format: 'yyyy-MM-dd HH:mm:ss',
      },
      [rules.afterField('startTime')]
    ),
    circuitIds: schema.string(),
    sourceRes: schema.number(),
  })

  public messages = {
    'required': '{{ field }} is required',
    'date.format': '{{ date }} must be formatted as {{ format }}',
  }
}
