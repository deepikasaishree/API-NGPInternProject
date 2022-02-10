export default class AnalyticsDomain {
  private readonly start: number
  private readonly end: number
  private readonly max_time: number
  private readonly count_kwh: string

  constructor(start: number, end: number, max_time: number, count_kwh: string) {
    this.start = start
    this.end = end
    this.max_time = max_time
    this.count_kwh = count_kwh
  }
  public static createData(data) {
    return new AnalyticsDomain(data.start, data.end, data.max_time, data.count_kwh)
  }
  public asJson() {
    return {
      start: this.start,
      end: this.end,
      max_time: this.max_time,
      count_kwh: this.count_kwh,
    }
  }
}
