function scramble(a: number): number {
  return ((a & 1) << 7) +
    ((a & 2) << 5) +
    (a & 4) +
    ((a & 8) << 1) +
    ((a & 16) >> 1) +
    (a & 32) +
    ((a & 64) >> 5) +
    ((a & 128) >> 7)
}

export interface CheatSeq {
  sequence: number[]
  p?: number
}

export class Cheat {
  private cheatXlateTable: number[]

  constructor() {
    this.cheatXlateTable = []
    for (let i = 0; i < 256; ++i) {
      this.cheatXlateTable[i] = scramble(i)
    }
  }

  //
  // Called in st_stuff module, which handles the input.
  // Returns a 1 if the cheat was successful, 0 if failed.
  //
  checkCheat(cheat: CheatSeq, key: number): boolean {
    let rc = false
    if (!cheat.p) {
      cheat.p = 0
    }

    if (cheat.sequence[cheat.p] === 0) {
      cheat.sequence[cheat.p++] = key
    } else if (this.cheatXlateTable[key] === cheat.sequence[cheat.p]) {
      cheat.p++
    } else {
      cheat.p = 0
    }

    if (cheat.sequence[cheat.p] === 1) {
      cheat.p++
    } else if (cheat.sequence[cheat.p] === 0xff) {
      // end of sequence cahracter
      cheat.p = 0
      rc = true
    }

    return rc
  }

  getParam(cheat: CheatSeq): string {
    let p = 0
    while (cheat.sequence[p++] !== 1) { /* */ }

    let str = ''
    let c: number
    do {
      c = cheat.sequence[p]
      str += String.fromCharCode(c)
      cheat.sequence[p++] = 0
    } while (c && cheat.sequence[p] !== 0xff)

    return str
  }

}
