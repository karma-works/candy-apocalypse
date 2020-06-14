import { MAP_BLOCK_SHIFT, MAX_RADIUS } from './local'
import { MObj, MObjFlag } from './mobj'
import { BBox } from '../misc/bbox'
import { FRACUNIT } from '../misc/fixed'
import { Line } from '../rendering/line'
import { MapLineFlag } from '../doom/data'
import { MapUtils } from './map-utils'
import { Play } from './setup'
import { Rendering } from '../rendering/rendering'

// keep track of special lines as they are hit,
// but don't process them until the move is proven valid
const MAX_SPECIAL_CROSS = 8

export class Map {
  private tmBBox = new BBox()
  private tmThing: MObj | null = null
  private tmFlags = 0
  private tmX = 0
  private tmY = 0

  // If "floatok" true, move would be ok
  // if within "tmfloorz - tmceilingz".
  private floatOK = false
  private tmFloorZ = 0
  private tmCeilingZ = 0
  private tmDropOffZ = 0

  // keep track of the line that lowers the ceiling,
  // so missiles don't explode against sky hack walls
  private ceilingLine: Line | null = null

  private specHit = new Array<Line>(MAX_SPECIAL_CROSS)
  private numSpecHit = 0

  private get mapUtils(): MapUtils {
    return this.play.mapUtils
  }
  private get rendering(): Rendering {
    return this.play.rendering
  }
  constructor(private play: Play) { }

  //
  // MOVEMENT ITERATOR FUNCTIONS
  //


  //
  // PIT_CheckLine
  // Adjusts tmfloorz and tmceilingz as lines are contacted
  //
  private checkLine(ld: Line): boolean {
    if (this.tmBBox.right <= ld.bbox.left ||
      this.tmBBox.left >= ld.bbox.right ||
      this.tmBBox.top <= ld.bbox.bottom ||
      this.tmBBox.bottom >= ld.bbox.top
    ) {
      return true
    }

    if (this.mapUtils.boxOnLineSide(this.tmBBox, ld) !== -1) {
      return true
    }

    // A line has been hit

    // The moving thing's destination position will cross
    // the given line.
    // If this should not be allowed, return false.
    // If the line is special, keep track of it
    // to process later if the move is proven ok.
    // NOTE: specials are NOT sorted by order,
    // so two special lines that are only 8 pixels apart
    // could be crossed in either order.

    if (!ld.backSector) {
      // one sided line
      return false
    }

    if (this.tmThing === null) {
      throw 'this.tmThing = null'
    }

    if (!(this.tmThing.flags & MObjFlag.Missile)) {
      if (ld.flags & MapLineFlag.Blocking) {
        // explicitly blocking everything
        return false
      }

      if (!this.tmThing.player && ld.flags & MapLineFlag.BlockMonsters) {
        // block monsters only
        return false
      }
    }

    // set openrange, opentop, openbottom
    this.mapUtils.lineOpening(ld)

    // adjust floor / ceiling heights
    if (this.mapUtils.openTop < this.tmCeilingZ) {
      this.tmCeilingZ = this.mapUtils.openTop
      this.ceilingLine = ld
    }

    if (this.mapUtils.openBottom > this.tmFloorZ) {
      this.tmFloorZ = this.mapUtils.openBottom
    }

    if (this.mapUtils.lowFloor < this.tmDropOffZ) {
      this.tmDropOffZ = this.mapUtils.lowFloor
    }

    // if contacted a special line, add it to the list
    if (ld.special) {
      this.specHit[this.numSpecHit] = ld
      this.numSpecHit++
    }

    return true
  }

  //
  // PIT_CheckThing
  //
  private checkThing(thing: MObj) {
    // TODO
    return true
  }

  //
  // MOVEMENT CLIPPING
  //

  //
  // P_CheckPosition
  // This is purely informative, nothing is modified
  // (except things picked up).
  //
  // in:
  //  a mobj_t (can be valid or invalid)
  //  a position to be checked
  //   (doesn't need to be related to the mobj_t->x,y)
  //
  // during:
  //  special things are touched if MF_PICKUP
  //  early out on solid lines?
  //
  // out:
  //  newsubsec
  //  floorz
  //  ceilingz
  //  tmdropoffz
  //   the lowest point contacted
  //   (monsters won't move to a dropoff)
  //  speciallines[]
  //  numspeciallines
  //
  private checkPosition(thing: MObj, x: number, y: number): boolean {
    this.tmThing = thing
    this.tmFlags = thing.flags

    this.tmX = x
    this.tmY = y

    this.tmBBox.top = y + this.tmThing.radius
    this.tmBBox.bottom = y - this.tmThing.radius
    this.tmBBox.right = x + this.tmThing.radius
    this.tmBBox.left = x - this.tmThing.radius

    const newSubSec = this.rendering.pointInSubSector(x, y)
    this.ceilingLine = null

    if (newSubSec.sector === null) {
      throw 'newSubSec.sector'
    }

    // The base floor / ceiling is from the subsector
    // that contains the point.
    // Any contacted lines the step closer together
    // will adjust them.
    this.tmFloorZ = this.tmDropOffZ =
      newSubSec.sector.floorHeight
    this.tmCeilingZ = newSubSec.sector.ceilingHeight

    this.rendering.validCount++
    this.numSpecHit = 0

    if (this.tmFlags & MObjFlag.NoClip) {
      return true
    }

    // Check things first, possibly picking things up.
    // The bounding box is extended by MAXRADIUS
    // because mobj_ts are grouped into mapblocks
    // based on their origin point, and can overlap
    // into adjacent blocks by up to MAXRADIUS units.
    let xl = this.tmBBox.left - this.play.bMapOrgX - MAX_RADIUS >> MAP_BLOCK_SHIFT
    let xh = this.tmBBox.right - this.play.bMapOrgX + MAX_RADIUS >> MAP_BLOCK_SHIFT
    let yl = this.tmBBox.bottom - this.play.bMapOrgY - MAX_RADIUS >> MAP_BLOCK_SHIFT
    let yh = this.tmBBox.top - this.play.bMapOrgY + MAX_RADIUS >> MAP_BLOCK_SHIFT
    let bx: number
    let by: number
    for (bx = xl; bx <= xh; ++bx) {
      for (by = yl; by <= yh; ++by) {
        if (!this.mapUtils.blockThingsIterator(bx, by, this.checkThing, this)) {
          return false
        }
      }
    }

    // check lines
    xl = this.tmBBox.left - this.play.bMapOrgX >> MAP_BLOCK_SHIFT
    xh = this.tmBBox.right - this.play.bMapOrgX >> MAP_BLOCK_SHIFT
    yl = this.tmBBox.bottom - this.play.bMapOrgY >> MAP_BLOCK_SHIFT
    yh = this.tmBBox.top - this.play.bMapOrgY >> MAP_BLOCK_SHIFT
    for (bx = xl; bx <= xh; ++bx) {
      for (by = yl; by <= yh; ++by) {
        if (!this.mapUtils.blockLinesIterator(bx, by, this.checkLine, this)) {
          return false
        }
      }
    }

    return true
  }

  //
  // P_TryMove
  // Attempt to move to a new position,
  // crossing special lines unless MObjFlag.MF_TELEPORT is set.
  //
  tryMove(thing: MObj, x: number, y: number): boolean {
    this.floatOK = false

    if (!this.checkPosition(thing, x, y)) {
      // solid wall or thing
      return false
    }

    if (!(thing.flags & MObjFlag.NoClip)) {
      if (this.tmCeilingZ - this.tmFloorZ < thing.height) {
        // doesn't fit
        return false
      }

      this.floatOK = true

      if (!(thing.flags & MObjFlag.Teleport) &&
        this.tmCeilingZ - thing.z < thing.height
      ) {
        // mobj must lower itself to fit
        return false
      }

      if (!(thing.flags & MObjFlag.Teleport) &&
        this.tmFloorZ - thing.z > 24 * FRACUNIT
      ) {
        // too big a step up
        return false
      }

      if (!(thing.flags & (MObjFlag.DropOff | MObjFlag.Float)) &&
        this.tmFloorZ - this.tmDropOffZ > 24*FRACUNIT) {
        // don't stand over a dropoff
        return false
      }
    }

    // the move is ok,
    // so link the thing into its new position
    this.mapUtils.unsetThingPosition(thing)

    const oldX = thing.x
    const oldY = thing.y
    thing.floorZ = this.tmFloorZ
    thing.ceilingZ = this.tmCeilingZ
    thing.x = x
    thing.y = y

    this.mapUtils.setThingPosition(thing)

    // TODO

    return true
  }
}
