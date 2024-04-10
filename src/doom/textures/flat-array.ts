import { Flat } from './flat'
import { LumpInfo } from '../wad/types'
import { LumpReader } from '../wad/lump-reader'

interface FlatLump {
  lump: number,
  name: string,
  flat: Flat,
}

export class FlatArray extends Array<FlatLump> {
  static get [Symbol.species](): ArrayConstructor {
    return Array
  }

  private translation = new Array<number>()

  constructor(lumpReader?: LumpReader) {
    super()

    lumpReader && this.load(lumpReader)
  }

  load(lumpReader: LumpReader) {
    this.length = 0

    const firstFlat = lumpReader.getNumForName('F_START') + 1
    const lastFlat = lumpReader.getNumForName('F_END') - 1
    const num = lastFlat - firstFlat + 1

    let lumpInfo: LumpInfo
    let name: string
    let altLump: number
    for (let lump = firstFlat; lump <= lastFlat; ++lump) {
      lumpInfo = lumpReader.lumpInfo[lump]
      name = lumpInfo.name

      altLump = lumpReader.getNumForName(name)

      this.push({
        lump: altLump,
        name,
        flat: lumpReader.cacheLumpNum(altLump, Flat),
      })
    }

    // Create translation table for global animation.
    this.translation = Array.from({ length: num + 1 }, (_, i) => i)
  }

  //
  // R_FlatNumForName
  // Retrieval, get a flat number for a flat name.
  //
  numForName(name: string): number {
    const i = this.findIndex(l =>
      l.name.toUpperCase() === name.toUpperCase())
    if (i === -1) {
      throw `R_FlatNumForName: ${name} not found`
    }
    return i
  }

  getNum(num: number): number {
    return this.translation[num]
  }
  get(num: number): Flat {
    return this[this.translation[num]].flat
  }
  translate(src: number, dest: number): void {
    this.translation[src] = dest
  }
}
