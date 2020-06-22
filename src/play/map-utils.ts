import { FRACBITS, FRACUNIT, div, mul } from '../misc/fixed'
import { MAP_BLOCK_SHIFT, MAP_BLOCK_SIZE, MAP_B_TO_FRAC, MAX_INTERCEPTS, PT_ADD_LINES, PT_ADD_THINGS, PT_EARLY_OUT } from './local'
import { MObj, MObjFlag } from './mobj'
import { BBox } from '../misc/bbox'
import { DivLine } from './map-utils/div-line'
import { Intercept } from './map-utils/intercept'
import { Line } from '../rendering/line'
import { Play } from './setup'
import { Rendering } from '../rendering/rendering'
import { SlopeType } from '../rendering/slope-type'

export class MapUtils {
  private get rendering(): Rendering {
    return this.play.rendering
  }
  constructor(private play: Play) {}

  //
  // P_AproxDistance
  // Gives an estimation of distance (not exact)
  //
  aproxDistance(dx: number, dy: number): number {
    dx = Math.abs(dx)
    dy = Math.abs(dy)
    if (dx < dy) {
      return dx + dy - (dx >> 1)
    }
    return dx + dy - (dy >> 1)
  }

  //
  // P_PointOnLineSide
  // Returns 0 or 1
  //
  pointOnLineSide(x: number, y: number, line: Line): 0 | 1 {
    if (!line.dX) {
      if (x <= line.v1.x) {
        return line.dY > 0 ? 1 : 0
      }
      return line.dY < 0 ? 1 : 0
    }
    if (!line.dY) {
      if (y <= line.v1.y) {
        return line.dX < 0 ? 1 : 0
      }
      return line.dX > 0 ? 1 : 0
    }

    const dX = x - line.v1.x
    const dY = y - line.v1.y

    const left = mul(line.dY >> FRACBITS, dX)
    const right = mul(dY, line.dX >> FRACBITS)

    if (right < left) {
      // front side
      return 0
    }
    // back side
    return 1
  }

  //
  // P_BoxOnLineSide
  // Considers the line to be infinite
  // Returns side 0 or 1, -1 if box crosses the line.
  //
  boxOnLineSide(tmBox: BBox, ld: Line): number {
    let p1: number
    let p2: number
    switch (ld.slopeType) {
    case SlopeType.Horizontal:
      p1 = tmBox.top > ld.v1.y ? 1 : 0
      p2 = tmBox.bottom > ld.v1.y ? 1 : 0
      if (ld.dX < 0) {
        p1 ^= 1
        p2 ^= 1
      }
      break
    case SlopeType.Vertical:
      p1 = tmBox.right < ld.v1.x ? 1 : 0
      p2 = tmBox.left < ld.v1.x ? 1 : 0
      if (ld.dY < 0) {
        p1 ^= 1
        p2 ^= 1
      }
      break
    case SlopeType.Positive:
      p1 = this.pointOnLineSide(tmBox.left, tmBox.top, ld)
      p2 = this.pointOnLineSide(tmBox.right, tmBox.bottom, ld)
      break
    case SlopeType.Negative:
      p1 = this.pointOnLineSide(tmBox.right, tmBox.top, ld)
      p2 = this.pointOnLineSide(tmBox.left, tmBox.bottom, ld)
      break
    }

    if (p1 === p2) {
      return p1
    }
    return -1
  }

  //
  // P_PointOnDivlineSide
  // Returns 0 or 1.
  //
  private pointOnDivLineSide(x: number, y: number, line: DivLine): 0 | 1 {
    if (!line.dX) {
      if (x <= line.x) {
        return line.dY > 0 ? 1 : 0
      }
      return line.dY < 0 ? 1 : 0
    }
    if (!line.dY) {
      if (y <= line.y) {
        return line.dX < 0 ? 1 : 0
      }
      return line.dX > 0 ? 1 : 0
    }

    const dX = x - line.x
    const dY = y - line.y

    // Try to quickly decide by looking at sign bits.
    if ((line.dY ^ line.dX ^ dX ^ dY) & 0x80000000) {
      if ((line.dY ^ dX) & 0x80000000) {
        // (left is negative)
        return 1
      }
      return 0
    }

    const left = mul(line.dY >> 8, dX >> 8)
    const right = mul(dY >> 8, line.dX >> 8)

    if (right < left) {
      // front side
      return 0
    }
    // back side
    return 1
  }

  //
  // P_MakeDivline
  //
  private makeDivLine(li: Line, dl: DivLine): void {
    dl.x = li.v1.x
    dl.y = li.v1.y
    dl.dX = li.dX
    dl.dY = li.dY
  }

  //
  // P_InterceptVector
  // Returns the fractional intercept point
  // along the first divline.
  // This is only called by the addthings
  // and addlines traversers.
  //
  private interceptVector(v2: DivLine, v1: DivLine): number {
    const den = mul(v1.dY >> 8, v2.dX) - mul(v1.dX >> 8, v2.dY)

    if (den === 0) {
      return 0
    }

    const num = mul(v1.x - v2.x >> 8, v1.dY) + mul(v2.y - v1.y >> 8, v1.dX)

    return div(num, den)
  }

  //
  // P_LineOpening
  // Sets opentop and openbottom to the window
  // through a two sided line.
  // OPTIMIZE: keep this precalculated
  //
  openTop = 0
  openBottom = 0
  openRange = 0
  lowFloor = 0

  lineOpening(lineDef: Line): void {
    if (lineDef.sideNum[1] === -1) {
      // single sided line
      this.openRange = 0
      return
    }

    const front = lineDef.frontSector
    const back = lineDef.backSector
    if (front === null) {
      throw 'front = null'
    }
    if (back === null) {
      throw 'back = null'
    }

    if (front.ceilingHeight < back.ceilingHeight) {
      this.openTop = front.ceilingHeight
    } else {
      this.openTop = back.ceilingHeight
    }

    if (front.floorHeight > back.floorHeight) {
      this.openBottom = front.floorHeight
      this.lowFloor = back.floorHeight
    } else {
      this.openBottom = back.floorHeight
      this.lowFloor = front.floorHeight
    }

    this.openRange = this.openTop - this.openBottom
  }


  //
  // THING POSITION SETTING
  //


  //
  // P_UnsetThingPosition
  // Unlinks a thing from block map and sectors.
  // On each position change, BLOCKMAP and other
  // lookups maintaining lists ot things inside
  // these structures need to be updated.
  //
  unsetThingPosition(thing: MObj): void {

    if (!(thing.flags & MObjFlag.NoSector)) {
      // inert things don't need to be in blockmap?
      // unlink from subsector
      if (thing.sNext) {
        thing.sNext.sPrev = thing.sPrev
      }

      if (thing.sPrev) {
        thing.sPrev.sNext = thing.sNext
      } else {
        if (thing.subSector === null) {
          throw 'thing.subSector = null'
        }
        if (thing.subSector.sector === null) {
          throw 'thing.subSector.sector = null'
        }
        thing.subSector.sector.thingList = thing.sNext
      }
    }

    if (!(thing.flags & MObjFlag.NoBlockMap)) {
      // inert things don't need to be in blockmap
      // unlink from block map
      if (thing.bNext) {
        thing.bNext.bPrev = thing.bPrev
      }

      if (thing.bPrev) {
        thing.bPrev.bNext = thing.bNext
      } else {
        const blockX = thing.x - this.play.bMapOrgX >> MAP_BLOCK_SHIFT
        const blockY = thing.y - this.play.bMapOrgY >> MAP_BLOCK_SHIFT

        if (blockX >= 0 && blockX < this.play.bMapWidth &&
          blockY >= 0 && blockY <this.play.bMapHeight
        ) {
          if (thing.bNext === null) {
            throw 'thing.bNext = null'
          }

          this.play.blockLinks[blockY * this.play.bMapWidth + blockX] = thing.bNext
        }
      }
    }
  }

  //
  // P_SetThingPosition
  // Links a thing into both a block and a subsector
  // based on it's x y.
  // Sets thing->subsector properly
  //
  setThingPosition(thing: MObj): void {
    // link into subsector
    const ss = this.rendering.pointInSubSector(thing.x, thing.y)
    thing.subSector = ss

    if (!(thing.flags & MObjFlag.NoSector)) {
      // invisible things don't go into the sector links
      const sec = ss.sector
      if (sec === null) {
        throw 'ss.sector = null'
      }

      thing.sPrev = null
      thing.sNext = sec.thingList

      if (sec.thingList) {
        sec.thingList.sPrev = thing
      }
      sec.thingList = thing
    }

    // link into blockmap
    if (!(thing.flags & MObjFlag.NoBlockMap)) {
      // inert things don't need to be in blockmap
      const blockX = thing.x - this.play.bMapOrgX >> MAP_BLOCK_SHIFT
      const blockY = thing.y - this.play.bMapOrgY >> MAP_BLOCK_SHIFT

      if (blockX >= 0 &&
          blockX < this.play.bMapWidth &&
          blockY >= 0 &&
          blockY < this.play.bMapHeight
      ) {
        const blockIdx = blockY * this.play.bMapWidth + blockX
        const link = this.play.blockLinks[blockIdx]
        thing.bPrev = null
        thing.bNext = link
        if (link) {
          link.bPrev = thing
        }
        this.play.blockLinks[blockIdx] = thing
      } else {
        // thing is off the map
        thing.bNext = thing.bPrev = null
      }
    }
  }


  //
  // BLOCK MAP ITERATORS
  // For each line/thing in the given mapblock,
  // call the passed PIT_* function.
  // If the function returns false,
  // exit with false without checking anything else.
  //


  //
  // P_BlockLinesIterator
  // The validcount flags are used to avoid checking lines
  // that are marked in multiple mapblocks,
  // so increment validcount before the first call
  // to P_BlockLinesIterator, then make one or more calls
  // to it.
  //
  blockLinesIterator<T>(
    x: number, y: number, func: (this: T, v: Line) => boolean, thisArg: T,
  ): boolean {
    if (x < 0 ||
      y < 0 ||
      x >= this.play.bMapWidth ||
      y >= this.play.bMapHeight
    ) {
      return true
    }

    let offset = y * this.play.bMapWidth + x

    offset = this.play.blockMap[offset]

    let ld: Line
    for (let list = this.play.blockMapLump[offset];
      list !== -1;
      offset++, list = this.play.blockMapLump[offset]
    ) {
      ld = this.play.lines[list]

      if (ld.validCount === this.rendering.validCount) {
        // line has already been checked
        continue
      }

      ld.validCount = this.rendering.validCount

      if (!func.call(thisArg, ld)) {
        return false
      }
    }

    // everything was checked
    return true
  }

  //
  // P_BlockThingsIterator
  //
  blockThingsIterator<T>(
    x: number, y: number, func: (this: T, v: MObj) => boolean, thisArg: T,
  ): boolean {
    if (x < 0 ||
      y < 0 ||
      x >= this.play.bMapWidth ||
      y >= this.play.bMapHeight
    ) {
      return true
    }

    let mObj: MObj | null
    for (mObj = this.play.blockLinks[y * this.play.bMapWidth + x];
      mObj;
      mObj = mObj.bNext
    ) {
      if (!func.call(thisArg, mObj)) {
        return false
      }

    }

    return true
  }

  //
  // INTERCEPT ROUTINES
  //
  private intercepts = Array.from({ length: MAX_INTERCEPTS },
    () => <Intercept> { frac: 0, isALine: false, d: null })
  private interceptPtr = 0

  private trace = new DivLine()
  private earlyOut = false

  //
  // PIT_AddLineIntercepts.
  // Looks for lines in the given block
  // that intercept the given trace
  // to add to the intercepts list.
  //
  // A line is crossed if its endpoints
  // are on opposite sides of the trace.
  // Returns true if earlyout and a solid line hit.
  //
  private addLineIntercepts(ld: Line): boolean {
    let s1: 0 | 1
    let s2: 0 | 1
    // avoid precision problems with two routines
    if (this.trace.dX > FRACUNIT * 16 ||
      this.trace.dY > FRACUNIT * 16 ||
      this.trace.dX < -FRACUNIT * 16 ||
      this.trace.dY < -FRACUNIT * 16
    ) {
      s1 = this.pointOnDivLineSide(ld.v1.x, ld.v1.y, this.trace)
      s2 = this.pointOnDivLineSide(ld.v2.x, ld.v2.y, this.trace)
    } else {
      s1 = this.pointOnLineSide(this.trace.x, this.trace.y, ld)
      s2 = this.pointOnLineSide(this.trace.x + this.trace.dX,
        this.trace.y + this.trace.dY, ld)
    }

    if (s1 === s2) {
      // line isn't crossed
      return true
    }

    // hit the line
    const dl = new DivLine
    this.makeDivLine(ld, dl)
    const frac = this.interceptVector(this.trace, dl)

    if (frac < 0) {
      // behind source
      return true
    }

    // try to early out the check
    if (this.earlyOut &&
      frac < FRACUNIT &&
      !ld.backSector
    ) {
      // stop checking
      return false
    }

    this.intercepts[this.interceptPtr].frac = frac
    this.intercepts[this.interceptPtr].isALine = true
    this.intercepts[this.interceptPtr].d = ld
    this.interceptPtr++

    // continue
    return true
  }

  //
  // PIT_AddThingIntercepts
  //
  private addThingIntercepts(thing: MObj): boolean {
    const tracePositive = (this.trace.dX ^ this.trace.dY) > 0

    let x1: number
    let y1: number
    let x2: number
    let y2: number
    // check a corner to corner crossection for hit
    if (tracePositive) {
      x1 = thing.x - thing.radius
      y1 = thing.y + thing.radius

      x2 = thing.x + thing.radius
      y2 = thing.y - thing.radius
    } else {
      x1 = thing.x - thing.radius
      y1 = thing.y - thing.radius

      x2 = thing.x + thing.radius
      y2 = thing.y + thing.radius
    }

    const s1 = this.pointOnDivLineSide(x1, y1, this.trace)
    const s2 = this.pointOnDivLineSide(x2, y2, this.trace)

    if (s1 === s2) {
      // line isn't crossed
      return true
    }

    const dl = new DivLine
    dl.x = x1
    dl.x = y1
    dl.dX = x2 - x1
    dl.dY = y2 - y1

    const frac = this.interceptVector(this.trace, dl)

    if (frac < 0) {
      // behind source
      return true
    }

    this.intercepts[this.interceptPtr].frac = frac
    this.intercepts[this.interceptPtr].isALine = false
    this.intercepts[this.interceptPtr].d = thing
    this.interceptPtr++

    // keep going
    return true
  }

  //
  // P_TraverseIntercepts
  // Returns true if the traverser function returns true
  // for all lines.
  //
  private traverseIntercepts<T>(
    func: (this: T, v: Intercept) => boolean, thisArg: T, maxFrac: number,
  ): boolean {
    let count = this.interceptPtr

    let dist: number
    let inter: Intercept | null = null
    let scan: Intercept
    let scanPtr: number
    while (count--) {
      dist = 0x7fffffff

      for (scanPtr = 0, scan = this.intercepts[scanPtr];
        scanPtr < this.interceptPtr;
        ++scanPtr, scan = this.intercepts[scanPtr]
      ) {
        if (scan.frac < dist) {
          dist = scan.frac
          inter = scan
        }
      }

      if (dist > maxFrac) {
        // checked everything in range
        return true
      }

      if (inter === null) {
        throw 'inter = null'
      }

      if (!func.call(thisArg, inter)) {
        // don't bother going farther
        return false
      }

      inter.frac = 0x7fffffff
    }

    // everything was traversed
    return true
  }

  //
  // P_PathTraverse
  // Traces a line from x1,y1 to x2,y2,
  // calling the traverser function for each.
  // Returns true if the traverser function returns true
  // for all lines.
  //
  pathTraverse<T>(
    x1: number, y1: number, x2: number, y2: number, flags: number,
    trav: (this: T, v: Intercept) => boolean, thisArg: T,
  ): boolean {

    this.earlyOut = !!(flags & PT_EARLY_OUT)

    this.rendering.validCount++
    this.interceptPtr = 0

    if ((x1 - this.play.bMapOrgX & MAP_BLOCK_SIZE - 1) === 0) {
      // don't side exactly on a line
      x1 += FRACUNIT
    }

    if ((y1 - this.play.bMapOrgY & MAP_BLOCK_SIZE - 1) === 0) {
      // don't side exactly on a line
      y1 += FRACUNIT
    }

    this.trace.x = x1
    this.trace.y = y1
    this.trace.dX = x2 - x1
    this.trace.dY = y2 - y1

    x1 -= this.play.bMapOrgX
    y1 -= this.play.bMapOrgY
    const xt1 = x1>>MAP_BLOCK_SHIFT
    const yt1 = y1>>MAP_BLOCK_SHIFT

    x2 -= this.play.bMapOrgX
    y2 -= this.play.bMapOrgY
    const xt2 = x2>>MAP_BLOCK_SHIFT
    const yt2 = y2>>MAP_BLOCK_SHIFT

    let xStep: number
    let yStep: number
    let partial: number
    let mapXStep: number
    let mapYStep: number
    if (xt2 > xt1) {
      mapXStep = 1
      partial = FRACUNIT - (x1 >> MAP_B_TO_FRAC & FRACUNIT - 1)
      yStep = div(y2 - y1, Math.abs(x2 - x1))
    } else if (xt2 < xt1) {
      mapXStep = -1
      partial = x1 >> MAP_B_TO_FRAC & FRACUNIT - 1
      yStep = div(y2 - y1, Math.abs(x2 - x1))
    } else {
      mapXStep = 0
      partial = FRACUNIT
      yStep = 256 * FRACUNIT
    }

    let yIntercept = (y1 >> MAP_B_TO_FRAC) + mul(partial, yStep)

    if (yt2 > yt1) {
      mapYStep = 1
      partial = FRACUNIT - (y1 >> MAP_B_TO_FRAC & FRACUNIT - 1)
      xStep = div(x2 - x1, Math.abs(x2 - y1))
    } else if (yt2 < yt1) {
      mapYStep = -1
      partial = y1 >> MAP_B_TO_FRAC & FRACUNIT - 1
      xStep = div(x2 - x1, Math.abs(x2 - y1))
    } else {
      mapYStep = 0
      partial = FRACUNIT
      xStep = 256 * FRACUNIT
    }

    let xIntercept = (x1 >> MAP_B_TO_FRAC) + mul(partial, xStep)

    // Step through map blocks.
    // Count is present to prevent a round off error
    // from skipping the break.
    let mapX = xt1
    let mapY = yt1

    for (let count = 0; count < 64; ++count) {
      if (flags & PT_ADD_LINES) {
        if (!this.blockLinesIterator(mapX, mapY, this.addLineIntercepts, this)) {
          // early out
          return false
        }
      }
      if (flags & PT_ADD_THINGS) {
        if (!this.blockThingsIterator(mapX, mapY, this.addThingIntercepts, this)) {
          // early out
          return false
        }
      }

      if (mapX === xt2 &&
        mapY === yt2
      ) {
        break
      }

      if (yIntercept >> FRACBITS === mapY) {
        yIntercept += yStep
        mapX += mapXStep
      } else if (xIntercept >> FRACBITS === mapX) {
        xIntercept += xStep
        mapY += mapYStep
      }
    }

    // go through the sorted list
    return this.traverseIntercepts(trav, thisArg, FRACUNIT)
  }
}


