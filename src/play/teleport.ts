import { ANGLE_TO_FINE_SHIFT, FINE_ANGLES, fineSine } from '../misc/table'
import { Line } from '../rendering/line'
import { MObj } from './mobj/mobj'
import { MObjFlag } from './mobj/mobj-flag'
import { MObjHandler } from './mobj-handler'
import { MObjType } from '../doom/info/mobj-type'
import { Map } from './map'
import { Play } from './setup'
import { Sector } from '../rendering/sector'
import { Thinker } from '../doom/think'
import { Tick } from './tick'

export class Teleport {

  private get map(): Map {
    return this.play.map
  }
  private get mObjHandler(): MObjHandler {
    return this.play.mObjHandler
  }
  private get tick(): Tick {
    return this.play.tick
  }

  constructor(private play: Play) { }

  evTeleport(line: Line, side: 0 | 1, thing: MObj): boolean {

    // don't teleport missiles
    if (thing.flags & MObjFlag.Missile) {
      return false
    }

    // Don't teleport if hit back of line,
    //  so you can get out of teleporter.
    if (side === 1) {
      return false
    }


    const tag = line.tag
    let thinker: Thinker<unknown, [unknown]> | null
    let m: MObj
    let sector: Sector | null
    let oldX: number
    let oldY: number
    let oldZ: number
    let an: number
    for (let i = 0; i < this.play.numSectors; i++) {
      if (this.play.sectors[i].tag === tag) {
        for (thinker = this.tick.thinkerCap.next;
          thinker !== null && thinker !== this.tick.thinkerCap;
          thinker = thinker.next
        ) {
          // not a mobj
          if (thinker.func !== this.mObjHandler.thinker) {
            continue
          }

          m = thinker as MObj

          // not a teleportman
          if (m.type !== MObjType.Teleportman) {
            continue
          }

          if (m.subSector === null) {
            throw 'm.subSector = null'
          }

          sector = m.subSector.sector
          // wrong sector
          if (sector === null || this.play.sectors.indexOf(sector) !== i) {
            continue
          }

          oldX = thing.x
          oldY = thing.y
          oldZ = thing.z

          if (!this.map.teleportMove(thing, m.x, m.y)) {
            return false
          }

          //fixme: not needed?
          thing.z = thing.floorZ
          if (thing.player) {
            thing.player.viewZ = thing.z + thing.player.viewHeight
          }

          // spawn teleport fog at source and destination
          this.mObjHandler.spawnMObj(oldX, oldY, oldZ, MObjType.Tfog)
          an = m.angle >>> ANGLE_TO_FINE_SHIFT
          this.mObjHandler.spawnMObj(m.x + 20 * fineSine[FINE_ANGLES / 4 + an],
            m.y + 20 * fineSine[an],
            thing.z,
            MObjType.Tfog)


          // don't move for a bit
          if (thing.player) {
            thing.reactionTime = 18
          }

          thing.angle = m.angle
          thing.momX = thing.momY = thing.momZ = 0

          // typescript complains that thinker might be null when I return true
          // eslint-disable-next-line no-constant-condition
          if (1 === 1) {
            return true
          }
        }
      }
    }
    return false
  }
}
