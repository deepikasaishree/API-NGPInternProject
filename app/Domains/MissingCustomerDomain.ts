export default class MissingCustomerDomain {
  private readonly totalCustomers: number
  private readonly missingCustomers: number
  private readonly missingCustomersData: Array<object>

  constructor(
    totalCustomers: number,
    missingCustomers: number,
    missingCustomersData: Array<object>
  ) {
    this.totalCustomers = totalCustomers
    this.missingCustomers = missingCustomers
    this.missingCustomersData = missingCustomersData
  }
  public static createData(data) {
    return new MissingCustomerDomain(
      data.totalCustomers,
      data.missingCustomers,
      data.missingCustomersData
    )
  }
  public asJson() {
    return {
      totalCustomers: this.totalCustomers,
      missingCustomers: this.missingCustomers,
      missingCustomersData: this.missingCustomersData,
    }
  }
}
