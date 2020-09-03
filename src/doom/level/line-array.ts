import { Line } from '../rendering/defs/line'
import { LumpType } from '../wad/lump'
import { Side } from '../rendering/defs/side'
import { Vertex } from '../rendering/data/vertex'

export class LineArray extends Array<MapLineDef> {
  static type: LumpType = 'lines'
  static isType(_: ArrayBuffer, name: string): boolean {
    return name === 'LINEDEFS'
  }
  static get [Symbol.species](): ArrayConstructor {
    return Array
  }

  constructor(buffer: ArrayBuffer) {
    const numNodes = buffer.byteLength / MapLineDef.sizeOf
    if (numNodes !== Math.floor(numNodes)) {
      throw 'invalid length of lines'
    }

    super(numNodes)

    for (let i = 0, msPtr = 0;
      i < numNodes;
      ++i, msPtr += MapLineDef.sizeOf
    ) {
      this[i] = new MapLineDef(buffer.slice(msPtr))
    }
  }

  getLines(
    vertexes: Vertex[],
    sides: Side[],
  ): Line[] {
    return this.map(mld => {
      const ld = new Line(
        vertexes[mld.v1],
        vertexes[mld.v2],
        mld.flags,
        mld.special,
        mld.tag,
      )

      ld.sideNum[0] = mld.sideNum[0]
      ld.sideNum[1] = mld.sideNum[1]

      if (ld.sideNum[0] !== -1) {
        ld.frontSector = sides[ld.sideNum[0]].sector
      } else {
        ld.frontSector = null
      }

      if (ld.sideNum[1] !== -1) {
        ld.backSector = sides[ld.sideNum[1]].sector
      } else {
        ld.backSector = null
      }

      return ld
    })
  }

}

// A LineDef, as used for editing, and as input
// to the BSP builder.
class MapLineDef {
  static sizeOf = 2 * 5 + 2 * 2

  v1: number
  v2: number
  flags: number
  special: number
  tag: number

  // sidenum[1] will be -1 if one sided
  sideNum: number[]

  constructor(buffer: ArrayBuffer) {
    const int16 = new Int16Array(buffer, 0, 7)
    this.v1 = int16[0]
    this.v2 = int16[1]
    this.flags = int16[2]
    this.special = int16[3]
    this.tag = int16[4]

    this.sideNum = [ int16[5], int16[6] ]
  }
}
