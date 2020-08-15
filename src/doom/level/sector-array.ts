import { Data } from '../rendering/data'
import { FRACBITS } from '../misc/fixed'
import { LumpType } from '../wad/lump'
import { Sector } from '../rendering/defs/sector'
import { tostring } from '../utils/c'

export class SectorArray extends Array<MapSector> {
  static type: LumpType = 'sectors'
  static isType(_: ArrayBuffer, name: string): boolean {
    return name === 'SECTORS'
  }
  static get [Symbol.species](): ArrayConstructor {
    return Array
  }

  constructor(buffer: ArrayBuffer) {
    const numSectors = buffer.byteLength / MapSector.sizeOf
    if (numSectors !== Math.floor(numSectors)) {
      throw 'invalid length of sectors'
    }

    super(numSectors)

    for (let i = 0, msPtr = 0;
      i < numSectors;
      ++i, msPtr += MapSector.sizeOf
    ) {
      this[i] = new MapSector(buffer.slice(msPtr))
    }
  }

  getSectors(
    data: Data,
  ): Sector[] {
    return this.map(ms =>
      new Sector(
        ms.floorHeight << FRACBITS,
        ms.ceilingHeight << FRACBITS,
        data.flatNumForName(ms.floorPic),
        data.flatNumForName(ms.ceilingPic),
        ms.lightLevel,
        ms.special,
        ms.tag,
        null,
      ),
    )
  }
}

// Sector definition, from editing.
class MapSector {
  static sizeOf = 2 + 2 + 8 + 8 + 2 + 2 + 2

  floorHeight: number
  ceilingHeight: number
  floorPic: string
  ceilingPic: string
  lightLevel: number
  special: number
  tag: number

  constructor(buffer: ArrayBuffer) {
    const int16 = new Int16Array(buffer, 0, 13)

    this.floorHeight = int16[0]
    this.ceilingHeight = int16[1]
    this.floorPic = tostring(buffer, 4, 8)
    this.ceilingPic = tostring(buffer, 12, 8)
    this.lightLevel = int16[10]
    this.special = int16[11]
    this.tag = int16[12]
  }
}
