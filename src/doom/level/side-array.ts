import { FRACBITS } from '../misc/fixed'
import { LumpType } from '../wad/lump'
import { Sector } from '../rendering/defs/sector'
import { Side } from '../rendering/defs/side'
import { TextureArray } from '../textures/texture-array'
import { tostring } from '../utils/c'

export class SideArray extends Array<MapSideDef> {
  static type: LumpType = 'sides'
  static isType(_: ArrayBuffer, name: string): boolean {
    return name === 'SIDEDEFS'
  }
  static get [Symbol.species](): ArrayConstructor {
    return Array
  }

  constructor(buffer: ArrayBuffer) {
    const numSides = buffer.byteLength / MapSideDef.sizeOf
    if (numSides !== Math.floor(numSides)) {
      throw 'invalid length of sides'
    }

    super(numSides)

    for (let i = 0, msPtr = 0;
      i < numSides;
      ++i, msPtr += MapSideDef.sizeOf
    ) {
      this[i] = new MapSideDef(buffer.slice(msPtr))
    }
  }

  getSides(
    textures: TextureArray,
    sectors: Sector[],
  ): Side[] {
    return this.map(msd =>
      new Side(
        msd.textureOffset << FRACBITS,
        msd.rowOffset << FRACBITS,
        textures.numForName(msd.topTexture),
        textures.numForName(msd.bottomTexture),
        textures.numForName(msd.midTexture),
        sectors[msd.sector],
      ),
    )
  }
}

// A SideDef, defining the visual appearance of a wall,
// by setting textures and offsets.
class MapSideDef {
  static sizeOf = 2 + 2 + 8 + 8 + 8 + 2

  textureOffset: number
  rowOffset: number
  topTexture: string
  bottomTexture: string
  midTexture: string

  // Front sector, towards viewer.
  sector: number

  constructor(buffer: ArrayBuffer) {
    const int16 = new Int16Array(buffer, 0, 15)
    this.textureOffset = int16[0]
    this.rowOffset = int16[1]
    this.topTexture = tostring(buffer, 4, 8)
    this.bottomTexture = tostring(buffer, 12, 8)
    this.midTexture = tostring(buffer, 20, 8)

    this.sector = int16[14]
  }
}
