import { DateTime } from 'luxon'
import { BaseModel, column, scope } from '@ioc:Adonis/Lucid/Orm'

export default class Employee extends BaseModel {
  public static byKeyword = scope((query, keyword) => {
    keyword = `%${decodeURIComponent(keyword)}%`
    return query
      .where('employeeName', 'ilike', keyword)
      .orWhere('mobile', 'like', keyword)
      .orWhere('email', 'ilike', keyword)
    //.orWhere('dob', '=', keyword)
  })

  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: 'employeeName' })
  public employeeName: string

  @column()
  public mobile: string

  @column()
  public email: string

  @column()
  public dob: DateTime

  @column()
  public department: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
