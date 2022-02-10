export default class Error {
  static async getError(err:any) {
    const e = err.stack.split("\n");
    return `${e[0]} ${e[1]}`
  }
}