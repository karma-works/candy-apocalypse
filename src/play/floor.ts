import { Map } from './map'
import { Play } from './setup'
import { Result } from './specials/result'
import { Sector } from '../rendering/sector'

//
// FLOORS
//
export class Floor {

  private get map(): Map {
    return this.play.map
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
          lastPos = sector.ceilingHeight
          sector.ceilingHeight -= speed
          flag = this.map.changeSector(sector, crush)
          if (flag) {
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
          // COULD GET CRUSHED
          lastPos = sector.ceilingHeight
          sector.ceilingHeight += speed
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
      }
      break
    }

    return Result.Ok
  }
}
