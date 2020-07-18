import { FLOOR_SPEED, FloorMove } from './floor/floor-move'
import { Sound as DSound } from '../doom/sound'
import { Data } from '../rendering/data'
import { Doom } from '../doom/doom'
import { FRACUNIT } from '../misc/fixed'
import { FloorType } from './floor/floor-type'
import { GameVersion } from '../doom/mode'
import { Line } from '../rendering/line'
import { Map } from './map'
import { MapLineFlag } from '../doom/data'
import { Play } from './setup'
import { Result } from './specials/result'
import { Sector } from '../rendering/sector'
import { Sfx } from '../doom/sounds/sfx'
import { Side } from '../rendering/side'
import { Special } from './special'
import { StairType } from './floor/stair-type'
import { Tick } from './tick'

//
// FLOORS
//
export class Floor {

  private get data(): Data {
    return this.play.rendering.data
  }
  private get doom(): Doom {
    return this.play.doom
  }
  private get dSound(): DSound {
    return this.play.dSound
  }
  private get map(): Map {
    return this.play.map
  }
  private get special(): Special {
    return this.play.special
  }
  private get tick(): Tick {
    return this.play.tick
  }

  constructor(private play: Play) { }

  //
  // Move a plane (floor or ceiling) and check for crushing
  //
  movePlane(
    sector: Sector,
    speed: number,
    dest: number,
    crush: boolean,
    floorOrCeiling: 0 | 1,
    direction: -1 | 0 | 1 | 2,
  ): Result {
    let flag: boolean
    let lastPos: number
    switch (floorOrCeiling) {
    case 0:
      // FLOOR
      switch (direction) {
      case -1:
        // DOWN
        if (sector.floorHeight - speed < dest) {
          lastPos = sector.floorHeight
          sector.floorHeight = dest
          flag = this.map.changeSector(sector, crush)
          if (flag) {
            sector.floorHeight = lastPos
            this.map.changeSector(sector, crush)
          }

          return Result.PastDest
        } else {
          lastPos = sector.floorHeight
          sector.floorHeight -= speed
          flag = this.map.changeSector(sector, crush)
          if (flag) {
            sector.floorHeight = lastPos
            this.map.changeSector(sector, crush)
            return Result.Crushed
          }
        }
        break

      case 1:
        // UP
        if (sector.floorHeight + speed > dest) {
          lastPos = sector.floorHeight
          sector.floorHeight = dest
          flag = this.map.changeSector(sector, crush)
          if (flag) {
            sector.floorHeight = lastPos
            this.map.changeSector(sector, crush)
          }

          return Result.PastDest
        } else {
          // COULD GET CRUSHED
          lastPos = sector.floorHeight
          sector.floorHeight += speed
          flag = this.map.changeSector(sector, crush)
          if (flag) {
            if (crush) {
              return Result.Crushed
            }
            sector.floorHeight = lastPos
            this.map.changeSector(sector, crush)
            return Result.Crushed
          }
        }
        break
      }
      break

    case 1:
      // CEILING
      switch (direction) {
      case -1:
        // DOWN
        if (sector.ceilingHeight - speed < dest) {
          lastPos = sector.ceilingHeight
          sector.ceilingHeight = dest
          flag = this.map.changeSector(sector, crush)
          if (flag) {
            sector.ceilingHeight = lastPos
            this.map.changeSector(sector, crush)
          }

          return Result.PastDest
        } else {
          // COULD GET CRUSHED
          lastPos = sector.ceilingHeight
          sector.ceilingHeight -= speed
          flag = this.map.changeSector(sector, crush)
          if (flag) {
            if (crush) {
              return Result.Crushed
            }
            sector.ceilingHeight = lastPos
            this.map.changeSector(sector, crush)
            return Result.Crushed
          }
        }
        break

      case 1:
        // UP
        if (sector.ceilingHeight + speed > dest) {
          lastPos = sector.ceilingHeight
          sector.ceilingHeight = dest
          flag = this.map.changeSector(sector, crush)
          if (flag) {
            sector.ceilingHeight = lastPos
            this.map.changeSector(sector, crush)
          }

          return Result.PastDest
        } else {
          lastPos = sector.ceilingHeight
          sector.ceilingHeight += speed
          flag = this.map.changeSector(sector, crush)
        }
        break
      }
      break
    }

    return Result.Ok
  }

  //
  // MOVE A FLOOR TO IT'S DESTINATION (UP OR DOWN)
  //
  private moveFloor(floor: FloorMove): void {
    const res = this.movePlane(
      floor.sector,
      floor.speed,
      floor.floorDestHeight,
      floor.crush,
      0,
      floor.direction,
    )

    if (!(this.tick.levelTime & 7)) {
      this.dSound.startSound(floor.sector.soundOrg, Sfx.Stnmov)
    }

    if (res === Result.PastDest) {
      floor.sector.specialData = null

      if (floor.direction === 1) {
        switch (floor.type) {
        case FloorType.DonutRaise:
          floor.sector.special = floor.newSpecial
          floor.sector.floorPic = floor.texture
        }
      } else if (floor.direction === -1) {
        switch (floor.type) {
        case FloorType.LowerAndChange:
          floor.sector.special = floor.newSpecial
          floor.sector.floorPic = floor.texture
        }
      }
      this.tick.removeThinker(floor)

      this.dSound.startSound(floor.sector.soundOrg, Sfx.Pstop)
    }
  }

  //
  // HANDLE FLOOR TYPES
  //
  evDoFloor(line: Line, floorType: FloorType): boolean {
    let secNum = -1
    let rtn = false
    let sec: Sector
    let floor: FloorMove

    while ((secNum = this.special.findSectorFromLineTag(line, secNum)) >= 0) {
      sec = this.play.sectors[secNum]

      // ALREADY MOVING?  IF SO, KEEP GOING...
      if (sec.specialData) {
        continue
      }

      // new floor thinker
      rtn = true
      floor = new FloorMove(floorType, sec, this.moveFloor, this)
      this.tick.addThinker(floor)
      sec.specialData = floor as unknown

      switch (floorType) {
      case FloorType.LowerFloor:
        floor.direction = -1
        floor.floorDestHeight = sec.findHighestFloorSurrounding()
        break

      case FloorType.LowerFloorToLowest:
        floor.direction = -1
        floor.floorDestHeight = sec.findLowestFloorSurrounding()
        break

      case FloorType.TurboLower:
        floor.direction = -1
        floor.speed = FLOOR_SPEED * 4
        floor.floorDestHeight = sec.findHighestFloorSurrounding()
        if (this.doom.gameVersion <= GameVersion.Doom12 ||
          floor.floorDestHeight !== sec.floorHeight
        ) {
          floor.floorDestHeight += 8 * FRACUNIT
        }
        break

      case FloorType.RaiseFloorCrush:
        floor.crush = true
        // fallthrough
      case FloorType.RaiseFloor:
        floor.direction = 1
        floor.floorDestHeight = sec.findLowestCeilingSurrounding()
        if (floor.floorDestHeight > sec.ceilingHeight) {
          floor.floorDestHeight = sec.ceilingHeight
        }
        floor.floorDestHeight -= 8 * FRACUNIT *
          (floorType === FloorType.RaiseFloorCrush ? 1 : 0)
        break

      case FloorType.RaiseFloorTurbo:
        floor.direction = 1
        floor.speed = FLOOR_SPEED * 4
        floor.floorDestHeight = sec.findNextHighestFloor()
        break

      case FloorType.RaiseFloorToNearest:
        floor.direction = 1
        floor.floorDestHeight = sec.findNextHighestFloor()
        break

      case FloorType.RaiseFloor24:
        floor.direction = 1
        floor.floorDestHeight = floor.sector.floorHeight + 24 * FRACUNIT
        break

      case FloorType.RaiseFloor512:
        floor.direction = 1
        floor.floorDestHeight = floor.sector.floorHeight + 512 * FRACUNIT
        break

      case FloorType.RaiseFloor24AndChange:
        floor.direction = 1
        floor.floorDestHeight = floor.sector.floorHeight + 24 * FRACUNIT

        if (line.frontSector === null) {
          throw 'line.frontSector = null'
        }
        sec.floorPic = line.frontSector.floorPic
        sec.special = line.frontSector.special
        break

      case FloorType.RaiseToTexture:
        {
          let minSize = 2147483647

          floor.direction = 1

          let side: Side
          for (let i = 0; i < sec.lineCount; ++i) {
            if (this.special.twoSided(secNum, i)) {
              side = this.special.getSide(secNum, i, 0)
              if (side.bottomTexture >= 0) {
                if (this.data.textureHeight[side.bottomTexture] < minSize) {
                  minSize = this.data.textureHeight[side.bottomTexture]
                }
              }
              side = this.special.getSide(secNum, i, 1)
              if (side.bottomTexture >= 0) {
                if (this.data.textureHeight[side.bottomTexture] < minSize) {
                  minSize = this.data.textureHeight[side.bottomTexture]
                }
              }
            }
          }
          floor.floorDestHeight = floor.sector.floorHeight + minSize
        }
        break

      case FloorType.LowerAndChange:
        {
          floor.direction = -1
          floor.floorDestHeight = sec.findLowestFloorSurrounding()
          floor.texture = sec.floorPic

          for (let i = 0; i < sec.lineCount; ++i) {
            if (this.special.twoSided(secNum, i)) {
              if (
                this.play.sectors.indexOf(
                  this.special.getSide(secNum, i, 0).sector,
                ) === secNum
              ) {
                sec = this.special.getSector(secNum, i, 1)

                if (sec.floorHeight === floor.floorDestHeight) {
                  floor.texture = sec.floorPic
                  floor.newSpecial = sec.special
                  break
                }
              } else {
                sec = this.special.getSector(secNum, i, 0)

                if (sec.floorHeight === floor.floorDestHeight) {
                  floor.texture = sec.floorPic
                  floor.newSpecial = sec.special
                  break
                }
              }
            }
          }
        }
        break
      }

    }

    return rtn
  }


  //
  // BUILD A STAIRCASE!
  //
  evBuildStairs(line: Line, type: StairType): boolean {
    let secNum = -1
    let height: number
    let i: number
    let newSecNum: number
    let texture: number
    let ok: boolean
    let rtn = false

    let sec: Sector
    let tsec: Sector | null

    let floor: FloorMove

    let stairSize: number
    let speed: number

    while ((secNum = this.special.findSectorFromLineTag(line, secNum)) >= 0) {
      sec = this.play.sectors[secNum]

      // ALREADY MOVING?  IF SO, KEEP GOING...
      if (sec.specialData) {
        continue
      }

      // new floor thinker
      rtn = true
      floor = new FloorMove(FloorType.LowerFloor, sec, this.moveFloor, this)
      this.tick.addThinker(floor)
      sec.specialData = floor
      floor.direction = 1
      switch (type) {
      case StairType.Build8:
        speed = FLOOR_SPEED / 4
        stairSize = 8 * FRACUNIT
        break
      case StairType.Turbo16:
        speed = FLOOR_SPEED * 4
        stairSize = 16 * FRACUNIT
        break
      }
      floor.speed = speed
      height = sec.floorHeight + stairSize
      floor.floorDestHeight = height

      texture = sec.floorPic

      // Find next sector to raise
      // 1. Find 2-sided line with same sector side[0]
      // 2. Other side is the next sector to raise
      do {
        ok = false
        for (i = 0; i < sec.lineCount; i++) {
          if (!(sec.lines[i].flags & MapLineFlag.TwoSided)) {
            continue
          }

          tsec = sec.lines[i].frontSector
          if (tsec === null) {
            continue
          }

          newSecNum = this.play.sectors.indexOf(tsec)

          if (secNum !== newSecNum) {
            continue
          }

          tsec = sec.lines[i].backSector
          if (tsec === null) {
            continue
          }
          newSecNum = this.play.sectors.indexOf(tsec)

          if (tsec.floorPic !== texture) {
            continue
          }

          height += stairSize

          if (tsec.specialData) {
            continue
          }

          sec = tsec
          secNum = newSecNum

          floor = new FloorMove(FloorType.LowerFloor, sec, this.moveFloor, this)
          this.tick.addThinker(floor)

          sec.specialData = floor
          floor.direction = 1
          floor.speed = speed
          floor.floorDestHeight = height
          ok = true
          break
        }
      } while (ok)
    }
    return rtn
  }
}
