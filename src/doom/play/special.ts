import { Anim, MAX_ANIMS, MAX_LINE_ANIMS, animDefs } from './specials/anim'
import { Button, MAX_BUTTONS, Where } from './switch/button'
import { Cheat, Player } from '../doom/player'
import { CeilingType } from './ceiling/ceiling-type'
import { Ceilings } from './ceilings'
import { Sound as DSound } from '../doom/sound'
import { Data } from '../rendering/data'
import { Doom } from '../doom'
import { DoorType } from './doors/door-type'
import { Doors } from './doors'
import { FRACUNIT } from '../misc/fixed'
import { Floor } from './floor'
import { FloorType } from './floor/floor-type'
import { Game } from '../game/game'
import { GameVersion } from '../doom/mode'
import { Inter } from './inter'
import { Lights } from './lights'
import { Line } from '../rendering/defs/line'
import { LumpReader } from '../wad/lump-reader'
import { MObj } from './mobj/mobj'
import { MObjType } from '../doom/info/mobj-type'
import { MapLineFlag } from '../doom/data'
import { PlatType } from './plats/plat-type'
import { Plats } from './plats'
import { Play } from './setup'
import { PowerType } from '../global/doomdef'
import { Sector } from '../rendering/defs/sector'
import { SfxName } from '../doom/sounds/sfx-name'
import { Side } from '../rendering/defs/side'
import { StairType } from './floor/stair-type'
import { Switch } from './switch'
import { Teleport } from './teleport'
import { Tick } from './tick'
import { random } from '../misc/random'

export const GLOW_SPEED = 8
export const STROBE_BRIGHT = 5
const FAST_DARK = 15
export const SLOW_DARK = 35

export class Special {

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
  private get inter(): Inter {
    return this.play.inter
  }
  private get lights(): Lights {
    return this.play.lights
  }
  private get plats(): Plats {
    return this.play.plats
  }
  private get switch(): Switch {
    return this.play.switch
  }
  private get teleport(): Teleport {
    return this.play.teleport
  }
  private get tick(): Tick {
    return this.play.tick
  }
  private get wad(): LumpReader {
    return this.play.wad
  }

  constructor(private play: Play) { }

  private anims = Array.from({ length: MAX_ANIMS }, () => new Anim())
  private lastAnim = this.anims[0]

  //
  //      Animating line specials
  //
  initPicAnims(): void {

    // Init animation
    let animPtr = 0
    this.lastAnim = this.anims[animPtr]

    for (let i = 0; animDefs[i]; i++) {
      if (animDefs[i].isTexture) {
        // different episode ?
        if (this.data.checkTextureNumForName(animDefs[i].startName) === -1) {
          continue
        }

        this.lastAnim.picNum = this.data.textureNumForName(animDefs[i].endName)
        this.lastAnim.basePic = this.data.textureNumForName(animDefs[i].startName)
      } else {
        if (this.wad.checkNumForName(animDefs[i].startName) === -1) {
          continue
        }

        this.lastAnim.picNum = this.data.flatNumForName(animDefs[i].endName)
        this.lastAnim.basePic = this.data.flatNumForName(animDefs[i].startName)
      }

      this.lastAnim.isTexture = animDefs[i].isTexture
      this.lastAnim.numPics = this.lastAnim.picNum - this.lastAnim.basePic + 1

      if (this.lastAnim.numPics < 2) {
        throw `P_InitPicAnims: bad cycle from ${animDefs[i].startName} to ${animDefs[i].endName}`
      }

      this.lastAnim.speed = animDefs[i].speed
      this.lastAnim = this.anims[animPtr++]
    }
  }

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
  crossSpecialLine(lineNum: number, side: 0 | 1, thing: MObj): void {
    let ok = false

    const line = this.play.lines[lineNum]

    if (this.doom.gameVersion <= GameVersion.Doom12) {
      if (line.special > 98 && line.special !== 104) {
        return
      }
    } else {
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
      }
    }

    // Triggers that other things can activate
    if (!thing.player) {
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
      this.ceilings.evDoCeiling(line, CeilingType.FastCrushAndRaise)
      line.special = 0
      break

    case 8:
      // Build Stairs
      this.floor.evBuildStairs(line, StairType.Build8)
      line.special = 0
      break

    case 10:
      // PlatDownWaitUp
      this.plats.evDoPlat(line, PlatType.DownWaitUpStay, 0)
      line.special = 0
      break

    case 12:
      // Light Turn On - brightest near
      this.lights.evLightTurnOn(line, 0)
      line.special = 0
      break

    case 13:
      // Light Turn On 255
      this.lights.evLightTurnOn(line, 255)
      line.special = 0
      break

    case 16:
      // Close Door 30
      this.doors.evDoDoor(line, DoorType.Close30ThenOpen)
      line.special = 0
      break

    case 17:
      // Start Light Strobing
      this.lights.evStartLightStrobing(line)
      line.special = 0
      break

    case 19:
      // Lower Floor
      this.floor.evDoFloor(line, FloorType.LowerFloor)
      line.special = 0
      break

    case 22:
      // Raise floor to nearest height and change texture
      this.plats.evDoPlat(line, PlatType.RaiseToNearestAndChange, 0)
      line.special = 0
      break

    case 25:
      // Ceiling Crush and Raise
      this.ceilings.evDoCeiling(line, CeilingType.CrushAndRaise)
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
      this.lights.evLightTurnOn(line, 35)
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
      this.teleport.evTeleport(line, side, thing)
      line.special = 0
      break

    case 40:
      // RaiseCeilingLowerFloor
      this.ceilings.evDoCeiling(line, CeilingType.RaiseToHighest)
      this.floor.evDoFloor(line, FloorType.LowerFloorToLowest)
      line.special = 0
      break

    case 44:
      // Ceiling Crush
      this.ceilings.evDoCeiling(line, CeilingType.LowerAndCrush)
      line.special = 0
      break

    case 52:
      // EXIT!
      this.game.exitLevel()
      break

    case 53:
      // Perpetual Platform Raise
      this.plats.evDoPlat(line, PlatType.PerpetualRaise, 0)
      line.special = 0
      break

    case 54:
      // Platform Stop
      this.plats.evStopPlate(line)
      line.special = 0
      break

    case 56:
      // Raise Floor Crush
      this.floor.evDoFloor(line, FloorType.RaiseFloorCrush)
      line.special = 0
      break

    case 57:
      // Ceiling Crush Stop
      this.ceilings.evCeilingCrushStop(line)
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
      this.lights.evTurnTagLightsOff(line)
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
      this.floor.evBuildStairs(line, StairType.Turbo16)
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
      this.plats.evDoPlat(line, PlatType.BlazeDWUS, 0)
      line.special = 0
      break

    case 124:
      // Secret EXIT
      this.game.secretExitLevel()
      break

    case 125:
      // TELEPORT MonsterONLY
      if (!thing.player) {
        this.teleport.evTeleport(line, side, thing)
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
      this.ceilings.evDoCeiling(line, CeilingType.SilentCrushAndRaise)
      line.special = 0
      break

    // RETRIGGERS.  All from here till end.
    case 72:
      // Ceiling Crush
      this.ceilings.evDoCeiling(line, CeilingType.LowerAndCrush)
      break

    case 73:
      // Ceiling Crush and Raise
      this.ceilings.evDoCeiling(line, CeilingType.CrushAndRaise)
      break

    case 74:
      // Ceiling Crush Stop
      this.ceilings.evCeilingCrushStop(line)
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
      this.ceilings.evDoCeiling(line, CeilingType.FastCrushAndRaise)
      break

    case 79:
      // Lights Very Dark
      this.lights.evLightTurnOn(line, 35)
      break

    case 80:
      // Light Turn On - brightest near
      this.lights.evLightTurnOn(line, 0)
      break

    case 81:
      // Light Turn On 255
      this.lights.evLightTurnOn(line, 255)
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
      this.plats.evDoPlat(line, PlatType.PerpetualRaise, 0)
      break

    case 88:
      // PlatDownWaitUp
      this.plats.evDoPlat(line, PlatType.DownWaitUpStay, 0)
      break

    case 89:
      // Platform Stop
      this.plats.evStopPlate(line)
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
      this.plats.evDoPlat(line, PlatType.RaiseToNearestAndChange, 0)
      break

    case 96:
      // Raise floor to shortest texture height
      // on either side of lines.
      this.floor.evDoFloor(line, FloorType.RaiseToTexture)
      break

    case 97:
      // TELEPORT!
      this.teleport.evTeleport(line, side, thing)
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
      this.plats.evDoPlat(line, PlatType.BlazeDWUS, 0)
      break

    case 126:
      // TELEPORT MonsterONLY.
      if (!thing.player) {
        this.teleport.evTeleport(line, side, thing)
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
  // P_ShootSpecialLine - IMPACT SPECIALS
  // Called when a thing shoots a special line.
  //
  shootSpecialLine(thing: MObj, line: Line): void {
    let ok: boolean
    // Impacts that other things can activate.
    if (!thing.player) {
      ok = false
      switch (line.special) {
      case 46:
      // OPEN DOOR IMPACT
        ok = true
        break
      }
      if (!ok) {
        return
      }
    }

    switch (line.special) {
    case 24:
      // RAISE FLOOR
      this.floor.evDoFloor(line, FloorType.RaiseFloor)
      this.switch.changeSwitchTexture(line, false)
      break
    case 46:
      // OPEN DOOR
      this.doors.evDoDoor(line, DoorType.Open)
      this.switch.changeSwitchTexture(line, true)
      break
    case 47:
      // RAISE FLOOR NEAR AND CHANGE
      this.plats.evDoPlat(line, PlatType.RaiseToNearestAndChange, 0)
      this.switch.changeSwitchTexture(line, false)
      break
    }
  }

  //
  // P_PlayerInSpecialSector
  // Called every tic frame
  //  that the player origin is in a special sector
  //
  playerInSpecialSector(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo'
    }
    if (player.mo.subSector === null) {
      throw 'player.mo.subSector'
    }
    if (player.mo.subSector.sector === null) {
      throw 'player.mo.subSector.sector'
    }
    const sector = player.mo.subSector.sector

    // Falling, not all the way down yet?
    if (player.mo.z !== sector.floorHeight) {
      return
    }

    // Has hitten ground.
    switch (sector.special) {
    case 5:
      // HELLSLIME DAMAGE
      if (!player.powers[PowerType.Ironfeet]) {
        if (!(this.tick.levelTime & 0x1f)) {
          this.inter.damageMObj(player.mo, null, null, 10)
        }
      }
      break
    case 7:
      // NUKAGE DAMAGE
      if (!player.powers[PowerType.Ironfeet]) {
        if (!(this.tick.levelTime & 0x1f)) {
          this.inter.damageMObj(player.mo, null, null, 5)
        }
      }
      break
    case 16:
      // SUPER HELLSLIME DAMAGE
      // fallthrough
    case 4:
      // STROBE HURT
      if (!player.powers[PowerType.Ironfeet] ||
        random.pRandom() < 5
      ) {
        if (!(this.tick.levelTime & 0x1f)) {
          this.inter.damageMObj(player.mo, null, null, 20)
        }
      }
      break
    case 9:
      // SECRET SECTOR
      player.secretCount++
      sector.special = 0
      break

    case 11:
      // EXIT SUPER DAMAGE! (for E1M8 finale)
      player.cheats &= ~Cheat.GodMode

      if (!(this.tick.levelTime & 0x1f)) {
        this.inter.damageMObj(player.mo, null, null, 20)
      }

      if (player.health <= 10) {
        this.game.exitLevel()
      }
      break

    default:
      throw `P_PlayerInSpecialSector: unknown special ${sector.special}`
      break

    }
  }

  //
  // P_UpdateSpecials
  // Animate planes, scroll walls, etc.
  //
  private levelTimer = false
  private levelTimeCount = 0

  updateSpecials(): void {
    // LEVEL TIMER
    if (this.levelTimer) {
      this.levelTimeCount--
      if (!this.levelTimeCount) {
        this.game.exitLevel()
      }
    }

    // ANIMATE FLATS AND TEXTURES GLOBALLY
    const lastAnim = this.anims.indexOf(this.lastAnim)
    let i: number
    let pic: number
    for (let animPtr = 0, anim = this.anims[animPtr];
      animPtr < lastAnim;
      ++animPtr, anim = this.anims[animPtr]
    ) {
      for (i = anim.basePic; i < anim.basePic + anim.numPics; ++i) {
        pic = anim.basePic +
          ((this.tick.levelTime / anim.speed >> 0) + i) % anim.numPics
        if (anim.isTexture) {
          this.data.textureTranslation[i] = pic
        } else {
          this.data.flatTranslation[i] = pic
        }
      }
    }

    // ANIMATE LINE SPECIALS
    let line: Line
    for (i = 0; i < this.numLineSpecials; ++i) {
      line = this.lineSpecialList[i]
      switch (line.special) {
      case 48:
        // EFFECT FIRSTCOL SCROLL +
        this.play.sides[line.sideNum[0]].textureOffset += FRACUNIT
        break
      }
    }

    // DO BUTTONS
    let button: Button
    for (i = 0; i < MAX_BUTTONS; ++i) {
      button = this.switch.buttonList[i]
      if (button.bTimer) {
        button.bTimer--

        if (!button.bTimer) {
          if (button.line === null) {
            throw 'button.line = null'
          }

          switch (button.where) {
          case Where.Top:
            this.play.sides[button.line.sideNum[0]].topTexture =
                button.bTexture
            break

          case Where.Middle:
            this.play.sides[button.line.sideNum[0]].midTexture =
                button.bTexture
            break

          case Where.Bottom:
            this.play.sides[button.line.sideNum[0]].bottomTexture =
                button.bTexture
            break
          }

          this.dSound.startSound(button.soundOrg, SfxName.Swtchn)
          button.reset()
        }
      }
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
        this.lights.spawnStrobeFlash(sector, FAST_DARK, 0)
        break
      case 3:
        // STROBE SLOW
        this.lights.spawnStrobeFlash(sector, SLOW_DARK, 0)
        break
      case 4:
        // STROBE FAST/DEATH SLIME
        this.lights.spawnStrobeFlash(sector, FAST_DARK, 0)
        sector.special = 4
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
        this.lights.spawnStrobeFlash(sector, FAST_DARK, 1)
        break
      case 14:
        // DOOR RAISE IN 5 MINUTES
        this.doors.spawnDoorRaiseIn5mins(sector)
        break
      case 17:
        this.lights.spawnFireFlicker(sector)
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

    for (let i = 0; i < MAX_BUTTONS; ++i) {
      this.switch.buttonList[i].reset()
    }
  }

}
