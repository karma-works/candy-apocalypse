import { LumpReader } from '../wad/lump-reader'
import { LumpType } from '../wad/lump'
import { tostring } from '../utils/c'

export class PNameArray extends Array<string> {
  static type: LumpType = 'pnames'
  static isType(_: ArrayBuffer, name: string): boolean {
    return name === 'PNAMES'
  }
  static get [Symbol.species](): ArrayConstructor {
    return Array
  }

  constructor(buffer: ArrayBuffer) {
    const [ num ] = new Int32Array(buffer, 0, 1)

    super(num)

    for (let i = 0; i < num; ++i) {
      this[i] = tostring(buffer, 4 + i * 8, 8)
    }
  }

  getLookup(lumpReader: LumpReader): number[] {
    return this.map(name => lumpReader.checkNumForName(name))
  }
}
