import { ANG180, ANG270, ANG90, slopeDiv, tanToAngle } from './table'

//
// R_PointToAngle
// To get a global angle from cartesian coordinates,
//  the coordinates are flipped until they are in
//  the first octant of the coordinate system, then
//  the y (<=x) is scaled and divided by x to get a
//  tangent (slope) value which is looked up in the
//  tantoangle[] table.
//
export function pointToAngle(x1: number, y1: number, x2: number, y2: number): number {
  x2 -= x1
  y2 -= y1

  if (!x2 && !y2) {
    return 0
  }

  if (x2 >= 0) {
    // x >=0
    if (y2 >= 0) {
      // y>= 0

      if (x2 > y2) {
        // octant 0
        return tanToAngle[slopeDiv(y2, x2)]
      } else {
        // octant 1
        return ANG90 - 1 - tanToAngle[slopeDiv(x2, y2)]
      }
    } else {
      // y<0
      y2 = -y2

      if (x2 > y2) {
        // octant 8
        return -tanToAngle[slopeDiv(y2, x2)]
      } else {
        // octant 7
        return ANG270 + tanToAngle[slopeDiv(x2, y2)]
      }
    }
  } else {
    // x<0
    x2 = -x2

    if (y2 >= 0) {
      // y>= 0
      if (x2 > y2) {
        // octant 3
        return ANG180 - 1 - tanToAngle[slopeDiv(y2, x2)]
      } else {
        // octant 2
        return ANG90 + tanToAngle[slopeDiv(x2, y2)]
      }
    } else {
      // y<0
      y2 = -y2

      if (x2>y2) {
        // octant 4
        return ANG180 + tanToAngle[slopeDiv(y2, x2)]
      } else {
        // octant 5
        return ANG270 - 1 - tanToAngle[slopeDiv(x2, y2)]
      }
    }
  }
}
