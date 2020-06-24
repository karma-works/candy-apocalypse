import { DoorType } from './doors/door-type'
import { Doors } from './doors'
import { Floor } from './floor'
import { FloorType } from './floor/floor-type'
import { Game } from '../game/game'
import { Lights } from './lights'
import { Line } from '../rendering/line'
import { MObj } from './mobj'
import { MObjType } from '../doom/info'
import { MapLineFlag } from '../doom/data'
import { Play } from './setup'
import { Sector } from '../rendering/sector'
import { Side } from '../rendering/side'

export const GLOW_SPEED = 8
export const STROBE_BRIGHT = 5
const SLOW_DARK = 35

//
//      Animating line specials
//
const MAX_LINE_ANIMS = 64

export class Special {

  private get doors(): Doors {
    return this.play.doors
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

  constructor(private play: Play) { }

  //
  // UTILITIES
  //

  //
  // getSide()
  // Will return a side_t*
  //  given the number of the current sector,
  //  the line number, and the side (0/1) that you want.
  //
  getSide(currentSector: number, line: number, side: 0 | 1): Side {
    return this.play.sides[
      this.play.sectors[currentSector].lines[line].sideNum[side]
    ]
  }

  //
  // getSector()
  // Will return a sector_t*
  //  given the number of the current sector,
  //  the line number and the side (0/1) that you want.
  //
  getSector(currentSector: number, line: number, side: 0 | 1): Sector {
    return this.play.sides[
      this.play.sectors[currentSector].lines[line].sideNum[side]
    ].sector
  }

  //
  // twoSided()
  // Given the sector number and the line number,
  //  it will tell you whether the line is two-sided or not.
  //
  twoSided(sector: number, line: number): number {
    return this.play.sectors[sector].lines[line]
      .flags & MapLineFlag.TwoSided
  }

  //
  // RETURN NEXT SECTOR # THAT LINE TAG REFERS TO
  //
  findSectorFromLineTag(line: Line, start: number): number {
    for (let i = start + 1; i < this.play.numSectors; ++i) {
      if (this.play.sectors[i].tag === line.tag) {
        return i
      }
    }
    return -1
  }

  //
  // EVENTS
  // Events are operations triggered by using, crossing,
  // or shooting special lines, or by timed thinkers.
  //

  //
  // P_CrossSpecialLine - TRIGGER
  // Called every time a thing origin is about
  //  to cross a line with a non 0 special.
  //
  crossSpecialLine(lineNum: number, side: number, thing: MObj): void {
    let ok = false

    const line = this.play.lines[lineNum]

    // Triggers that other things can activate
    if (!thing.player) {
      // Things that should NOT trigger specials...
      switch (thing.type) {
      case MObjType.Rocket:
      case MObjType.Plasma:
      case MObjType.Bfg:
      case MObjType.Troopshot:
      case MObjType.Headshot:
      case MObjType.Bruisershot:
        return
      }

      ok = false
      /* eslint-disable line-comment-position */
      switch (line.special) {
      case 39: // TELEPORT TRIGGER
      case 97: // TELEPORT RETRIGGER
      case 125: // TELEPORT MONSTERONLY TRIGGER
      case 126: // TELEPORT MONSTERONLY RETRIGGER
      case 4: // RAISE DOOR
      case 10: // PLAT DOWN-WAIT-UP-STAY TRIGGER
      case 88: // PLAT DOWN-WAIT-UP-STAY RETRIGGER
        ok = true
        break
      }
      /* eslint-enable line-comment-position */
      if (!ok) {
        return
      }
    }

    // Note: could use some const's here.
    switch (line.special) {
    // TRIGGERS.
    // All from here to RETRIGGERS.
    case 2:
      // Open Door
      this.doors.evDoDoor(line, DoorType.Open)
      line.special = 0
      break

    case 3:
      // Close Door
      this.doors.evDoDoor(line, DoorType.Close)
      line.special = 0
      break

    case 4:
      // Raise Door
      this.doors.evDoDoor(line, DoorType.Normal)
      line.special = 0
      break

    case 5:
      // Raise Floor
      this.floor.evDoFloor(line, FloorType.RaiseFloor)
      line.special = 0
      break

    case 6:
      // Fast Ceiling Crush & Raise
      // EV_DoCeiling(line, fastCrushAndRaise);
      debugger
      line.special = 0
      break

    case 8:
      // Build Stairs
      // EV_BuildStairs(line, build8);
      debugger
      line.special = 0
      break

    case 10:
      // PlatDownWaitUp
      // EV_DoPlat(line, downWaitUpStay, 0);
      debugger
      line.special = 0
      break

    case 12:
      // Light Turn On - brightest near
      // EV_LightTurnOn(line, 0);
      debugger
      line.special = 0
      break

    case 13:
      // Light Turn On 255
      // EV_LightTurnOn(line, 255);
      debugger
      line.special = 0
      break

    case 16:
      // Close Door 30
      this.doors.evDoDoor(line, DoorType.Close30ThenOpen)
      line.special = 0
      break

    case 17:
      // Start Light Strobing
      // EV_StartLightStrobing(line);
      debugger
      line.special = 0
      break

    case 19:
      // Lower Floor
      this.floor.evDoFloor(line, FloorType.LowerFloor)
      line.special = 0
      break

    case 22:
      // Raise floor to nearest height and change texture
      // EV_DoPlat(line, raiseToNearestAndChange, 0);
      debugger
      line.special = 0
      break

    case 25:
      // Ceiling Crush and Raise
      // EV_DoCeiling(line, crushAndRaise);
      debugger
      line.special = 0
      break

    case 30:
      // Raise floor to shortest texture height
      //  on either side of lines.
      this.floor.evDoFloor(line, FloorType.RaiseToTexture)
      line.special = 0
      break

    case 35:
      // Lights Very Dark
      // EV_LightTurnOn(line, 35);
      debugger
      line.special = 0
      break

    case 36:
      // Lower Floor (TURBO)
      this.floor.evDoFloor(line, FloorType.TurboLower)
      line.special = 0
      break

    case 37:
      // LowerAndChange
      this.floor.evDoFloor(line, FloorType.LowerAndChange)
      line.special = 0
      break

    case 38:
      // Lower Floor To Lowest
      this.floor.evDoFloor(line, FloorType.LowerFloorToLowest)
      line.special = 0
      break

    case 39:
      // TELEPORT!
      // EV_Teleport(line, side, thing);
      debugger
      line.special = 0
      break

    case 40:
      // RaiseCeilingLowerFloor
      // EV_DoCeiling(line, raiseToHighest);
      this.floor.evDoFloor(line, FloorType.LowerFloorToLowest)
      line.special = 0
      break

    case 44:
      // Ceiling Crush
      // EV_DoCeiling(line, lowerAndCrush);
      debugger
      line.special = 0
      break

    case 52:
      // EXIT!
      // G_ExitLevel();
      debugger
      break

    case 53:
      // Perpetual Platform Raise
      // EV_DoPlat(line, perpetualRaise, 0);
      debugger
      line.special = 0
      break

    case 54:
      // Platform Stop
      // EV_StopPlat(line);
      debugger
      line.special = 0
      break

    case 56:
      // Raise Floor Crush
      this.floor.evDoFloor(line, FloorType.RaiseFloorCrush)
      line.special = 0
      break

    case 57:
      // Ceiling Crush Stop
      // EV_CeilingCrushStop(line);
      debugger
      line.special = 0
      break

    case 58:
      // Raise Floor 24
      this.floor.evDoFloor(line, FloorType.RaiseFloor24)
      line.special = 0
      break

    case 59:
      // Raise Floor 24 And Change
      this.floor.evDoFloor(line, FloorType.RaiseFloor24AndChange)
      line.special = 0
      break

    case 104:
      // Turn lights off in sector(tag)
      // EV_TurnTagLightsOff(line);
      debugger
      line.special = 0
      break

    case 108:
      // Blazing Door Raise (faster than TURBO!)
      this.doors.evDoDoor(line, DoorType.BlazeRaise)
      line.special = 0
      break

    case 109:
      // Blazing Door Open (faster than TURBO!)
      this.doors.evDoDoor(line, DoorType.BlazeOpen)
      line.special = 0
      break

    case 100:
      // Build Stairs Turbo 16
      // EV_BuildStairs(line, turbo16);
      debugger
      line.special = 0
      break

    case 110:
      // Blazing Door Close (faster than TURBO!)
      this.doors.evDoDoor(line, DoorType.BlazeClose)
      line.special = 0
      break

    case 119:
      // Raise floor to nearest surr. floor
      this.floor.evDoFloor(line, FloorType.RaiseFloorToNearest)
      line.special = 0
      break

    case 121:
      // Blazing PlatDownWaitUpStay
      // EV_DoPlat(line, blazeDWUS, 0);
      debugger
      line.special = 0
      break

    case 124:
      // Secret EXIT
      // G_SecretExitLevel();
      debugger
      break

    case 125:
      // TELEPORT MonsterONLY
      if (!thing.player) {
        // EV_Teleport(line, side, thing);
        debugger
        line.special = 0
      }
      break

    case 130:
      // Raise Floor Turbo
      this.floor.evDoFloor(line, FloorType.RaiseFloorTurbo)
      line.special = 0
      break

    case 141:
      // Silent Ceiling Crush & Raise
      // EV_DoCeiling(line, silentCrushAndRaise);
      debugger
      line.special = 0
      break

    // RETRIGGERS.  All from here till end.
    case 72:
      // Ceiling Crush
      // EV_DoCeiling(line, lowerAndCrush);
      debugger
      break

    case 73:
      // Ceiling Crush and Raise
      // EV_DoCeiling(line, crushAndRaise);
      debugger
      break

    case 74:
      // Ceiling Crush Stop
      // EV_CeilingCrushStop(line);
      debugger
      break

    case 75:
      // Close Door
      this.doors.evDoDoor(line, DoorType.Close)
      break

    case 76:
      // Close Door 30
      this.doors.evDoDoor(line, DoorType.Close30ThenOpen)
      break

    case 77:
      // Fast Ceiling Crush & Raise
      // EV_DoCeiling(line, fastCrushAndRaise);
      debugger
      break

    case 79:
      // Lights Very Dark
      // EV_LightTurnOn(line, 35);
      debugger
      break

    case 80:
      // Light Turn On - brightest near
      // EV_LightTurnOn(line, 0);
      debugger
      break

    case 81:
      // Light Turn On 255
      // EV_LightTurnOn(line, 255);
      debugger
      break

    case 82:
      // Lower Floor To Lowest
      this.floor.evDoFloor(line, FloorType.LowerFloorToLowest)
      break

    case 83:
      // Lower Floor
      this.floor.evDoFloor(line, FloorType.LowerFloor)
      break

    case 84:
      // LowerAndChange
      this.floor.evDoFloor(line, FloorType.LowerAndChange)
      break

    case 86:
      // Open Door
      this.doors.evDoDoor(line, DoorType.Open)
      break

    case 87:
      // Perpetual Platform Raise
      // EV_DoPlat(line, perpetualRaise, 0);
      debugger
      break

    case 88:
      // PlatDownWaitUp
      // EV_DoPlat(line, downWaitUpStay, 0);
      debugger
      break

    case 89:
      // Platform Stop
      // EV_StopPlat(line);
      debugger
      break

    case 90:
      // Raise Door
      this.doors.evDoDoor(line, DoorType.Normal)
      break

    case 91:
      // Raise Floor
      this.floor.evDoFloor(line, FloorType.RaiseFloor)
      break

    case 92:
      // Raise Floor 24
      this.floor.evDoFloor(line, FloorType.RaiseFloor24)
      break

    case 93:
      // Raise Floor 24 And Change
      this.floor.evDoFloor(line, FloorType.RaiseFloor24AndChange)
      break

    case 94:
      // Raise Floor Crush
      this.floor.evDoFloor(line, FloorType.RaiseFloorCrush)
      break

    case 95:
      // Raise floor to nearest height
      // and change texture.
      // EV_DoPlat(line, raiseToNearestAndChange, 0);
      debugger
      break

    case 96:
      // Raise floor to shortest texture height
      // on either side of lines.
      this.floor.evDoFloor(line, FloorType.RaiseToTexture)
      break

    case 97:
      // TELEPORT!
      // EV_Teleport(line, side, thing);
      debugger
      break

    case 98:
      // Lower Floor (TURBO)
      this.floor.evDoFloor(line, FloorType.TurboLower)
      break

    case 105:
      // Blazing Door Raise (faster than TURBO!)
      this.doors.evDoDoor(line, DoorType.BlazeRaise)
      break

    case 106:
      // Blazing Door Open (faster than TURBO!)
      this.doors.evDoDoor(line, DoorType.BlazeOpen)
      break

    case 107:
      // Blazing Door Close (faster than TURBO!)
      this.doors.evDoDoor(line, DoorType.BlazeClose)
      break

    case 120:
      // Blazing PlatDownWaitUpStay.
      // EV_DoPlat(line, blazeDWUS, 0);
      debugger
      break

    case 126:
      // TELEPORT MonsterONLY.
      if (!thing.player) {
        // EV_Teleport(line, side, thing);
        debugger
      }
      break

    case 128:
      // Raise To Nearest Floor
      this.floor.evDoFloor(line, FloorType.RaiseFloorToNearest)
      break

    case 129:
      // Raise Floor Turbo
      this.floor.evDoFloor(line, FloorType.RaiseFloorTurbo)
      break
    }
  }

  //
  // SPECIAL SPAWNING
  //

  //
  // P_SpawnSpecials
  // After the map has been loaded, scan for specials
  //  that spawn thinkers
  //
  private numLineSpecials = 0
  private lineSpecialList = Array.from({ length: MAX_LINE_ANIMS },
    () => new Line())

  spawnSpecials(): void {
    // Init special SECTORs.
    let sector: Sector
    for (let i = 0; i < this.play.numSectors; ++i) {
      sector = this.play.sectors[i]

      if (!sector.special) {
        continue
      }

      switch (sector.special) {
      case 1:
        // FLICKERING LIGHTS
        this.lights.spawnLightFlash(sector)
        break

      case 2:
        // STROBE FAST
        debugger
        break
      case 3:
        // STROBE SLOW
        debugger
        break
      case 4:
        // STROBE FAST/DEATH SLIME
        debugger
        break
      case 8:
        // GLOWING LIGHT
        this.lights.spawnGlowingLight(sector)
        break
      case 9:
        // SECRET SECTOR *
        this.game.totalSecret++
        break
      case 10:
        // DOOR CLOSE IN 30 SECONDS
        this.doors.spawnDoorCloseIn30(sector)
        break
      case 12:
        // SYNC STROBE SLOW *
        this.lights.spawnStrobeFlash(sector, SLOW_DARK, 1)
        break
      case 13:
        // SYNC STROBE FAST
        debugger
        break
      case 14:
        // DOOR RAISE IN 5 MINUTES
        this.doors.spawnDoorRaiseIn5mins(sector)
        break
      case 17:
        debugger
        break
      }
    }

    // Init line EFFECTs
    this.numLineSpecials = 0
    for (let i = 0; i < this.play.numLines; ++i) {
      switch (this.play.lines[i].special) {
      case 48:
        // EFFECT FIRSTCOL SCROLL+
        this.lineSpecialList[this.numLineSpecials] =
          this.play.lines[i]
        this.numLineSpecials++
        break
      }
    }

  }

}
