import { PLAT_SPEED, PLAT_WAIT, Plat } from './plats/plat'
import { Sound as DSound } from '../doom/sound'
import { FRACUNIT } from '../misc/fixed'
import { Floor } from './floor'
import { Line } from '../rendering/defs/line'
import { PlatStatus } from './plats/plat-status'
import { PlatType } from './plats/plat-type'
import { Play } from './setup'
import { Result } from './specials/result'
import { Sector } from '../rendering/defs/sector'
import { Sfx } from '../doom/sounds/sfx'
import { Special } from './special'
import { Tick } from './tick'
import { random } from '../misc/random'

const MAX_PLATS = 30

export class Plats {
  private activePlats = new Array<Plat>(MAX_PLATS)

  private get dSound(): DSound {
    return this.play.dSound
  }
  private get floor(): Floor {
    return this.play.floor
  }
  get sectors(): readonly Sector[] {
    return this.play.sectors
  }
  private get special(): Special {
    return this.play.special
  }
  private get tick(): Tick {
    return this.play.tick
  }

  constructor(private play: Play) { }

  //
  // Move a plat up and down
  //
  platRaise(plat: Plat): void {
    let res: Result

    switch (plat.status) {
    case PlatStatus.Up:
      res = this.floor.movePlane(
        plat.sector,
        plat.speed,
        plat.high,
        plat.crush,
        0, 1,
      )

      if (plat.type === PlatType.RaiseAndChange ||
          plat.type === PlatType.RaiseToNearestAndChange) {
        if (!(this.tick.levelTime & 7)) {
          this.dSound.startSound(plat.sector.soundOrg, Sfx.Stnmov)
        }
      }

      if (res === Result.Crushed && !plat.crush) {
        plat.count = plat.wait
        plat.status = PlatStatus.Down
        this.dSound.startSound(plat.sector.soundOrg, Sfx.Pstart)
      } else {
        if (res === Result.PastDest) {
          plat.count = plat.wait
          plat.status = PlatStatus.Waiting
          this.dSound.startSound(plat.sector.soundOrg, Sfx.Pstop)

          switch (plat.type) {
          case PlatType.BlazeDWUS:
          case PlatType.DownWaitUpStay:
            this.removeActivePlat(plat)
            break

          case PlatType.RaiseAndChange:
          case PlatType.RaiseToNearestAndChange:
            this.removeActivePlat(plat)
            break

          default:
            break
          }
        }
      }
      break

    case PlatStatus.Down:
      res = this.floor.movePlane(plat.sector, plat.speed, plat.low, false, 0, -1)

      if (res === Result.PastDest) {
        plat.count = plat.wait
        plat.status = PlatStatus.Waiting
        this.dSound.startSound(plat.sector.soundOrg, Sfx.Pstop)
      }
      break

    case PlatStatus.Waiting:
      if (!--plat.count) {
        if (plat.sector.floorHeight === plat.low) {
          plat.status = PlatStatus.Up
        } else {
          plat.status = PlatStatus.Down
          this.dSound.startSound(plat.sector.soundOrg, Sfx.Pstart)
        }
      }
      break
    case PlatStatus.InStatis:
      break
    }
  }

  //
  // Do Platforms
  //  "amount" is only used for SOME platforms.
  //
  evDoPlat(line: Line, type: PlatType, amount: number): boolean {
    let secNum = -1
    let rtn = false
    let sec: Sector
    let plat: Plat

    // Activate all <type> plats that are in_stasis
    switch (type) {
    case PlatType.PerpetualRaise:
      this.activateInStasis(line.tag)
      break

    default:
      break
    }

    while ((secNum = this.special.findSectorFromLineTag(line, secNum)) >= 0) {
      sec = this.sectors[secNum]

      if (sec.specialData) {
        continue
      }

      // Find lowest & highest floors around sector
      rtn = true
      plat = new Plat(this.platRaise, this, type, sec)
      this.tick.addThinker(plat)

      plat.sector.specialData = plat
      plat.tag = line.tag

      switch (type) {
      case PlatType.RaiseToNearestAndChange:
        plat.speed = PLAT_SPEED / 2
        sec.floorPic = this.play.sides[line.sideNum[0]].sector.floorPic
        plat.high = sec.findNextHighestFloor()
        plat.wait = 0
        plat.status = PlatStatus.Up
        // NO MORE DAMAGE, IF APPLICABLE
        sec.special = 0

        this.dSound.startSound(sec.soundOrg, Sfx.Stnmov)
        break

      case PlatType.RaiseAndChange:
        plat.speed = PLAT_SPEED / 2
        sec.floorPic = this.play.sides[line.sideNum[0]].sector.floorPic
        plat.high = sec.floorHeight + amount * FRACUNIT
        plat.wait = 0
        plat.status = PlatStatus.Up

        this.dSound.startSound(sec.soundOrg, Sfx.Stnmov)
        break

      case PlatType.DownWaitUpStay:
        plat.speed = PLAT_SPEED * 4
        plat.low = sec.findLowestFloorSurrounding()

        if (plat.low > sec.floorHeight) {
          plat.low = sec.floorHeight
        }

        plat.high = sec.floorHeight
        plat.wait = 35 * PLAT_WAIT
        plat.status = PlatStatus.Down
        this.dSound.startSound(sec.soundOrg, Sfx.Pstart)
        break

      case PlatType.BlazeDWUS:
        plat.speed = PLAT_SPEED * 8
        plat.low = sec.findLowestFloorSurrounding()

        if (plat.low > sec.floorHeight) {
          plat.low = sec.floorHeight
        }

        plat.high = sec.floorHeight
        plat.wait = 35 * PLAT_WAIT
        plat.status = PlatStatus.Down
        this.dSound.startSound(sec.soundOrg, Sfx.Pstart)
        break

      case PlatType.PerpetualRaise:
        plat.speed = PLAT_SPEED
        plat.low = sec.findLowestFloorSurrounding()

        if (plat.low > sec.floorHeight) {
          plat.low = sec.floorHeight
        }

        plat.high = sec.findHighestFloorSurrounding()

        if (plat.high < sec.floorHeight) {
          plat.high = sec.floorHeight
        }

        plat.wait = 35 * PLAT_WAIT
        plat.status = random.pRandom() & 1

        this.dSound.startSound(sec.soundOrg, Sfx.Pstart)
        break
      }
      this.addActivePlat(plat)
    }
    return rtn
  }

  private activateInStasis(tag: number): void {
    for (let i = 0; i< MAX_PLATS; ++i) {
      if (this.activePlats[i] &&
        this.activePlats[i].tag === tag &&
        this.activePlats[i].status === PlatStatus.InStatis
      ) {
        this.activePlats[i].status = this.activePlats[i].oldStatus

        debugger
        this.activePlats[i].func = this.platRaise
        this.activePlats[i].handler = this
      }
    }
  }

  evStopPlate(line: Line): void {
    for (let i = 0; i< MAX_PLATS; ++i) {
      if (this.activePlats[i] &&
        this.activePlats[i].status !== PlatStatus.InStatis &&
        this.activePlats[i].tag === line.tag
      ) {
        this.activePlats[i].oldStatus = this.activePlats[i].status
        this.activePlats[i].status = PlatStatus.InStatis

        debugger
        this.activePlats[i].func = null
        this.activePlats[i].handler = this
      }
    }
  }

  addActivePlat(plat: Plat): void {
    for (let i = 0; i< MAX_PLATS; ++i) {
      if (this.activePlats[i] === undefined) {
        this.activePlats[i] = plat

        return
      }
    }
    throw 'P_RemoveActivePlat: no more plats!'
  }

  private removeActivePlat(plat: Plat): void {
    for (let i = 0; i< MAX_PLATS; ++i) {
      if (plat === this.activePlats[i]) {
        this.activePlats[i].sector.specialData = null
        this.tick.removeThinker(this.activePlats[i])
        delete this.activePlats[i]

        return
      }
    }
    throw 'P_RemoveActivePlat: can\'t find plat!'
  }
}
