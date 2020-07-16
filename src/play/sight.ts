import { FRACBITS, div, mul } from '../misc/fixed'
import { MapLineFlag, NF_SUBSECTOR } from '../doom/data'
import { DivLine } from './map-utils/div-line'
import { Doom } from '../doom/doom'
import { GameVersion } from '../doom/mode'
import { Line } from '../rendering/line'
import { MObj } from './mobj/mobj'
import { MapUtils } from './map-utils'
import { Play } from './setup'
import { RANGE_CHECK } from '../global/doomdef'
import { Rendering } from '../rendering/rendering'
import { Sector } from '../rendering/sector'
import { Vertex } from '../rendering/vertex'

export class Sight {
  //
  // P_CheckSight
  //
  // eye z of looker
  private sightZStart = 0
  topSlope = 0
  // slopes to top and bottom of target
  bottomSlope = 0

  // from t1 to t2
  private sTrace = new DivLine()
  private t2x = 0
  private t2y = 0

  private sightCounts = [ 0, 0 ]

  private get doom(): Doom {
    return this.play.doom
  }
  private get mapUtils(): MapUtils {
    return this.play.mapUtils
  }
  private get rendering(): Rendering {
    return this.play.rendering
  }

  constructor(private play: Play) { }

  //
  // P_DivlineSide
  // Returns side 0 (front), 1 (back), or 2 (on).
  //
  private divLineSide(x: number, y: number, node: DivLine): 0 | 1 | 2 {
    if (!node.dX) {
      if (x === node.x) {
        return 2
      }

      if (x <= node.x) {
        return node.dY > 0 ? 1 : 0
      }

      return node.dY < 0 ? 1 : 0
    }

    if (!node.dY) {
      if (x === node.y) {
        return 2
      }

      if (y <= node.y) {
        return node.dX < 0 ? 1 : 0
      }

      return node.dX > 0 ? 1 : 0
    }

    const dx = x - node.x
    const dy = y - node.y

    const left = (node.dY >> FRACBITS) * (dx >> FRACBITS)
    const right = (dy >> FRACBITS) * (node.dX >> FRACBITS)

    if (right < left) {
      // front side
      return 0
    }

    if (left === right) {
      return 2
    }
    // back side
    return 1
  }

  //
  // P_InterceptVector2
  // Returns the fractional intercept point
  // along the first divline.
  // This is only called by the addthings and addlines traversers.
  //
  private interceptVector(v2: DivLine, v1: DivLine): number {
    const den = mul(v1.dY >> 8, v2.dX) - mul(v1.dX >> 8, v2.dY)

    if (den === 0) {
      return 0
    }

    const num = mul(v1.x - v2.x >> 8 , v1.dY) +
        mul(v2.y - v1.y>> 8 , v1.dX)

    return div(num, den)
  }

  //
  // P_CrossSubsector
  // Returns true
  //  if strace crosses the given subsector successfully.
  //
  private crossSubSector(num: number) {
    if (RANGE_CHECK) {
      if (num >= this.play.numSubSectors) {
        throw `P_CrossSubsector: ss ${num} with numss = ${this.play.numSubSectors}`
      }
    }

    const sub = this.play.subSectors[num]

    // check lines
    let segPtr = sub.firstLine
    let seg = this.play.segs[segPtr]
    let line: Line
    let s1: 0 | 1 | 2
    let s2: 0 | 1 | 2
    let count = sub.numLines
    let front: Sector
    let back: Sector | null
    let openTop: number
    let openBottom: number
    const divLine = new DivLine()
    let v1: Vertex
    let v2: Vertex
    let frac: number
    let slope: number
    for (; count;
      segPtr++, count--, seg = this.play.segs[segPtr]
    ) {
      line = seg.lineDef

      // allready checked other side?
      if (line.validCount === this.rendering.validCount) {
        continue
      }

      line.validCount = this.rendering.validCount

      v1 = line.v1
      v2 = line.v2

      s1 = this.divLineSide(v1.x, v1.y, this.sTrace)
      s2 = this.divLineSide(v2.x, v2.y, this.sTrace)

      // line isn't crossed?
      if (s1 === s2) {
        continue
      }

      divLine.x = v1.x
      divLine.y = v1.y
      divLine.dX = v2.x - v1.x
      divLine.dY = v2.y - v1.y
      s1 = this.divLineSide(this.sTrace.x, this.sTrace.y, divLine)
      s2 = this.divLineSide(this.t2x, this.t2y, divLine)

      // line isn't crossed?
      if (s1 === s2) {
        continue
      }

      // stop because it is not two sided anyway
      // might do this after updating validcount?
      if (!(line.flags & MapLineFlag.TwoSided)) {
        return false
      }

      // crosses a two sided line
      front = seg.frontSector
      back = seg.backSector

      if (back === null) {
        throw 'back = null'
      }

      // no wall to block sight with?
      if (front.floorHeight === back.floorHeight &&
        front.ceilingHeight === back.ceilingHeight
      ) {
        continue
      }

      // possible occluder
      // because of ceiling height differences
      if (front.ceilingHeight < back.ceilingHeight) {
        openTop = front.ceilingHeight
      } else {
        openTop = back.ceilingHeight
      }

      // because of ceiling height differences
      if (front.floorHeight > back.floorHeight) {
        openBottom = front.floorHeight
      } else {
        openBottom = back.floorHeight
      }

      // quick test for totally closed doors
      if (openBottom >= openTop) {
        // stop
        return false
      }

      frac = this.interceptVector(this.sTrace, divLine)

      if (front.floorHeight !== back.floorHeight) {
        slope = div(openBottom - this.sightZStart, frac)
        if (slope > this.bottomSlope) {
          this.bottomSlope = slope
        }
      }

      if (front.ceilingHeight !== back.ceilingHeight) {
        slope = div(openTop - this.sightZStart, frac)
        if (slope < this.topSlope) {
          this.topSlope = slope
        }
      }

      if (this.topSlope <= this.bottomSlope) {
        // stop
        return false
      }
    }

    // passed the subsector ok
    return true
  }

  //
  // P_CrossBSPNode
  // Returns true
  //  if strace crosses the given node successfully.
  //
  private crossBSPNode(bspNum: number): boolean {
    if (bspNum & NF_SUBSECTOR) {
      if (bspNum === -1) {
        return this.crossSubSector(0)
      } else {
        return this.crossSubSector(bspNum & ~NF_SUBSECTOR)
      }
    }

    const bsp = this.play.nodes[bspNum]

    // decide which side the start point is on
    let side = this.divLineSide(this.sTrace.x, this.sTrace.y, bsp)
    if (side === 2) {
      // an "on" should cross both sides
      side = 0
    }

    // cross the starting side
    if (!this.crossBSPNode(bsp.children[side])) {
      return false
    }

    // the partition plane is crossed here
    if (side === this.divLineSide(this.t2x, this.t2y, bsp)) {
      // the line doesn't touch the other side
      return true
    }

    // cross the ending side
    return this.crossBSPNode(bsp.children[side ^ 1])
  }

  //
  // P_CheckSight
  // Returns true
  //  if a straight line between t1 and t2 is unobstructed.
  // Uses REJECT.
  //
  checkSight(t1: MObj, t2: MObj): boolean {
    if (t1.subSector === null) {
      throw 't1.subSector = null'
    }
    if (t1.subSector.sector === null) {
      throw 't1.subSector.sector = null'
    }
    if (t2.subSector === null) {
      throw 't2.subSector = null'
    }
    if (t2.subSector.sector === null) {
      throw 't2.subSector.sector = null'
    }

    // First check for trivial rejection.

    // Determine subsector entries in REJECT table.
    const s1 = this.play.sectors.indexOf(t1.subSector.sector)
    const s2 = this.play.sectors.indexOf(t2.subSector.sector)
    const pNum = s1 * this.play.numSectors + s2
    const byteNum = pNum >> 3
    const bitNum = 1 << (pNum & 7)

    // Check in REJECT table.
    if (this.play.rejectMatrix[byteNum] & bitNum) {
      this.sightCounts[0]++

      // can't possibly be connected
      return false
    }

    // An unobstructed LOS is possible.
    // Now look from eyes of t1 to any part of t2.
    this.sightCounts[1]++

    this.rendering.validCount++

    this.sightZStart = t1.z + t1.height - (t1.height >> 2)
    this.topSlope = t2.z + t2.height - this.sightZStart
    this.bottomSlope = t2.z - this.sightZStart

    if (this.doom.gameVersion <= GameVersion.Doom12) {
      debugger
      // return this.mapUtils.pathTraverse(t1.x, t1.y, t2.x, t2.y,
      //   PT_EARLY_OUT | PT_ADD_LINES, this.sightTraverse, this)
    }

    this.sTrace.x = t1.x
    this.sTrace.y = t1.y
    this.t2x = t2.x
    this.t2y = t2.y
    this.sTrace.dX = t2.x - t1.x
    this.sTrace.dY = t2.y - t1.y

    // the head node is the last node output
    return this.crossBSPNode(this.play.numNodes - 1)
  }
}
