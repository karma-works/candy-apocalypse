import { DOOR_SPEED, Door } from './doors/door'
import { Card } from '../global/doomdef'
import { DoorType } from './doors/door-type'
import { FRACUNIT } from '../misc/fixed'
import { Floor } from './floor'
import { Line } from '../rendering/line'
import { MObj } from './mobj'
import { Play } from './setup'
import { Result } from './specials/result'
import { Sector } from '../rendering/sector'
import { Special } from './special'
import { Strings } from '../translation/strings'
import { Tick } from './tick'

export class Doors {

  private get floor(): Floor {
    return this.play.floor
  }
  private get special(): Special {
    return this.play.special
  }
  private get strings(): Strings {
    return this.play.doom.strings
  }
  private get tick(): Tick {
    return this.play.tick
  }
  constructor(private play: Play) { }

  //
  // VERTICAL DOORS
  //

  //
  // T_VerticalDoor
  //
  private async verticalDoor(door: Door): Promise<void> {
    let res: Result
    switch (door.direction) {
    case 0:
      // WAITING
      if (!--door.topCountDown) {
        switch (door.type) {
        case DoorType.BlazeRaise:
          // time to go back down
          door.direction = -1
          break
        case DoorType.Normal:
          // time to go back down
          door.direction = -1
          break
        case DoorType.Close30ThenOpen:
          door.direction = 1
          break
        }
      }
      break

    case 2:
      // INITIAL WAIT
      if (!--door.topCountDown) {
        switch (door.type) {
        case DoorType.RaiseIn5Mins:
          door.direction = 1
          door.type = DoorType.Normal
          break
        }
      }
      break

    case -1:
      // DOWN
      res = this.floor.movePlane(
        door.sector,
        door.speed,
        door.sector.floorHeight,
        false,
        1,
        door.direction,
      )
      if (res === Result.PastDest) {
        switch (door.type) {
        case DoorType.BlazeRaise:
        case DoorType.BlazeClose:
          door.sector.specialData = null
          // unlink and free
          this.tick.removeThinker(door)
          break
        case DoorType.Normal:
        case DoorType.Close:
          door.sector.specialData = null
          // unlink and free
          this.tick.removeThinker(door)
          break
        case DoorType.Close30ThenOpen:
          door.direction = 0
          door.topCountDown = 35 * 30
          break
        }
      } else if (res === Result.Crushed) {
        switch (door.type) {
        case DoorType.BlazeClose:
        case DoorType.Close:
          // DO NOT GO BACK UP!
          break
        default:
          door.direction = 1
          break
        }
      }
      break

    case 1:
      // UP
      res = this.floor.movePlane(
        door.sector,
        door.speed,
        door.topHeight,
        false,
        1,
        door.direction,
      )
      if (res === Result.PastDest) {
        switch (door.type) {
        case DoorType.BlazeRaise:
        case DoorType.Normal:
          // wait at top
          door.direction = 0
          door.topCountDown = door.topWait
          break
        case DoorType.Close30ThenOpen:
        case DoorType.BlazeOpen:
        case DoorType.Open:
          door.sector.specialData = null
          // unlink and free
          this.tick.removeThinker(door)
          break
        }
      }
      break
    }
  }

  //
  // EV_DoLockedDoor
  // Move a locked door up/down
  //
  private doLockedDoor(line: Line, type: DoorType, thing: MObj): number {
    const p = thing.player
    if (!p) {
      return 0
    }

    switch (line.special) {
    case 99:
    case 133:
      // Blue Lock
      if (!p.cards[Card.BlueCard] && !p.cards[Card.BlueSkull]) {
        p.message = this.strings.pdBlueo
        return 0
      }
      break
    case 134:
    case 135:
      // Red Lock
      if (!p.cards[Card.RedCard] && !p.cards[Card.RedSkull]) {
        p.message = this.strings.pdRedo
        return 0
      }
      break
    case 136:
    case 137:
      // Yellow Lock
      if (!p.cards[Card.YellowCard] && !p.cards[Card.YellowSkull]) {
        p.message = this.strings.pdYellowo
        return 0
      }
      break
    }

    return this.evDoDoor(line, type)
  }

  evDoDoor(line: Line, type: DoorType): number {
    let secNum = -1
    let rtn = 0
    let sec: Sector
    let door: Door

    while ((secNum = this.special.findSectorFromLineTag(line, secNum)) !== 0) {
      sec = this.play.sectors[secNum]
      if (sec.specialData) {
        continue
      }

      // new door thinker
      rtn = 1

      door = new Door(
        type,
        sec,
        this.verticalDoor,
        this,
      )

      switch (type) {
      case DoorType.BlazeClose:
        door.topHeight = sec.findLowestCeilingSurrounding()
        door.topHeight -= 4 * FRACUNIT
        door.direction = -1
        door.speed = DOOR_SPEED * 4
        break

      case DoorType.Close:
        door.topHeight = sec.findLowestCeilingSurrounding()
        door.topHeight -= 4 * FRACUNIT
        door.direction = -1
        break

      case DoorType.Close30ThenOpen:
        door.topHeight = sec.ceilingHeight
        door.direction = -1
        break

      case DoorType.BlazeRaise:
      case DoorType.BlazeOpen:
        door.direction = 1
        door.topHeight = sec.findLowestCeilingSurrounding()
        door.topHeight -= 4 * FRACUNIT
        door.speed = DOOR_SPEED * 4
        break

      case DoorType.Normal:
      case DoorType.Open:
        door.direction = 1
        door.topHeight = sec.findLowestCeilingSurrounding()
        door.topHeight -= 4 * FRACUNIT
        break

      }
    }

    return rtn
  }

  //
  // Spawn a door that closes after 30 seconds
  //
  spawnDoorCloseIn30(sec: Sector): void {
    const door = new Door(
      DoorType.Normal,
      sec,
      this.verticalDoor,
      this,
    )
    this.tick.addThinker(door)

    sec.specialData = door
    sec.special = 0

    door.direction = 0
    door.topCountDown = 30 * 35
  }

  //
  // Spawn a door that opens after 5 minutes
  //
  spawnDoorRaiseIn5mins(sec: Sector): void {
    const door = new Door(
      DoorType.RaiseIn5Mins,
      sec,
      this.verticalDoor,
      this,
    )
    this.tick.addThinker(door)

    sec.specialData = door
    sec.special = 0

    door.direction = 2
    door.topHeight = sec.findLowestCeilingSurrounding()
    door.topHeight -= 4 * FRACUNIT
    door.topCountDown = 5 * 30 * 35
  }
}
