import { MObj, MObjFlag } from './mobj'
import { MAP_BLOCK_SHIFT } from './local'
import { Play } from './setup'
import { Rendering } from '../rendering/rendering'

export class MapUtils {
  constructor(private play: Play,
              private rendering: Rendering) {}

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
}
