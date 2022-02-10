import EmployeeDomain from 'App/Domain/Employee'
import Employee from 'App/Models/Employee'
import { DateTime } from 'luxon'

class EmployeeRepository {
  constructor() {}
  public async search(field: any, name: any, order: any, page: any, limit: any) {
    const emp: any = Employee.query()
      .select('*')
      .if(field, (q) => {
        q.if(!isNaN(field), (d) => {
          d.where('id', field).orWhere('mobile', 'like', `${field}%`)
        }).unless(!isNaN(field), (d) =>
          d
            .orWhere('employeeName', 'ilike', `%${field}%`)
            .orWhere('email', 'ilike', `%${field}%`)
            .orWhere('department', 'ilike', `${field}%`)
        )
      })
      .orderBy(name || 'id', order || 'asc')
      .paginate(page || 1, limit || 10)
    //return emp

    const emp1 = await emp
    const EmpData: any = emp1.toJSON()
    return EmpData && EmpData.data.length
      ? EmpData.data.map((m: any) => EmployeeDomain.createFromJson(m).asJson())
      : []
  }
  public async create(
    employeeName: string,
    mobile: string,
    email: string,
    dob: DateTime,
    department: string
  ) {
    const emp: object = await Employee.create({
      employeeName: employeeName,
      mobile: mobile,
      email: email,
      dob: dob,
      department: department,
    })
    return emp
  }

  public async update(
    id: number,
    employeeName: string | undefined,
    mobile: string | undefined,
    email: string | undefined,
    dob: DateTime | undefined,
    department: string | undefined
  ) {
    const emp: any = await Employee.findOrFail(id)
    const newEmp: object = await emp
      .merge({
        employeeName: employeeName,
        mobile: mobile,
        email: email,
        dob: dob,
        department: department,
      })
      .save()
    return newEmp
  }
  public async delete(id: number) {
    const emp: any = await Employee.findOrFail(id)
    emp.delete()
    return 'deleted successfully'
  }
}

export default new EmployeeRepository()
