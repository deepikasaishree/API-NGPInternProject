export default class MissingDomain {
  private readonly ctid: number
  private readonly count: number
  private readonly ts_s: Array<object>

  constructor(ctid: number, count: number, ts_s: Array<object>) {
    this.ctid = ctid
    this.count = count
    this.ts_s = ts_s
  }
  public static createData(data) {
    return new MissingDomain(data.ctid, data.count, data.ts_s)
  }
  public asJson() {
    return {
      ctid: this.ctid,
      count: this.count,
      ts_s: this.ts_s,
    }
  }
}
