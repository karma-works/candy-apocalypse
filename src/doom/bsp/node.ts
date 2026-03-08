import { FRACBITS, mul } from '../../misc/fixed'
import { BBox } from '../../misc/bbox'

//
// BSP node.
//
export class Node {
  // Partition line.
  x: number;
  y: number;
  dX: number;
  dY: number;
  // Bounding box for each child.
  bbox: [ BBox, BBox ]
  // If NF_SUBSECTOR its a subsector.
  children: [ number, number ];

  constructor(
    x: number,
    y: number,
    dX: number,
    dY: number,
    children: number[],
    bbox: number[][],
  ) {
    this.x = x
    this.y = y
    this.dX = dX
    this.dY = dY

    this.bbox = [ new BBox(), new BBox() ]
    this.children = [ 0, 0 ]

    for (let j = 0; j < 2; ++j) {
      this.children[j] = children[j]
      this.bbox[j].top = bbox[j][0] << FRACBITS
      this.bbox[j].bottom = bbox[j][1] << FRACBITS
      this.bbox[j].left = bbox[j][2] << FRACBITS
      this.bbox[j].right = bbox[j][3] << FRACBITS
    }
  }

  //
  // R_PointOnSide
  // Traverse BSP (sub) tree,
  //  check point against partition plane.
  // Returns side 0 (front) or 1 (back).
  //
  pointOnSide(x: number, y: number): 0 | 1 {
    if (!this.dX) {
      if (x <= this.x) {
        return this.dY > 0 ? 1 : 0
      }
      return this.dY < 0 ? 1 : 0
    }
    if (!this.dY) {
      if (y <= this.y) {
        return this.dX < 0 ? 1 : 0
      }
      return this.dX > 0 ? 1 : 0
    }

    const dX = x - this.x
    const dY = y - this.y
    // Try to quickly decide by looking at sign bits.
    if ((this.dY ^ this.dX ^ dX ^ dY) & 0x80000000) {
      if ((this.dY ^ dX) & 0x80000000) {
        // (left is negative)
        return 1
      }
      return 0
    }

    const left = mul(this.dY >> FRACBITS, dX)
    const right = mul(dY, this.dX >> FRACBITS)

    if (right < left) {
      // front side
      return 0
    }
    // back side
    return 1
  }

}
