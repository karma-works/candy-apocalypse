import { FRACBITS } from '../misc/fixed'
import { LumpInfo } from '../wad/types'
import { LumpReader } from '../wad/lump-reader'
import { Patch } from '../rendering/defs/patch'

export interface SpriteLump {
  lump: number
  patch: Patch
  name: string

  width: number
  leftOffset: number
  topOffset: number
}

export class SpriteArray extends Array<SpriteLump> {
  static get [Symbol.species](): ArrayConstructor {
    return Array
  }

  constructor(lumpReader?: LumpReader) {
    super()

    lumpReader && this.load(lumpReader)
  }

  load(lumpReader: LumpReader) {
    this.length = 0

    const first = lumpReader.getNumForName('S_START') + 1
    const last = lumpReader.getNumForName('S_END') - 1

    let lumpInfo: LumpInfo
    let name: string
    let altLump: number
    let patch: Patch
    for (let i = 0, lump = first; lump <= last; ++i, ++lump) {
      lumpInfo = lumpReader.lumpInfo[lump]
      name = lumpInfo.name

      altLump = lumpReader.getNumForName(name)
      patch = lumpReader.cacheLumpNum(altLump, Patch)

      this[i] = {
        lump: altLump,
        patch,
        name,

        width: patch.width << FRACBITS,
        leftOffset: patch.leftOffset << FRACBITS,
        topOffset: patch.topOffset << FRACBITS,
      }
    }
  }
}
