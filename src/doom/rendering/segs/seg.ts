import { FRACBITS, mul } from '../../misc/fixed'
import { Line } from '../defs/line'
import { Sector } from '../defs/sector'
import { Side } from '../defs/side'
import { Vertex } from '../data/vertex'

//
// The LineSeg.
//
export class Seg {
  constructor(
    public v1: Vertex,
    public v2: Vertex,
    public offset: number,
    public angle: number,
    public sideDef: Side,
    public lineDef: Line,
    // Sector references.
    // Could be retrieved from linedef, too.
    // backsector is NULL for one sided lines
    public frontSector: Sector,
    public backSector: Sector | null,
  ) { }

  pointOnSegSide(x: number, y: number): 0 | 1 {
    const lX = this.v1.x
    const lY = this.v1.y

    const ldX = this.v2.x - lX
    const ldY = this.v2.y - lY

    if (!ldX) {
      if (x <= lX) {
        return ldY > 0 ? 1 : 0
      }
      return ldY < 0 ? 1 : 0
    }
    if (!ldY) {
      if (y <= lY) {
        return ldX < 0 ? 1 : 0
      }
      return ldX > 0 ? 1 : 0
    }

    const dX = x - lX
    const dY = y - lY

    // Try to quickly decide by looking at sign bits.
    if ((ldY ^ ldX ^ dX ^ dY) & 0x80000000) {
      if ((ldY ^ dX) & 0x80000000) {
        // (left is negative)
        return 1
      }
      return 0
    }

    const left = mul(ldY >> FRACBITS, dX)
    const right = mul(dY, ldX >> FRACBITS)

    if (right < left) {
      // front side
      return 0
    }
    // back side
    return 1
  }
}
