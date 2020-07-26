import { ANG180, ANG90, ANGLE_TO_FINE_SHIFT } from '../misc/table'
import { DrawSeg, MAX_DRAW_SEGS } from './defs/draw-seg'
import { BBox } from '../misc/bbox'
import { ClipRange } from './bsp/clip-range'
import { Draw } from './draw'
import { Line } from './defs/line'
import { NF_SUBSECTOR } from '../doom/data'
import { Plane } from './plane'
import { Play } from '../play/setup'
import { RANGE_CHECK } from '../global/doomdef'
import { Rendering } from './rendering'
import { Sector } from './defs/sector'
import { Seg } from './segs/seg'
import { Segs } from './segs'
import { Side } from './defs/side'
import { Sky } from './sky'
import { Things } from './things'


export const MAX_SEGS = 32

const checkCoord: (Extract<keyof BBox, 'top' | 'bottom' | 'left' | 'right'>)[][] = [
  [ 'right', 'top', 'left', 'bottom' ],
  [ 'right', 'top', 'left', 'top' ],
  [ 'right', 'bottom', 'left', 'top' ],
  [ 'top', 'top', 'top', 'top' ],
  [ 'left', 'top', 'left', 'bottom' ],
  [ 'top', 'top', 'top', 'top' ],
  [ 'right', 'bottom', 'right', 'top' ],
  [ 'top', 'top', 'top', 'top' ],
  [ 'left', 'top', 'right', 'bottom' ],
  [ 'left', 'bottom', 'right', 'bottom' ],
  [ 'left', 'bottom', 'right', 'top' ],
]


export class BSP {


  curLine: Seg | null = null
  sideDef: Side | null = null
  lineDef: Line | null = null
  frontSector: Sector | null = null
  backSector: Sector | null = null

  drawSegs = Array.from({ length: MAX_DRAW_SEGS },
    () => new DrawSeg())
  dsP = -1

  // newend is one past the last valid seg
  newEndPtr = -1
  solidSegs = Array.from({ length: MAX_SEGS },
    () => <ClipRange> { first: 0, last: 0 })


  private get draw(): Draw {
    return this.rendering.draw
  }
  private get plane(): Plane {
    return this.rendering.plane
  }
  private get play(): Play {
    return this.rendering.play
  }
  private get segs(): Segs {
    return this.rendering.segsHandler
  }
  private get sky(): Sky {
    return this.rendering.sky
  }
  private get things(): Things {
    return this.rendering.things
  }

  constructor(private rendering: Rendering) { }

  //
  // R_ClearDrawSegs
  //
  clearDrawSegs(): void {
    this.dsP = 0
  }

  //
  // R_ClipSolidWallSegment
  // Does handle solid walls,
  //  e.g. single sided LineDefs (middle texture)
  //  that entirely block the view.
  //
  private clipSolidWallSegment(first: number, last: number): void {

    // Find the first range that touches the range
    //  (adjacent pixels are touching).
    let startPtr = 0
    let start = this.solidSegs[startPtr]
    while (start.last < first - 1) {
      startPtr++
      start = this.solidSegs[startPtr]
    }

    let nextPtr: number
    let next: ClipRange

    if (first < start.first) {
      if (last < start.first - 1) {
        // Post is entirely visible (above start).
        //  so insert a new clippost.
        this.segs.storeWallRange(first, last)
        nextPtr = this.newEndPtr
        next = this.solidSegs[nextPtr]
        this.newEndPtr++

        while (nextPtr !== startPtr) {
          this.solidSegs[nextPtr] = { ...this.solidSegs[nextPtr - 1] }
          nextPtr--
          next = this.solidSegs[nextPtr]
        }
        next.first = first
        next.last = last
        return
      }
      // There is a fragment above *start.
      this.segs.storeWallRange(first, start.first - 1)
      // Now adjust the clip size.
      start.first = first
    }

    // Bottom contained in start?
    if (last <= start.last) {
      return
    }

    nextPtr = startPtr
    next = start
    while (last >= this.solidSegs[nextPtr + 1].first - 1) {
      // There is a fragment between two posts.
      this.segs.storeWallRange(next.last + 1, this.solidSegs[nextPtr + 1].first - 1)
      nextPtr++
      next = this.solidSegs[nextPtr]

      if (last <= next.last) {
        // Bottom is contained in next.
        // Adjust the clip size.
        start.last = next.last
        return this.gotoCrunch(nextPtr, startPtr)
      }
    }

    // There is a fragment after *next.
    this.segs.storeWallRange(next.last + 1, last)
    // Adjust the clip size.
    start.last = last

    // Remove start+1 to next from the clip list,
    // because start now covers their area.
    return this.gotoCrunch(nextPtr, startPtr)
  }
  private gotoCrunch(nextPtr: number, startPtr: number): void {
    if (nextPtr === startPtr) {
      // Post just extended past the bottom of one post.
      return
    }

    while (nextPtr++ !== this.newEndPtr) {
      // Remove a post.
      this.solidSegs[++startPtr] = { ...this.solidSegs[nextPtr] }
    }

    this.newEndPtr = startPtr + 1
  }

  //
  // R_ClipPassWallSegment
  // Clips the given range of columns,
  //  but does not includes it in the clip list.
  // Does handle windows,
  //  e.g. LineDefs with upper and lower texture.
  //
  private clipPassWallSegment(first: number, last: number): void {
    // Find the first range that touches the range
    //  (adjacent pixels are touching).
    let startPtr = 0
    let start = this.solidSegs[startPtr]
    while (start.last < first - 1) {
      startPtr++
      start = this.solidSegs[startPtr]
    }

    if (first < start.first) {
      if (last < start.first - 1) {
        // Post is entirely visible (above start).
        this.segs.storeWallRange(first, last)
        return
      }

      // There is a fragment above *start.
      this.segs.storeWallRange(first, start.first - 1)
    }

    // Bottom contained in start?
    if (last <= start.last) {
      return
    }

    while (last >= this.solidSegs[startPtr + 1].first - 1) {
      // There is a fragment between two posts.
      this.segs.storeWallRange(
        start.last + 1,
        this.solidSegs[startPtr + 1].first - 1,
      )
      startPtr++
      start = this.solidSegs[startPtr]

      if (last <= start.last) {
        return
      }
    }

    // There is a fragment after *next.
    this.segs.storeWallRange(start.last + 1, last)
  }

  //
  // R_ClearClipSegs
  //
  clearClipSegs(): void {
    this.solidSegs[0].first = -0x7fffffff
    this.solidSegs[0].last = -1
    this.solidSegs[1].first = this.draw.viewWidth
    this.solidSegs[1].last = 0x7fffffff
    this.newEndPtr = 2
  }

  //
  // R_AddLine
  // Clips the given segment
  // and adds any visible pieces to the line list.
  //
  private addLine(line: Seg): void {
    this.curLine = line

    // OPTIMIZE: quickly reject orthogonal back sides.
    let angle1 = this.rendering.pointToAngle(line.v1.x, line.v1.y)
    let angle2 = this.rendering.pointToAngle(line.v2.x, line.v2.y)

    // Clip to view edges.
    // OPTIMIZE: make constant out of 2*clipangle (FIELDOFVIEW).
    const span = angle1 - angle2 >>> 0

    // Back side? I.e. backface culling?
    if (span >= ANG180) {
      return
    }

    // Global angle needed by segcalc.
    this.segs.rwAngle1 = angle1 >> 0
    angle1 = angle1 - this.rendering.viewAngle >>> 0
    angle2 = angle2 - this.rendering.viewAngle >>> 0

    let tSpan = angle1 + this.rendering.clipAngle >>> 0
    if (tSpan > 2 * this.rendering.clipAngle) {
      tSpan = tSpan - 2 * this.rendering.clipAngle >>> 0

      // Totally off the left edge?
      if (tSpan >= span) {
        return
      }

      angle1 = this.rendering.clipAngle
    }
    tSpan = this.rendering.clipAngle - angle2 >>> 0
    if (tSpan > 2 * this.rendering.clipAngle) {
      tSpan = tSpan - 2 * this.rendering.clipAngle >>> 0

      // Totally off the left edge?
      if (tSpan >= span) {
        return
      }

      angle2 = -this.rendering.clipAngle >>> 0
    }

    // The seg is in the view range,
    // but not necessarily visible.
    angle1 = angle1 + ANG90 >> ANGLE_TO_FINE_SHIFT
    angle2 = angle2 + ANG90 >> ANGLE_TO_FINE_SHIFT
    const x1 = this.rendering.viewAngleToX[angle1]
    const x2 = this.rendering.viewAngleToX[angle2]

    // Does not cross a pixel?
    if (x1 === x2) {
      return
    }

    this.backSector = line.backSector

    // Single sided line?
    if (!this.backSector) {
      this.clipSolidWallSegment(x1, x2 - 1)
      return
    }
    if (this.frontSector === null) {
      throw 'this.frontSector = null'
    }

    // Closed door.
    if (this.backSector.ceilingHeight <= this.frontSector.floorHeight ||
      this.backSector.floorHeight >= this.frontSector.ceilingHeight) {
      this.clipSolidWallSegment(x1, x2 - 1)
      return
    }

    // Window.
    if (this.backSector.ceilingHeight !== this.frontSector.ceilingHeight ||
      this.backSector.floorHeight !== this.frontSector.floorHeight) {
      this.clipPassWallSegment(x1, x2 - 1)
      return
    }

    // Reject empty lines used for triggers
    //  and special events.
    // Identical floor and ceiling on both sides,
    // identical light levels on both sides,
    // and no middle texture.
    if (this.backSector.ceilingPic === this.frontSector.ceilingPic &&
      this.backSector.floorPic === this.frontSector.floorPic &&
      this.backSector.lightLevel === this.frontSector.lightLevel &&
      this.curLine.sideDef.midTexture === 0
    ) {
      return
    }

    this.clipPassWallSegment(x1, x2 - 1)

    return
  }

  //
  // R_CheckBBox
  // Checks BSP node/subtree bounding box.
  // Returns true
  //  if some part of the bbox might be visible.
  //
  checkBBox(bspCoord: BBox): boolean {
    let boxX: number
    let boxY: number


    // Find the corners of the box
    // that define the edges from current viewpoint.
    if (this.rendering.viewX <= bspCoord.left) {
      boxX = 0
    } else if (this.rendering.viewX < bspCoord.right) {
      boxX = 1
    } else {
      boxX = 2
    }

    if (this.rendering.viewY >= bspCoord.top) {
      boxY = 0
    } else if (this.rendering.viewY > bspCoord.bottom) {
      boxY = 1
    } else {
      boxY = 2
    }

    const boxPos = (boxY << 2) + boxX
    if (boxPos === 5) {
      return true
    }

    const x1 = bspCoord[checkCoord[boxPos][0]]
    const y1 = bspCoord[checkCoord[boxPos][1]]
    const x2 = bspCoord[checkCoord[boxPos][2]]
    const y2 = bspCoord[checkCoord[boxPos][3]]

    // check clip list for an open space
    let angle1 = this.rendering.pointToAngle(x1, y1) - this.rendering.viewAngle >>> 0
    let angle2 = this.rendering.pointToAngle(x2, y2) - this.rendering.viewAngle >>> 0

    const span = angle1 - angle2 >>> 0

    // Sitting on a line?
    if (span >= ANG180) {
      return true
    }

    let tSpan = angle1 + this.rendering.clipAngle >>> 0

    if (tSpan > 2 * this.rendering.clipAngle) {
      tSpan = tSpan - 2 * this.rendering.clipAngle >>> 0

      // Totally off the left edge?
      if (tSpan >= span) {
        return false
      }

      angle1 = this.rendering.clipAngle
    }
    tSpan = this.rendering.clipAngle - angle2 >>> 0
    if (tSpan > 2 * this.rendering.clipAngle) {
      tSpan = tSpan - 2 * this.rendering.clipAngle >>> 0

      // Totally off the left edge?
      if (tSpan >= span) {
        return false
      }

      angle2 = -this.rendering.clipAngle >>> 0
    }

    // Find the first clippost
    //  that touches the source post
    //  (adjacent pixels are touching).
    angle1 = angle1 + ANG90 >> ANGLE_TO_FINE_SHIFT
    angle2 = angle2 + ANG90 >> ANGLE_TO_FINE_SHIFT
    const sx1 = this.rendering.viewAngleToX[angle1]
    let sx2 = this.rendering.viewAngleToX[angle2]

    // Does not cross a pixel.
    if (sx1 === sx2) {
      return false
    }
    --sx2

    let startPtr = 0
    let start = this.solidSegs[startPtr]
    while (start.last < sx2) {
      startPtr++
      start = this.solidSegs[startPtr]
    }

    if (sx1 >= start.first && sx2 <= start.last) {
      // The clippost contains the new span.
      return false
    }

    return true
  }


  //
  // R_Subsector
  // Determine floor/ceiling planes.
  // Add sprites of things in sector.
  // Draw one or more line segments.
  //
  private subSector(num: number) {

    if (RANGE_CHECK) {
      if (num >= this.play.numSubSectors) {
        throw `R_Subsector: ss ${num} with numss = ${this.play.numSubSectors}`
      }
    }

    this.rendering.ssCount++
    const sub = this.play.subSectors[num]
    this.frontSector = sub.sector
    if (this.frontSector === null) {
      throw 'this.frontSector = null'
    }
    let count = sub.numLines
    let linePtr = sub.firstLine
    let line = this.play.segs[linePtr]

    if (this.frontSector.floorHeight < this.rendering.viewZ) {
      this.plane.floorPlane = this.plane.findPlane(
        this.frontSector.floorHeight,
        this.frontSector.floorPic,
        this.frontSector.lightLevel,
      )
    } else {
      this.plane.floorPlane = null
    }

    if (this.frontSector.ceilingHeight > this.rendering.viewZ ||
        this.frontSector.ceilingPic === this.sky.skyFlatNum
    ) {
      this.plane.ceilingPlane = this.plane.findPlane(
        this.frontSector.ceilingHeight,
        this.frontSector.ceilingPic,
        this.frontSector.lightLevel,
      )
    } else {
      this.plane.ceilingPlane = null
    }

    this.things.addSprites(this.frontSector)

    while (count--) {
      line = this.play.segs[linePtr]
      this.addLine(line)
      linePtr++
    }
  }

  //
  // RenderBSPNode
  // Renders all subsectors below a given node,
  //  traversing subtree recursively.
  // Just call with BSP root.
  renderBSPNode(bspNum: number): void {
    // Found a subsector?
    if (bspNum & NF_SUBSECTOR) {
      if (bspNum === -1) {
        this.subSector(0)
      } else {
        this.subSector(bspNum & ~NF_SUBSECTOR)
      }
      return
    }

    const bsp = this.play.nodes[bspNum]

    // Decide which side the view point is on.
    const side = bsp.pointOnSide(this.rendering.viewX, this.rendering.viewY)

    // Recursively divide front space.
    this.renderBSPNode(bsp.children[side])

    // Possibly divide back space.
    if (this.checkBBox(bsp.bbox[side^1])) {
      this.renderBSPNode(bsp.children[side ^ 1])
    }
  }
}
