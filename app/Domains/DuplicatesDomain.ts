export default class DuplicatesDomain {
  private readonly ctid: number
  private readonly duplicates: number
  private readonly source_ts: Array<object>

  constructor(ctid: number, duplicates: number, source_ts: Array<object>) {
    this.ctid = ctid
    this.duplicates = duplicates
    this.source_ts = source_ts
  }
  public static createData(data) {
    return new DuplicatesDomain(data.ctid, data.duplicates, data.source_ts)
  }
  public asJson() {
    return {
      ctid: this.ctid,
      duplicates: this.duplicates,
      source_ts: this.source_ts,
    }
  }
}
