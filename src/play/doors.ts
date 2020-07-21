import { DOOR_SPEED, DOOR_WAIT, Door } from './doors/door'
import { Card } from '../global/doomdef'
import { Sound as DSound } from '../doom/sound'
import { DoorType } from './doors/door-type'
import { FRACUNIT } from '../misc/fixed'
import { Floor } from './floor'
import { Line } from '../rendering/defs/line'
import { MObj } from './mobj/mobj'
import { Play } from './setup'
import { Result } from './specials/result'
import { Sector } from '../rendering/defs/sector'
import { Sfx } from '../doom/sounds/sfx'
import { Special } from './special'
import { Strings } from '../translation/strings'
import { Tick } from './tick'

export class Doors {
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
  verticalDoor(door: Door): void {
    let res: Result
    switch (door.direction) {
    case 0:
      // WAITING
      if (!--door.topCountDown) {
        switch (door.type) {
        case DoorType.BlazeRaise:
          // time to go back down
          door.direction = -1
          this.dSound.startSound(door.sector.soundOrg, Sfx.Bdcls)
          break
        case DoorType.Normal:
          // time to go back down
          door.direction = -1
          this.dSound.startSound(door.sector.soundOrg, Sfx.Dorcls)
          break
        case DoorType.Close30ThenOpen:
          door.direction = 1
          this.dSound.startSound(door.sector.soundOrg, Sfx.Doropn)
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
          this.dSound.startSound(door.sector.soundOrg, Sfx.Doropn)
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
          this.dSound.startSound(door.sector.soundOrg, Sfx.Bdcls)
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
          this.dSound.startSound(door.sector.soundOrg, Sfx.Doropn)
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
  evDoLockedDoor(line: Line, type: DoorType, thing: MObj): number {
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
        this.dSound.startSound(null, Sfx.Oof)
        return 0
      }
      break
    case 134:
    case 135:
      // Red Lock
      if (!p.cards[Card.RedCard] && !p.cards[Card.RedSkull]) {
        p.message = this.strings.pdRedo
        this.dSound.startSound(null, Sfx.Oof)
        return 0
      }
      break
    case 136:
    case 137:
      // Yellow Lock
      if (!p.cards[Card.YellowCard] && !p.cards[Card.YellowSkull]) {
        p.message = this.strings.pdYellowo
        this.dSound.startSound(null, Sfx.Oof)
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

    while ((secNum = this.special.findSectorFromLineTag(line, secNum)) >= 0) {
      sec = this.sectors[secNum]
      if (sec.specialData) {
        continue
      }

      // new door thinker
      rtn = 1

      door = new Door(
        this.verticalDoor,
        this,
        type,
        sec,
      )
      this.tick.addThinker(door)
      sec.specialData = door

      switch (type) {
      case DoorType.BlazeClose:
        door.topHeight = sec.findLowestCeilingSurrounding()
        door.topHeight -= 4 * FRACUNIT
        door.direction = -1
        door.speed = DOOR_SPEED * 4
        this.dSound.startSound(door.sector.soundOrg, Sfx.Bdcls)
        break

      case DoorType.Close:
        door.topHeight = sec.findLowestCeilingSurrounding()
        door.topHeight -= 4 * FRACUNIT
        door.direction = -1
        this.dSound.startSound(door.sector.soundOrg, Sfx.Dorcls)
        break

      case DoorType.Close30ThenOpen:
        door.topHeight = sec.ceilingHeight
        door.direction = -1
        this.dSound.startSound(door.sector.soundOrg, Sfx.Dorcls)
        break

      case DoorType.BlazeRaise:
      case DoorType.BlazeOpen:
        door.direction = 1
        door.topHeight = sec.findLowestCeilingSurrounding()
        door.topHeight -= 4 * FRACUNIT
        door.speed = DOOR_SPEED * 4
        if (door.topHeight !== sec.ceilingHeight) {
          this.dSound.startSound(door.sector.soundOrg, Sfx.Bdopn)
        }
        break

      case DoorType.Normal:
      case DoorType.Open:
        door.direction = 1
        door.topHeight = sec.findLowestCeilingSurrounding()
        door.topHeight -= 4 * FRACUNIT
        if (door.topHeight !== sec.ceilingHeight) {
          this.dSound.startSound(door.sector.soundOrg, Sfx.Doropn)
        }
        break

      }
    }

    return rtn
  }

  //
  // EV_VerticalDoor : open a door manually, no tag value
  //
  evVerticalDoor(line: Line, thing: MObj): void {
    // only front sides can be used
    const side = 0

    // Check for locks
    const player = thing.player

    switch (line.special) {
    case 26:
    case 32:
      // Blue Lock
      if (player === null) {
        return
      }
      if (!player.cards[Card.BlueCard] && !player.cards[Card.BlueSkull]) {
        player.message = this.strings.pdBluek
        this.dSound.startSound(null, Sfx.Oof)
        return
      }
      break
    case 27:
    case 34:
      // Yellow Lock
      if (player === null) {
        return
      }
      if (!player.cards[Card.YellowCard] && !player.cards[Card.YellowSkull]) {
        player.message = this.strings.pdYellowk
        this.dSound.startSound(null, Sfx.Oof)
        return
      }
      break
    case 28:
    case 33:
      // Red Lock
      if (player === null) {
        return
      }
      if (!player.cards[Card.RedCard] && !player.cards[Card.RedSkull]) {
        player.message = this.strings.pdRedk
        this.dSound.startSound(null, Sfx.Oof)
        return
      }
      break
    }

    // if the sector has an active thinker, use it
    const sec = this.play.sides[line.sideNum[side ^ 1]].sector

    let door: Door
    if (sec.specialData) {
      door = sec.specialData as Door
      switch (line.special) {
      // ONLY FOR "RAISE" DOORS, NOT "OPEN"s
      case 1:
      case 26:
      case 27:
      case 28:
      case 117:
        if (door.direction === -1) {
          // go back up
          door.direction = 1
        } else {
          if (!thing.player) {
            // JDC: bad guys never close doors
            return
          }
          // start going down immediately
          door.direction = -1
        }
        return
      }
    }

    // for proper sound
    switch (line.special) {
    // BLAZING DOOR RAISE/OPEN
    case 117:
    case 118:
      this.dSound.startSound(sec.soundOrg, Sfx.Bdopn)
      break

    // NORMAL DOOR SOUND
    case 1:
    case 31:
      this.dSound.startSound(sec.soundOrg, Sfx.Doropn)
      break

    // LOCKED DOOR SOUND
    default:
      this.dSound.startSound(sec.soundOrg, Sfx.Doropn)
      break
    }

    // new door thinker
    door = new Door(this.verticalDoor, this, 0, sec)
    this.tick.addThinker(door)
    sec.specialData = door

    // new door thinker
    door.direction = 1
    door.speed = DOOR_SPEED
    door.topWait = DOOR_WAIT
    door.topCountDown = 0

    switch (line.special) {
    case 1:
    case 26:
    case 27:
    case 28:
      door.type = DoorType.Normal
      break

    case 31:
    case 32:
    case 33:
    case 34:
      door.type = DoorType.Open
      line.special = 0
      break

    case 117:
      // blazing door raise
      door.type = DoorType.BlazeRaise
      door.speed = DOOR_SPEED * 4
      break
    case 118:
      // blazing door open
      door.type = DoorType.BlazeOpen
      line.special = 0
      door.speed = DOOR_SPEED * 4
      break
    }

    // find the top and bottom of the movement range
    door.topHeight = sec.findLowestCeilingSurrounding()
    door.topHeight -= 4 * FRACUNIT
  }

  //
  // Spawn a door that closes after 30 seconds
  //
  spawnDoorCloseIn30(sec: Sector): void {
    const door = new Door(
      this.verticalDoor,
      this,
      DoorType.Normal,
      sec,
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
      this.verticalDoor,
      this,
      DoorType.RaiseIn5Mins,
      sec,
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
