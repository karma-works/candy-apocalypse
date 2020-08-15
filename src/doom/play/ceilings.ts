import { CEIL_SPEED, Ceiling, MAX_CEILINGS } from './ceiling/ceiling'
import { CeilingType } from './ceiling/ceiling-type'
import { Sound as DSound } from '../doom/sound'
import { FRACUNIT } from '../misc/fixed'
import { Floor } from './floor'
import { Line } from '../rendering/defs/line'
import { Play } from './setup'
import { Result } from './specials/result'
import { Sector } from '../rendering/defs/sector'
import { SfxName } from '../doom/sounds/sfx-name'
import { Special } from './special'
import { Tick } from './tick'

//
// CEILINGS
//
export class Ceilings {

  activeCeilings = new Array<Ceiling | null>(MAX_CEILINGS).fill(null)

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
  // T_MoveCeiling
  //
  moveCeiling(ceiling: Ceiling): void {
    let res: Result
    switch (ceiling.direction) {
    case 0:
      // IN STASIS
      break
    case 1:
      // UP
      res = this.floor.movePlane(ceiling.sector,
        ceiling.speed,
        ceiling.topHeight,
        false, 1, ceiling.direction)

      if (!(this.tick.levelTime & 7)) {
        switch (ceiling.type) {
        case CeilingType.SilentCrushAndRaise:
          break
        default:

          this.dSound.startSound(ceiling.sector.soundOrg,
            SfxName.Stnmov)
          // ?
          break
        }
      }

      if (res === Result.PastDest) {
        switch (ceiling.type) {
        case CeilingType.RaiseToHighest:
          this.removeActiveCeiling(ceiling)
          break

        case CeilingType.SilentCrushAndRaise:
          this.dSound.startSound(ceiling.sector.soundOrg,
            SfxName.Pstop)
          // fallthrough
        case CeilingType.FastCrushAndRaise:
        case CeilingType.CrushAndRaise:
          ceiling.direction = -1
          break

        default:
          break
        }

      }
      break

    case -1:
      // DOWN
      res = this.floor.movePlane(ceiling.sector,
        ceiling.speed,
        ceiling.bottomHeight,
        ceiling.crush, 1, ceiling.direction)

      if (!(this.tick.levelTime & 7)) {
        switch (ceiling.type) {
        case CeilingType.SilentCrushAndRaise:
          break
        default:
          this.dSound.startSound(ceiling.sector.soundOrg,
            SfxName.Stnmov)
        }
      }

      if (res === Result.PastDest) {
        switch (ceiling.type) {
        case CeilingType.SilentCrushAndRaise:
          this.dSound.startSound(ceiling.sector.soundOrg,
            SfxName.Pstop)
          // fallthrough
        case CeilingType.CrushAndRaise:
          ceiling.speed = CEIL_SPEED
          // fallthrough
        case CeilingType.FastCrushAndRaise:
          ceiling.direction = 1
          break

        case CeilingType.LowerAndCrush:
        case CeilingType.LowerToFloor:
          this.removeActiveCeiling(ceiling)
          break

        default:
          break
        }
      } else {
        if (res === Result.Crushed) {
          switch (ceiling.type) {
          case CeilingType.SilentCrushAndRaise:
          case CeilingType.CrushAndRaise:
          case CeilingType.LowerAndCrush:
            ceiling.speed = CEIL_SPEED / 8 >> 0
            break

          default:
            break
          }
        }
      }
      break
    }
  }


  //
  // EV_DoCeiling
  // Move a ceiling up/down and all around!
  //
  evDoCeiling(line: Line, type: CeilingType): boolean {
    let secNum = -1
    let rtn = false
    let sec: Sector
    let ceiling: Ceiling

    // Reactivate in-stasis ceilings...for certain types.
    switch (type) {
    case CeilingType.FastCrushAndRaise:
    case CeilingType.SilentCrushAndRaise:
    case CeilingType.CrushAndRaise:
      this.activateInStasisCeiling(line)
    }

    while ((secNum = this.special.findSectorFromLineTag(line, secNum)) >= 0) {
      sec = this.sectors[secNum]

      if (sec.specialData) {
        continue
      }

      // new ceiling thinker
      rtn = true
      ceiling = new Ceiling(this.moveCeiling, this, type, sec)
      this.tick.addThinker(ceiling)
      sec.specialData = ceiling

      switch (type) {
      case CeilingType.FastCrushAndRaise:
        ceiling.crush = true
        ceiling.topHeight = sec.ceilingHeight
        ceiling.bottomHeight = sec.floorHeight + 8 * FRACUNIT
        ceiling.direction = -1
        ceiling.speed = CEIL_SPEED * 2
        break

      case CeilingType.SilentCrushAndRaise:
      case CeilingType.CrushAndRaise:
        ceiling.crush = true
        ceiling.topHeight = sec.ceilingHeight
        // fallthrough
      case CeilingType.LowerAndCrush:
      case CeilingType.LowerToFloor:
        ceiling.bottomHeight = sec.floorHeight
        if (type !== CeilingType.LowerToFloor) {
          ceiling.bottomHeight += 8 * FRACUNIT
        }
        ceiling.direction = -1
        ceiling.speed = CEIL_SPEED
        break

      case CeilingType.RaiseToHighest:
        ceiling.topHeight = sec.findHighestCeilingSurrounding()
        ceiling.direction = 1
        ceiling.speed = CEIL_SPEED
        break
      }

      ceiling.tag = sec.tag
      ceiling.type = type
      this.addActiveCeiling(ceiling)
    }
    return rtn
  }


  //
  // Add an active ceiling
  //
  addActiveCeiling(c: Ceiling): void {
    for (let i = 0; i < MAX_CEILINGS; ++i) {
      if (this.activeCeilings[i] === null) {
        this.activeCeilings[i] = c
        return
      }
    }
  }


  //
  // Remove a ceiling's thinker
  //
  private removeActiveCeiling(c: Ceiling): void {
    for (let i = 0; i < MAX_CEILINGS; ++i) {
      if (this.activeCeilings[i] === c) {
        c.sector.specialData = null
        this.tick.removeThinker(c)
        this.activeCeilings[i] = null
        break
      }
    }
  }

  //
  // Restart a ceiling that's in-stasis
  //
  private activateInStasisCeiling(line: Line): void {
    let ceiling: Ceiling | null
    for (let i = 0; i < MAX_CEILINGS; ++i) {
      ceiling = this.activeCeilings[i]
      if (ceiling &&
        ceiling.tag === line.tag &&
        ceiling.direction === 0
      ) {
        ceiling.direction = ceiling.oldDirection
        ceiling.func = this.moveCeiling
        ceiling.handler = this
      }
    }
  }


  //
  // EV_CeilingCrushStop
  // Stop a ceiling from crushing!
  //
  evCeilingCrushStop(line: Line): boolean {
    let rtn = false

    let ceiling: Ceiling | null
    for (let i = 0; i < MAX_CEILINGS; ++i) {
      ceiling = this.activeCeilings[i]
      if (ceiling &&
        ceiling.tag === line.tag &&
        ceiling.direction !== 0
      ) {
        ceiling.oldDirection = ceiling.direction
        ceiling.func = null
        // in-stasis
        ceiling.direction = 0
        rtn = true
      }
    }

    return rtn
  }
}
