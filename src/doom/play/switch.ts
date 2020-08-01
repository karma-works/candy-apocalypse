import { BUTTON_TIME, Button, MAX_BUTTONS, Where } from './switch/button'
import { CeilingType } from './ceiling/ceiling-type'
import { Ceilings } from './ceilings'
import { Sound as DSound } from '../doom/sound'
import { Data } from '../rendering/data'
import { Doom } from '../doom'
import { DoorType } from './doors/door-type'
import { Doors } from './doors'
import { Floor } from './floor'
import { FloorType } from './floor/floor-type'
import { Game } from '../game/game'
import { GameMode } from '../doom/mode'
import { Lights } from './lights'
import { Line } from '../rendering/defs/line'
import { MObj } from './mobj/mobj'
import { MapLineFlag } from '../doom/data'
import { PlatType } from './plats/plat-type'
import { Plats } from './plats'
import { Play } from './setup'
import { Sfx } from '../doom/sounds/sfx'
import { StairType } from './floor/stair-type'
import { alphSwitchList } from './switch/switch-list'

// max # of wall switches in a level
const MAX_SWITCHES = 50

export class Switch {

  private switchList = new Array<number>(MAX_SWITCHES * 2).fill(0)
  private numSwitches = 0
  buttonList = Array.from({ length: MAX_BUTTONS }, () => new Button())

  private get ceilings(): Ceilings {
    return this.play.ceilings
  }
  private get data(): Data {
    return this.play.rendering.data
  }
  private get doom(): Doom {
    return this.play.doom
  }
  private get doors(): Doors {
    return this.play.doors
  }
  private get dSound(): DSound {
    return this.play.dSound
  }
  private get floor(): Floor {
    return this.play.floor
  }
  private get game(): Game {
    return this.play.game
  }
  private get lights(): Lights {
    return this.play.lights
  }
  private get plats(): Plats {
    return this.play.plats
  }

  constructor(private play: Play) { }

  //
  // P_InitSwitchList
  // Only called at game initialization.
  //
  initSwitchList(): void {
    const gameMode = this.doom.gameMode

    let episode = 1

    if (gameMode === GameMode.Registered) {
      episode = 2
    } else {
      if (gameMode === GameMode.Commercial) {
        episode = 3
      }
    }

    for (let index = 0, i = 0; i < MAX_SWITCHES; ++i) {
      if (!alphSwitchList[i][2]) {
        this.numSwitches = index / 2 >> 0
        this.switchList[index] = -1
        break
      }

      if (alphSwitchList[i][2] <= episode) {
        this.switchList[index++] = this.data.textureNumForName(alphSwitchList[i][0])
        this.switchList[index++] = this.data.textureNumForName(alphSwitchList[i][1])
      }
    }
  }

  //
  // Start a button counting down till it turns off.
  //
  private startButton(line: Line, w: Where, texture: number, time: number): void {
    // See if button is already pressed
    for (let i = 0; i < MAX_BUTTONS; ++i) {
      if (this.buttonList[i].bTimer &&
        this.buttonList[i].line === line
      ) {
        return
      }
    }

    if (line.frontSector === null) {
      throw 'line.frontSector = null'
    }

    for (let i = 0; i < MAX_BUTTONS; i++) {
      if (!this.buttonList[i].bTimer) {
        this.buttonList[i].line = line
        this.buttonList[i].where = w
        this.buttonList[i].bTexture = texture
        this.buttonList[i].bTimer = time
        this.buttonList[i].soundOrg = line.frontSector.soundOrg
        return
      }
    }

    throw 'P_StartButton: no button slots left!'
  }

  //
  // Function that changes wall texture.
  // Tell it if switch is ok to use again (1=yes, it's a button).
  //
  changeSwitchTexture(line: Line, useAgain: boolean): void {
    if (!useAgain) {
      line.special = 0

      const texTop = this.play.sides[line.sideNum[0]].topTexture
      const texMid = this.play.sides[line.sideNum[0]].midTexture
      const texBot = this.play.sides[line.sideNum[0]].bottomTexture

      let sound = Sfx.Swtchn

      // EXIT SWITCH?
      if (line.special === 11) {
        sound = Sfx.Swtchx
      }

      for (let i = 0; i < this.numSwitches * 2; ++i) {
        if (this.switchList[i] === texTop) {
          this.dSound.startSound(this.buttonList[0].soundOrg, sound)
          this.play.sides[line.sideNum[0]].topTexture = this.switchList[i ^ 1]

          if (useAgain) {
            this.startButton(line, Where.Top, this.switchList[i], BUTTON_TIME)
          }

          return
        } else if (this.switchList[i] === texMid) {
          this.dSound.startSound(this.buttonList[0].soundOrg, sound)
          this.play.sides[line.sideNum[0]].midTexture = this.switchList[i ^ 1]

          if (useAgain) {
            this.startButton(line, Where.Middle, this.switchList[i], BUTTON_TIME)
          }

          return
        } else if (this.switchList[i] === texBot) {
          this.dSound.startSound(this.buttonList[0].soundOrg, sound)
          this.play.sides[line.sideNum[0]].bottomTexture = this.switchList[i ^ 1]

          if (useAgain) {
            this.startButton(line, Where.Bottom, this.switchList[i], BUTTON_TIME)
          }

          return
        }
      }
    }
  }

  //
  // P_UseSpecialLine
  // Called when a thing uses a special line.
  // Only the front sides of lines are usable.
  //
  useSpecialLine(thing: MObj, line: Line, side: 0 | 1): boolean {

    // Err...
    // Use the back sides of VERY SPECIAL lines...
    if (side) {
      switch (line.special) {
      case 124:
        // Sliding door open&close
        // UNUSED?
        break

      default:
        return false
      }
    }

    // Switches that other things can activate.
    if (!thing.player) {
      // never open secret doors
      if (line.flags & MapLineFlag.Secret) {
        return false
      }

      /* eslint-disable line-comment-position */
      switch (line.special) {
      case 1: // MANUAL DOOR RAISE
      case 32: // MANUAL BLUE
      case 33: // MANUAL RED
      case 34: // MANUAL YELLOW
        break
      default:
        return false
      }
      /* eslint-enable line-comment-position */
    }

    /* eslint-disable line-comment-position */
    // Note: could use some const's here.
    switch (line.special) {
    case 1: // Vertical Door
    case 26: // Blue Door/Locked
    case 27: // Yellow Door /Locked
    case 28: // Red Door /Locked
    case 31: // Manual door open
    case 32: // Blue locked door open
    case 33: // Red locked door open
    case 34: // Yellow locked door open
    case 117: // Blazing door raise
    case 118: // Blazing door open
      this.doors.evVerticalDoor(line, thing)
      break

      //UNUSED - Door Slide Open&Close
      // case 124:
      // EV_SlidingDoor (line, thing);
      // break;

      // SWITCHES
    case 7:
      // Build Stairs
      if (this.floor.evBuildStairs(line, StairType.Build8)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 9:
      // Change Donut
      if (this.floor.evDoDonut(line)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 11:
      // Exit level
      this.changeSwitchTexture(line, false)
      this.game.exitLevel()
      break

    case 14:
      // Raise Floor 32 and change texture
      if (this.plats.evDoPlat(line, PlatType.RaiseAndChange, 32)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 15:
      // Raise Floor 24 and change texture
      if (this.plats.evDoPlat(line, PlatType.RaiseAndChange, 24)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 18:
      // Raise Floor to next highest floor
      if (this.floor.evDoFloor(line, FloorType.RaiseFloorToNearest)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 20:
      // Raise Plat next highest floor and change texture
      if (this.plats.evDoPlat(line, PlatType.RaiseToNearestAndChange, 0)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 21:
      // PlatDownWaitUpStay
      if (this.plats.evDoPlat(line, PlatType.DownWaitUpStay, 0)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 23:
      // Lower Floor to Lowest
      if (this.floor.evDoFloor(line, FloorType.LowerFloorToLowest)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 29:
      // Raise Door
      if (this.doors.evDoDoor(line, DoorType.Normal)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 41:
      // Lower Ceiling to Floor
      if (this.ceilings.evDoCeiling(line, CeilingType.LowerToFloor)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 71:
      // Turbo Lower Floor
      if (this.floor.evDoFloor(line, FloorType.TurboLower)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 49:
      // Ceiling Crush And Raise
      if (this.ceilings.evDoCeiling(line, CeilingType.CrushAndRaise)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 50:
      // Close Door
      if (this.doors.evDoDoor(line, DoorType.Close)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 51:
      // Secret EXIT
      // P_ChangeSwitchTexture(line, 0)
      // G_SecretExitLevel()
      debugger
      break

    case 55:
      // Raise Floor Crush
      if (this.floor.evDoFloor(line, FloorType.RaiseFloorCrush)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 101:
      // Raise Floor
      if (this.floor.evDoFloor(line, FloorType.RaiseFloor)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 102:
      // Lower Floor to Surrounding floor height
      if (this.floor.evDoFloor(line, FloorType.LowerFloor)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 103:
      // Open Door
      if (this.doors.evDoDoor(line, DoorType.Open)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 111:
      // Blazing Door Raise (faster than TURBO!)
      if (this.doors.evDoDoor(line, DoorType.BlazeRaise)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 112:
      // Blazing Door Open (faster than TURBO!)
      if (this.doors.evDoDoor(line, DoorType.BlazeOpen)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 113:
      // Blazing Door Close (faster than TURBO!)
      if (this.doors.evDoDoor(line, DoorType.BlazeClose)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 122:
      // Blazing PlatDownWaitUpStay
      if (this.plats.evDoPlat(line, PlatType.BlazeDWUS, 0)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 127:
      // Build Stairs Turbo 16
      if (this.floor.evBuildStairs(line, StairType.Turbo16)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 131:
      // Raise Floor Turbo
      if (this.floor.evDoFloor(line, FloorType.RaiseFloorTurbo)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 133: // BlzOpenDoor BLUE
    case 135: // BlzOpenDoor RED
    case 137: // BlzOpenDoor YELLOW
      if (this.doors.evDoLockedDoor(line, DoorType.BlazeOpen, thing)) {
        this.changeSwitchTexture(line, false)
      }
      break

    case 140:
      // Raise Floor 512
      if (this.floor.evDoFloor(line, FloorType.RaiseFloor512)) {
        this.changeSwitchTexture(line, false)
      }
      break

      // BUTTONS
    case 42:
      // Close Door
      if (this.doors.evDoDoor(line, DoorType.Close)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 43:
      // Lower Ceiling to Floor
      if (this.ceilings.evDoCeiling(line, CeilingType.LowerToFloor)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 45:
      // Lower Floor to Surrounding floor height
      if (this.floor.evDoFloor(line, FloorType.LowerFloor)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 60:
      // Lower Floor to Lowest
      if (this.floor.evDoFloor(line, FloorType.LowerFloorToLowest)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 61:
      // Open Door
      if (this.doors.evDoDoor(line, DoorType.Open)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 62:
      // PlatDownWaitUpStay
      if (this.plats.evDoPlat(line, PlatType.DownWaitUpStay, 1)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 63:
      // Raise Door
      if (this.doors.evDoDoor(line, DoorType.Normal)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 64:
      // Raise Floor to ceiling
      if (this.floor.evDoFloor(line, FloorType.RaiseFloor)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 66:
      // Raise Floor 24 and change texture
      if (this.plats.evDoPlat(line, PlatType.RaiseAndChange, 24)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 67:
      // Raise Floor 32 and change texture
      if (this.plats.evDoPlat(line, PlatType.RaiseAndChange, 32)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 65:
      // Raise Floor Crush
      if (this.floor.evDoFloor(line, FloorType.RaiseFloorCrush)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 68:
      // Raise Plat to next highest floor and change texture
      if (this.plats.evDoPlat(line, PlatType.RaiseToNearestAndChange, 0)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 69:
      // Raise Floor to next highest floor
      if (this.floor.evDoFloor(line, FloorType.RaiseFloorToNearest)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 70:
      // Turbo Lower Floor
      if (this.floor.evDoFloor(line, FloorType.TurboLower)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 114:
      // Blazing Door Raise (faster than TURBO!)
      if (this.doors.evDoDoor(line, DoorType.BlazeRaise)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 115:
      // Blazing Door Open (faster than TURBO!)
      if (this.doors.evDoDoor(line, DoorType.BlazeOpen)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 116:
      // Blazing Door Close (faster than TURBO!)
      if (this.doors.evDoDoor(line, DoorType.BlazeClose)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 123:
      // Blazing PlatDownWaitUpStay
      if (this.plats.evDoPlat(line, PlatType.BlazeDWUS, 0)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 132:
      // Raise Floor Turbo
      if (this.floor.evDoFloor(line, FloorType.RaiseFloorTurbo)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 99: // BlzOpenDoor BLUE
    case 134: // BlzOpenDoor RED
    case 136: // BlzOpenDoor YELLOW
      if (this.doors.evDoLockedDoor(line, DoorType.BlazeOpen, thing)) {
        this.changeSwitchTexture(line, true)
      }
      break

    case 138:
      // Light Turn On
      this.lights.evLightTurnOn(line, 255)
      this.changeSwitchTexture(line, true)
      break

    case 139:
      // Light Turn Off
      this.lights.evLightTurnOn(line, 35)
      this.changeSwitchTexture(line, true)
      break
    }
    /* eslint-enable line-comment-position */

    return true
  }
}
