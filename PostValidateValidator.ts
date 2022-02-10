import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostValidateValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    employeeName: schema.string({ trim: true }, [
      rules.alpha({ allow: ['space'] }),
      rules.maxLength(50),
    ]),
    mobile: schema.string({}, [
      rules.mobile(),
      rules.minLength(10),
      rules.maxLength(10),
      rules.unique({ table: 'employees', column: 'mobile' }),
    ]),
    email: schema.string({}, [
      rules.email(),
      rules.unique({ table: 'employees', column: 'email' }),
    ]),
    dob: schema.date({ format: 'yyyy-MM-dd' }, [rules.before(18, 'years')]),
    department: schema.string()
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {
    'required': '{{ field }} is required',
    'alpha': '{{ field }} must contain only alphabets',
    'maxLength': '{{ field }} must be of max length: {{options.maxLength}}',
    'minLength': '{{ field }} must be of min length: {{options.minLength}}',
    'unique': '{{ field }} must be unique',
    'mobile': '{{ field }} must be mobile number',
    'dob.format': '{{ field }} must be formatted as {{ YYYY-MM-DD }}',
    'before': '{{field}} must be 18 or greater',
  }
}
