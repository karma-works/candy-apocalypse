import { BBox } from '../../misc/bbox'
import { Sector } from './sector'
import { SlopeType } from './slope-type'
import { Vertex } from '../data/vertex'
import { div } from '../../misc/fixed'
export class Line {
  static sizeOf = 6

  // Precalculated v2 - v1 for side checking.
  dX: number
  dY: number

  // Visual appearance: SideDefs.
  //  sidenum[1] will be -1 if one sided
  sideNum: [number, number] = [ 0, 0 ]
  // Neat. Another bounding box, for the extent
  //  of the LineDef.
  bbox = new BBox()
  // To aid move clipping.
  slopeType: SlopeType;
  // Front and back sector.
  // Note: redundant? Can be retrieved from SideDefs.
  frontSector: Sector | null = null
  backSector: Sector | null = null
  // if == validcount, already checked
  validCount = 0
  // thinker_t for reversable actions
  specialData = null

  constructor(
    // Vertices, from v1 to v2.
    public v1: Vertex = new Vertex(),
    public v2: Vertex = new Vertex(),

    // Animation related.
    public flags: number = 0,
    public special: number = 0,
    public tag: number = 0,
  ) {
    this.dX = v2.x - v1.x
    this.dY = v2.y - v1.y

    if (!this.dX) {
      this.slopeType = SlopeType.Vertical
    } else if (!this.dY) {
      this.slopeType = SlopeType.Horizontal
    } else {
      if (div(this.dY, this.dX) > 0) {
        this.slopeType = SlopeType.Positive
      } else {
        this.slopeType = SlopeType.Negative
      }
    }

    if (v1.x < v2.x) {
      this.bbox.left = v1.x
      this.bbox.right = v2.x
    } else {
      this.bbox.left = v2.x
      this.bbox.right = v1.x
    }

    if (v1.y < v2.y) {
      this.bbox.bottom = v1.y
      this.bbox.top = v2.y
    } else {
      this.bbox.bottom = v2.y
      this.bbox.top = v1.y
    }
  }

  unArchive(buffer: ArrayBuffer): void {
    const int16 = new Int16Array(buffer)
    let int16Ptr = 0
    this.flags = int16[int16Ptr++]
    this.special = int16[int16Ptr++]
    this.tag = int16[int16Ptr++]
  }

  archive(): ArrayBuffer {
    return new Int16Array([
      this.flags,
      this.special,
      this.tag,
    ]).buffer
  }
}
