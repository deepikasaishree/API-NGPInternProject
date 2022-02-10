export default class NonStreamingDomain {
  private readonly data: Array<Number>
  private readonly activeCtids: Array<string>
  private readonly nonStreamingCtids: Array<Number>

  constructor(data: Array<Number>, activeCtids: Array<string>, nonStreamingCtids: Array<Number>) {
    ;(this.data = data),
      (this.activeCtids = activeCtids),
      (this.nonStreamingCtids = nonStreamingCtids)
  }

  public static createData(d) {
    return new NonStreamingDomain(d.data, d.activeCtids, d.nonStreamingCtids)
  }
  public asJson() {
    return {
      data: this.data,
      activeCtids: this.activeCtids,
      nonStreamingCtids: this.nonStreamingCtids,
    }
  }
}
