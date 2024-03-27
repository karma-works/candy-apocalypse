import { AM_MSGENTERED, AM_MSGEXITED, AM_MSGHEADER, AutoMap } from '../auto-map/auto-map'
import { ANG180, ANG45 } from '../misc/table'
import { AmmoType, ArmorType, Card, MAX_PLAYERS, PowerType, TICRATE, WeaponType } from '../global/doomdef'
import { BG, FG, Lib, ST_HEIGHT, ST_WIDTH } from './lib'
import { DEvent, EvType } from '../doom/event'
import { GameMission, GameMode, GameVersion, Skill } from '../doom/mode'
import { Cheat as PCheat, Player } from '../doom/player'
import { Video as RVideo, Screen } from '../rendering/video'
import { ammoCheat, ammoNoKeyCheat, choppersCheat, clevCheat, commercialNoClipCheat, godCheat, musCheat, myPosCheat, noClipCheat, powerupCheat } from './cheats'
import { BinIcon } from './bin-icon'
import { Cheat } from '../misc/cheat'
import { Doom } from '../doom'
import { Game } from '../game/game'
import { Inter } from '../play/inter'
import { LumpReader } from '../wad/lump-reader'
import { MultiIcon } from './multi-icon'
import { MusicName } from '../doom/sounds/music-name'
import { NumberWidget } from './number-widget'
import { Palettes } from '../interfaces/palette'
import { Patch } from '../rendering/defs/patch'
import { PercentWidget } from './percent-widget'
import { Strings } from '../translation/strings'
import { VideoInterface } from '../interfaces/video-interface'
import { pointToAngle } from '../misc/angle'
import { random } from '../misc/random'
import { weaponInfo } from '../doom/items'

// Palette indices.
// For damage/bonus red-/gold-shifts
const START_RED_PALS = 1
const START_BONUS_PALS = 9
const NUM_RED_PALS = 8
const NUM_BONUS_PALS = 4
// Radiation suit, green shift.
const RADIATION_PAL = 13

const ST_FX = 143

// Number of status faces.
const NUM_PAIN_FACES = 5
const NUM_STRAIGHT_FACES = 3
const NUM_TURN_FACES = 2
const NUM_SPECIAL_FACES = 3

const FACE_STRIDE = NUM_STRAIGHT_FACES + NUM_TURN_FACES + NUM_SPECIAL_FACES

const TURN_OFFSET = NUM_STRAIGHT_FACES
const OUCH_OFFSET = TURN_OFFSET + NUM_TURN_FACES
const EVIL_GRIN_OFFSET = OUCH_OFFSET + 1
const RAMPAGE_OFFSET = EVIL_GRIN_OFFSET + 1
const GOD_FACE = NUM_PAIN_FACES * FACE_STRIDE
const DEAD_FACE = GOD_FACE + 1

const FACESX = 143
const FACESY = 0

const EVIL_GRIN_COUNT = 2 * TICRATE
const STRAIGHT_FACE_COUNT = TICRATE / 2 >> 0
const TURN_COUNT = 1 * TICRATE
const RAMPAGE_DELAY = 2 * TICRATE

const MUCH_PAIN = 20

// Location and size of statistics,
//  justified according to widget type.
// Problem is, within which space? STbar? Screen?
// Note: this could be read in by a lump.
//       Problem is, is the stuff rendered
//       into a buffer,
//       or into the frame buffer?

// AMMO number pos.
const AMMOWIDTH = 3
const AMMOX = 44
const AMMOY = 3

// HEALTH number pos.
const HEALTHX = 90
const HEALTHY = 3

// Weapon pos.
const ARMSX = 111
const ARMSY = 4
const ARMSBGX = 104
const ARMSBGY = 0
const ARMSXSPACE = 12
const ARMSYSPACE = 10

// Frags pos.
const FRAGSX = 138
const FRAGSY = 3
const FRAGSWIDTH = 2

// ARMOR number pos.
const ARMORX = 221
const ARMORY = 3

// Key icon positions.
const KEY0X = 239
const KEY0Y = 3
const KEY1X = 239
const KEY1Y = 13
const KEY2X = 239
const KEY2Y = 23

// Ammunition counter.
const AMMO0WIDTH = 3
const AMMO0X = 288
const AMMO0Y = 5
const AMMO1WIDTH = AMMO0WIDTH
const AMMO1X = 288
const AMMO1Y = 11
const AMMO2WIDTH = AMMO0WIDTH
const AMMO2X = 288
const AMMO2Y = 23
const AMMO3WIDTH = AMMO0WIDTH
const AMMO3X = 288
const AMMO3Y = 17

// Indicate maximum ammunition.
// Only needed because backpack exists.
const MAXAMMO0WIDTH = 3
const MAXAMMO0X = 314
const MAXAMMO0Y = 5
const MAXAMMO1WIDTH = MAXAMMO0WIDTH
const MAXAMMO1X = 314
const MAXAMMO1Y = 11
const MAXAMMO2WIDTH = MAXAMMO0WIDTH
const MAXAMMO2X = 314
const MAXAMMO2Y = 23
const MAXAMMO3WIDTH = MAXAMMO0WIDTH
const MAXAMMO3X = 314
const MAXAMMO3Y = 17

export class StatusBar {
  // main player in game
  private player = new Player()

  // ST_Start() has just been called
  private firstTime = false

  // used for timing
  private clock = 0

  // whether in automap or first-person
  // private gameState: State = 0

  // whether left-side main status bar is active
  private statusBarOn = false

  // !deathMatch
  private notDeathMatch = false

  // !deathmatch && st_statusbaron
  private armsOn = false

  // !deathmatch
  private fragsOn = false

  // main bar left
  private sBar = new Patch()

  // 0-9, tall numbers
  private tallNum = new Array<Patch>()

  // tall % sign
  private tallPercent = new Patch()

  // 0-9, short, yellow (,different!) numbers
  private shortNum = new Array<Patch>()

  // 3 key-cards, 3 skulls
  private keys = new Array<Patch>()

  // face status patches
  private faces = new Array<Patch>()

  // face background
  private faceBack = new Patch()

  // main bar right
  private armsBg = new Patch()

  // weapon ownership patches
  // private arms
  private arms = Array.from({ length: 6 }, () => new Array<Patch>())


  // ready-weapon widget
  private readyWidget: NumberWidget | null = null

  // in deathmatch only, summary of frags stats
  private fragsWidget: NumberWidget | null = null

  // health widget
  private healthWidget: PercentWidget | null = null

  // arms background
  private armsBgWidget: BinIcon | null = null

  // weapon ownership widgets
  private armsWidgets = new Array<MultiIcon>()

  // face status widget
  private facesWidget: MultiIcon | null = null

  // keycard widgets
  private keyBoxesWidgets = new Array<MultiIcon>()

  // armor widget
  private armorWidget: PercentWidget | null = null

  // ammo widgets
  private ammoWidgets = new Array<NumberWidget>()

  // max ammo widgets
  private maxAmmoWidgets = new Array<NumberWidget>()

  // number of frags so far in deathmatch
  private fragsCount = 0

  // used to use appopriately pained face
  private oldHealth = -1

  // used for evil grin
  private oldWeaponsOwned = new Array<boolean>(AmmoType.NUM_AMMO).fill(false)

  // count until face changes
  private faceCount = 0

  // current face index, used by w_faces
  private faceIndex = 0

  // holds key-type for each key box on bar
  private keyBoxes = [ 0, 0, 0 ]

  // a random number per tick
  private randomNumber = 0

  private get autoMap(): AutoMap {
    return this.doom.autoMap
  }
  private get inter(): Inter {
    return this.doom.play.inter
  }
  public get rVideo(): RVideo {
    return this.doom.rVideo
  }
  private get iVideo(): VideoInterface {
    return this.doom.iVideo
  }
  private get strings(): Strings {
    return this.doom.strings
  }
  public get wad(): LumpReader {
    return this.doom.wad
  }
  private get game(): Game {
    return this.doom.game
  }

  private cheat = new Cheat()
  private lib = new Lib(this)

  constructor(private doom: Doom) { }

  private refreshBackground(): void {
    if (this.statusBarOn) {
      const scale = this.rVideo.scale
      this.rVideo.drawPatch(0, 0, BG, this.sBar)

      if (this.game.netGame) {
        this.rVideo.drawPatch(ST_FX * scale, 0, BG, this.faceBack)
      }

      this.rVideo.copyRect(0, 0, BG, ST_WIDTH * scale, ST_HEIGHT * scale,
        this.lib.x, this.lib.y, FG)
    }
  }

  // Respond to keyboard input events,
  //  intercept cheats.
  responder(ev: DEvent): boolean {
    // Filter automap on/off.
    if (ev.type === EvType.KeyUp &&
      (ev.data2 & 0xffff0000) === AM_MSGHEADER
    ) {
      switch (ev.data2) {
      case AM_MSGENTERED:
        // this.gameState = State.AutoMap
        this.firstTime = true
        break

      case AM_MSGEXITED:
        // this.gameState = State.FirstPerson
        break
      }
    } else if (ev.type === EvType.KeyDown) {
      const plyr = this.player

      // if a user keypress...
      if (!this.game.netGame && this.game.gameSkill !== Skill.Nightmare) {
        if (this.cheat.checkCheat(godCheat, ev.data2)) {
          // 'dqd' cheat for toggleable god mode
          plyr.cheats ^= PCheat.GodMode
          if (plyr.cheats & PCheat.GodMode) {
            if (plyr.mo) {
              plyr.mo.health = 100
            }

            plyr.health = 100
            plyr.message = this.strings.ststrDqdon
          } else {
            plyr.message = this.strings.ststrDqdoff
          }
        } else if (this.cheat.checkCheat(ammoNoKeyCheat, ev.data2)) {
          // 'fa' cheat for killer fucking arsenal
          plyr.armorPoints = 200
          plyr.armorType = ArmorType.MegaArmor

          for (let i = 0; i < WeaponType.NUM_WEAPONS; i++) {
            plyr.weaponOwned[i] = true
          }

          for (let i = 0; i < AmmoType.NUM_AMMO; i++) {
            plyr.ammo[i] = plyr.maxAmmo[i]
          }

          plyr.message = this.strings.ststrFaadded
        } else if (this.cheat.checkCheat(ammoCheat, ev.data2)) {
          // 'kfa' cheat for key full ammo
          plyr.armorPoints = 200
          plyr.armorType = ArmorType.MegaArmor

          for (let i = 0; i < WeaponType.NUM_WEAPONS; i++) {
            plyr.weaponOwned[i] = true
          }

          for (let i = 0; i < AmmoType.NUM_AMMO; i++) {
            plyr.ammo[i] = plyr.maxAmmo[i]
          }

          for (let i = 0; i < Card.NUM_CARDS; i++) {
            plyr.cards[i] = true
          }

          plyr.message = this.strings.ststrKfaadded
        } else if (this.cheat.checkCheat(musCheat, ev.data2)) {
          // 'mus' cheat for changing music

          plyr.message = this.strings.ststrMus
          const buf = this.cheat.getParam(musCheat)

          // Note: The original v1.9 had a bug that tried to play back
          // the Doom II music regardless of gamemode.  This was fixed
          // in the Ultimate Doom executable so that it would work for
          // the Doom 1 music as well.

          if (this.doom.instance.mode === GameMode.Commercial ||
            this.doom.instance.version < GameVersion.Ultimate
          ) {
            const levelNum = (buf[0].charCodeAt(0) - '0'.charCodeAt(0)) * 10 +
              (buf[1].charCodeAt(0) - '0'.charCodeAt(0))

            const musNum = MusicName.Runnin + levelNum

            if (levelNum > 35) {
              plyr.message = this.strings.ststrNomus
            } else {
              this.doom.dSound.changeMusic(musNum, true)
            }
          } else {
            const levelNum = (buf[0].charCodeAt(0) - '1'.charCodeAt(0)) * 9 +
              (buf[1].charCodeAt(0) - '1'.charCodeAt(0))

            const musNum = MusicName.E1m1 + levelNum

            if (levelNum > 31) {
              plyr.message = this.strings.ststrNomus
            } else {
              this.doom.dSound.changeMusic(musNum, true)
            }
          }

        } else if (this.doom.instance.logicalMission === GameMission.Doom &&
          this.cheat.checkCheat(noClipCheat, ev.data2) ||
          this.doom.instance.logicalMission !== GameMission.Doom &&
          this.cheat.checkCheat(commercialNoClipCheat, ev.data2)
        ) {
          // Simplified, accepting both "noclip" and "idspispopd".
          // no clipping mode cheat
          plyr.cheats ^= PCheat.NoClip

          if (plyr.cheats & PCheat.NoClip) {
            plyr.message = this.strings.ststrNcon
          } else {
            plyr.message = this.strings.ststrNcoff
          }
        }

        // 'behold?' power-up cheats
        for (let i = 0; i < 6; i++) {
          if (this.cheat.checkCheat(powerupCheat[i], ev.data2)) {
            if (!plyr.powers[i]) {
              this.inter.givePower(plyr, i)
            } else if (i !== PowerType.Strength) {
              plyr.powers[i] = 1
            } else {
              plyr.powers[i] = 0
            }

            plyr.message = this.strings.ststrBeholdx
          }
        }

        if (this.cheat.checkCheat(powerupCheat[6], ev.data2)) {
          // 'behold' power-up menu
          plyr.message = this.strings.ststrBehold
        } else if (this.cheat.checkCheat(choppersCheat, ev.data2)) {
          // 'choppers' invulnerability & chainsaw
          plyr.weaponOwned[WeaponType.Chainsaw] = true
          plyr.powers[PowerType.Invulnerability] = 1
          plyr.message = this.strings.ststrChoppers
        } else if (this.cheat.checkCheat(myPosCheat, ev.data2)) {
          // 'mypos' for player position

          if (plyr.mo === null) {
            throw 'plyr.mo = null'
          }

          const ang = plyr.mo.angle.toString(16)
          const x = plyr.mo.x.toString(16)
          const y = plyr.mo.y.toString(16)
          plyr.message = `ang=0x${ang};x,y=(0x${x},0x${y})`
        }
      }

      // 'clev' change-level cheat
      if (!this.game.netGame && this.cheat.checkCheat(clevCheat, ev.data2)) {
        const buf = this.cheat.getParam(clevCheat)

        let episode: number
        let map: number
        if (this.doom.instance.mode === GameMode.Commercial) {
          episode = 0
          map = Number(buf) || 0
        } else {
          episode = Number(buf[0]) || 0
          map = Number(buf[1]) || 0

          // Chex.exe always warps to episode 1.

          if (this.doom.instance.version === GameVersion.Chex) {
            if (episode > 1) {
              episode = 1
            }
            if (map > 5) {
              map = 5
            }
          }
        }

        // Catch invalid maps.
        if (this.doom.instance.mode !== GameMode.Commercial) {
          if (episode < 1) {
            return false
          }
          if (episode > 4) {
            return false
          }
          if (episode === 4 &&
            this.doom.instance.version < GameVersion.Ultimate
          ) {
            return false
          }
          if (map < 1) {
            return false
          }
          if (map > 9) {
            return false
          }
        } else {
          if (map < 1) {
            return false
          }
          if (map > 40) {
            return false
          }
        }

        // So be it
        plyr.message = this.strings.ststrClev
        this.game.deferedInitNew(this.game.gameSkill, episode, map)
      }
    }
    return false
  }


  private lastCalc = 0
  private oldHealthCalc = -1
  private calcPainOffset(): number {
    const health = this.player.health > 100 ? 100 : this.player.health

    if (health !== this.oldHealthCalc) {
      this.lastCalc = FACE_STRIDE * ((100 - health) * NUM_PAIN_FACES / 101 >> 0)
      this.oldHealth = health
    }

    return this.lastCalc
  }

  //
  // This is a not-very-pretty routine which handles
  //  the face states and their timing.
  // the precedence of expressions is:
  //  dead > evil grin > turned head > straight ahead
  //
  private lastAttackDown = -1
  private priority = 0
  private updateFaceWidget(): void {
    const pl = this.player

    let i = 0
    let badGuyAngle = 0
    let diffAng = 0
    let doEvilGrin = false

    if (this.priority < 10) {
      // dead
      if (!pl.health) {
        this.priority = 9
        this.faceIndex = DEAD_FACE
        this.faceCount = 1
      }
    }

    if (this.priority < 9) {
      if (pl.bonusCount) {
        // picking up bonus
        doEvilGrin = false

        for (i = 0; i < WeaponType.NUM_WEAPONS; ++i) {
          if (this.oldWeaponsOwned[i] !== pl.weaponOwned[i]) {
            doEvilGrin = true
            this.oldWeaponsOwned[i] = pl.weaponOwned[i]
          }
        }

        if (doEvilGrin) {
          // evil grin if just picked up weapon
          this.priority = 8
          this.faceCount = EVIL_GRIN_COUNT
          this.faceIndex = this.calcPainOffset() + EVIL_GRIN_OFFSET
        }
      }
    }

    if (this.priority < 8) {
      if (pl.damageCount &&
        pl.attacker &&
        pl.mo &&
        pl.attacker !== pl.mo
      ) {
        // being attacked
        this.priority = 7

        if (pl.health - this.oldHealth > MUCH_PAIN) {
          this.faceCount = TURN_COUNT
          this.faceIndex = this.calcPainOffset() + OUCH_OFFSET
        } else {
          badGuyAngle = pointToAngle(
            pl.mo.x,
            pl.mo.y,
            pl.attacker.x,
            pl.attacker.y,
          )
          if (badGuyAngle > pl.mo.angle) {
            // whether right or left
            diffAng = badGuyAngle - pl.mo.angle >>> 0
            i = diffAng > ANG180 ? 1 : 0
          } else {
            // whether left or right
            diffAng = pl.mo.angle - badGuyAngle >>> 0
            i = diffAng <= ANG180 ? 1 : 0
          }
          // confusing, aint it?

          this.faceCount = TURN_COUNT
          this.faceIndex = this.calcPainOffset()

          if (diffAng < ANG45) {
            // head-on
            this.faceIndex += RAMPAGE_OFFSET
          } else if (i) {
            // turn face right
            this.faceIndex += TURN_OFFSET
          } else {
            // turn face left
            this.faceIndex += TURN_OFFSET + 1
          }
        }
      }
    }

    if (this.priority < 7) {
      // getting hurt because of your own damn stupidity
      if (pl.damageCount) {
        if (pl.health - this.oldHealth > MUCH_PAIN) {
          this.priority = 7
          this.faceCount = TURN_COUNT
          this.faceIndex = this.calcPainOffset() + OUCH_OFFSET
        } else {
          this.priority = 6
          this.faceCount = TURN_COUNT
          this.faceIndex = this.calcPainOffset() + RAMPAGE_OFFSET
        }
      }
    }

    if (this.priority < 6) {
      // rapid firing
      if (pl.attackDown) {
        if (this.lastAttackDown === -1) {
          this.lastAttackDown = RAMPAGE_DELAY
        } else if (!--this.lastAttackDown) {
          this.priority = 5
          this.faceIndex = this.calcPainOffset() + RAMPAGE_OFFSET
          this.faceCount = 1
          this.lastAttackDown = 1
        }
      } else {
        this.lastAttackDown = -1
      }
    }

    if (this.priority < 5) {
      // invulnerability
      if (pl.cheats & PCheat.GodMode ||
        pl.powers[PowerType.Invulnerability]
      ) {
        this.priority = 4

        this.faceIndex = GOD_FACE
        this.faceCount = 1
      }
    }

    // look left or look right if the facecount has timed out
    if (!this.faceCount) {
      this.faceIndex = this.calcPainOffset() + this.randomNumber % 3
      this.faceCount = STRAIGHT_FACE_COUNT
      this.priority = 0
    }

    this.faceCount--
  }


  private updateWidgets(): void {
    // means "n/a"
    const largeAmmo = 1994

    const pl = this.player
    // must redirect the pointer if the ready weapon has changed.
    if (this.readyWidget) {
      if (weaponInfo[pl.readyWeapon].ammo === AmmoType.NoAmmo) {
        this.readyWidget.num = () => largeAmmo
      } else {
        this.readyWidget.num = () => pl.ammo[weaponInfo[pl.readyWeapon].ammo]
      }
      this.readyWidget.data = pl.readyWeapon
    }

    // update keycard multiple widgets
    for (let i = 0; i < 3; ++i) {
      this.keyBoxes[i] = pl.cards[i] ? i : -1

      if (pl.cards[i + 3]) {
        this.keyBoxes[i] = i + 3
      }
    }

    // refresh everything if this is him coming back to life
    this.updateFaceWidget()

    // used by the w_armsbg widget
    this.notDeathMatch = !this.game.deathMatch

    // used by w_arms[] widgets
    this.armsOn = this.statusBarOn && !this.game.deathMatch

    // used by w_frags widget
    this.fragsOn = !!this.game.deathMatch && this.statusBarOn
    this.fragsCount = 0

    for (let i = 0; i < MAX_PLAYERS; ++i) {
      if (i !== this.game.consolePlayer) {
        this.fragsCount += pl.frags[i]
      } else {
        this.fragsCount -= pl.frags[i]
      }
    }
  }

  ticker(): void {
    this.clock++
    this.randomNumber = random.mRandom()
    this.updateWidgets()
    this.oldHealth = this.player.health
  }

  private palette = 0
  private playpal = new Palettes()

  // 1000
  private doPaletteStuff(): void {
    let cnt = this.player.damageCount
    let bzc: number
    if (this.player.powers[PowerType.Strength]) {
      // slowly fade the berzerk out
      bzc = 12 - (this.player.powers[PowerType.Strength] >> 6)

      if (bzc > cnt) {
        cnt = bzc
      }
    }

    let palette: number
    if (cnt) {
      palette = cnt + 7 >> 3

      if (palette >= NUM_RED_PALS) {
        palette = NUM_RED_PALS - 1
      }

      palette += START_RED_PALS
    } else if (this.player.bonusCount) {
      palette = this.player.bonusCount + 7 >> 3

      if (palette >= NUM_BONUS_PALS) {
        palette = NUM_BONUS_PALS - 1
      }

      palette += START_BONUS_PALS
    } else if (this.player.powers[PowerType.Ironfeet] > 4 * 32 ||
        this.player.powers[PowerType.Ironfeet] & 8
    ) {
      palette = RADIATION_PAL
    } else {
      palette = 0
    }

    if (this.doom.instance.version === GameVersion.Chex &&
      palette >= START_RED_PALS && palette < START_RED_PALS + NUM_RED_PALS
    ) {
      palette = RADIATION_PAL
    }

    if (palette !== this.palette) {
      this.palette = palette

      this.iVideo.palette = this.playpal.p[palette]
    }
  }

  private drawWidgets(refresh: boolean): void {
    // used by w_arms[] widgets
    this.armsOn = this.statusBarOn && !this.game.deathMatch

    // used by w_frags widget
    this.fragsOn = !!this.game.deathMatch && this.statusBarOn

    if (this.readyWidget !== null) {
      this.lib.updateNum(this.readyWidget)
    }
    if (this.ammoWidgets !== null && this.maxAmmoWidgets !== null) {
      for (let i = 0; i < 4; ++i) {
        this.lib.updateNum(this.ammoWidgets[i])
        this.lib.updateNum(this.maxAmmoWidgets[i])
      }
    }
    if (this.healthWidget !== null) {
      this.lib.updatePercent(this.healthWidget, refresh)
    }
    if (this.armorWidget !== null) {
      this.lib.updatePercent(this.armorWidget, refresh)
    }

    if (this.armsBgWidget !== null) {
      this.lib.updateBinIcon(this.armsBgWidget, refresh)
    }

    if (this.armsWidgets !== null) {
      for (let i = 0; i < 6; ++i) {
        this.lib.updateMultiIcon(this.armsWidgets[i], refresh)
      }
    }

    if (this.facesWidget !== null) {
      this.lib.updateMultiIcon(this.facesWidget, refresh)
    }

    if (this.keyBoxesWidgets !== null) {
      for (let i = 0; i < 3; ++i) {
        this.lib.updateMultiIcon(this.keyBoxesWidgets[i], refresh)
      }
    }

    if (this.fragsWidget !== null) {
      this.lib.updateNum(this.fragsWidget)
    }
  }

  private doRefresh(): void {
    this.firstTime = false

    // draw status bar background to off-screen buff
    this.refreshBackground()

    // and refresh all widgets
    this.drawWidgets(true)
  }

  private diffDraw(): void {
    // update all widgets
    this.drawWidgets(false)
  }

  // 1108
  drawer(fullScreen: boolean, refresh: boolean): void {
    this.statusBarOn = !fullScreen || this.autoMap.active
    this.firstTime = this.firstTime || refresh

    // Do red-/gold-shifts from damage/items
    this.doPaletteStuff()

    // If just after ST_Start(), refresh all
    if (this.firstTime) {
      this.doRefresh()
    } else {
      this.diffDraw()
    }
  }

  private loadGraphics(): void {
    let name: string
    // Load the numbers, tall and short
    for (let i = 0; i < 10; ++i) {
      name = `STTNUM${i}`
      this.tallNum[i] = this.wad.cacheLumpName(name, Patch)

      name = `STYSNUM${i}`
      this.shortNum[i] = this.wad.cacheLumpName(name, Patch)
    }

    // Load percent key.
    //Note: why not load STMINUS here, too?
    this.tallPercent = this.wad.cacheLumpName('STTPRCNT', Patch)

    // key cards
    for (let i = 0; i < Card.NUM_CARDS; ++i) {
      name = `STKEYS${i}`
      this.keys[i] = this.wad.cacheLumpName(name, Patch)
    }

    // arms background
    this.armsBg = this.wad.cacheLumpName('STARMS', Patch)

    // arms ownership widgets
    for (let i = 0; i < 6; ++i) {
      name = `STGNUM${i + 2}`
      // gray #
      this.arms[i][0] = this.wad.cacheLumpName(name, Patch)

      // yellow #
      this.arms[i][1] = this.shortNum[i + 2]
    }

    // face backgrounds for different color players
    name = `STFB${this.game.consolePlayer}`
    this.faceBack = this.wad.cacheLumpName(name, Patch)

    // status bar background bits
    this.sBar = this.wad.cacheLumpName('STBAR', Patch)

    // face states

    let faceNum = 0
    for (let i = 0; i < NUM_PAIN_FACES; i++) {
      for (let j = 0; j < NUM_STRAIGHT_FACES; j++) {
        name = `STFST${i}${j}`
        this.faces[faceNum++] = this.wad.cacheLumpName(name, Patch)
      }
      // turn right
      name = `STFTR${i}0`
      this.faces[faceNum++] = this.wad.cacheLumpName(name, Patch)
      // turn left
      name = `STFTL${i}0`
      this.faces[faceNum++] = this.wad.cacheLumpName(name, Patch)
      // ouch!
      name = `STFOUCH${i}`
      this.faces[faceNum++] = this.wad.cacheLumpName(name, Patch)
      // evil grin ;)
      name = `STFEVL${i}`
      this.faces[faceNum++] = this.wad.cacheLumpName(name, Patch)
      // pissed off
      name = `STFKILL${i}`
      this.faces[faceNum++] = this.wad.cacheLumpName(name, Patch)
    }
    this.faces[faceNum++] = this.wad.cacheLumpName('STFGOD0', Patch)
    this.faces[faceNum++] = this.wad.cacheLumpName('STFDEAD0', Patch)
  }

  // 1201
  private loadData(): void {
    this.playpal = this.wad.cacheLumpName(Palettes.DEFAULT_LUMP, Palettes)
    this.loadGraphics()
  }

  // 1249
  private initData(): void {
    this.firstTime = true
    this.player = this.game.player

    this.clock = 0
    // this.gameState = State.FirstPerson

    this.statusBarOn = true

    this.faceIndex = 0
    this.palette = -1

    this.oldHealth = -1

    for (let i = 0; i < AmmoType.NUM_AMMO; ++i) {
      this.oldWeaponsOwned[i] = this.player.weaponOwned[i]
    }

    for (let i = 0; i < 3; ++i) {
      this.keyBoxes[i] = -1
    }

    this.lib.init()
  }

  private createWidgets(): void {
    const pl = this.player
    const statusBarOn = () => this.statusBarOn

    // ready weapon ammo
    this.readyWidget = new NumberWidget(
      AMMOX,
      AMMOY,
      this.tallNum,
      () => pl.ammo[weaponInfo[pl.readyWeapon].ammo],
      statusBarOn,
      AMMOWIDTH,
    )

    // the last weapon type
    this.readyWidget.data = pl.readyWeapon

    // health percentage
    this.healthWidget = new PercentWidget(
      HEALTHX,
      HEALTHY,
      this.tallNum,
      () => pl.health,
      statusBarOn,
      this.tallPercent,
    )

    // arms background
    this.armsBgWidget = new BinIcon(
      ARMSBGX,
      ARMSBGY,
      this.armsBg,
      () => this.notDeathMatch,
      statusBarOn,
    )

    // weapons owned
    for (let i = 0; i < 6; ++i) {
      this.armsWidgets[i] = new MultiIcon(
        ARMSX + i % 3 * ARMSXSPACE,
        ARMSY + (i / 3 >> 0) * ARMSYSPACE,
        this.arms[i], () => pl.weaponOwned[i + 1] ? 1 : 0,
        () => this.armsOn,
      )
    }

    // frags sum
    this.fragsWidget = new NumberWidget(
      FRAGSX,
      FRAGSY,
      this.tallNum,
      () => this.fragsCount,
      () => this.fragsOn,
      FRAGSWIDTH,
    )

    // faces
    this.facesWidget = new MultiIcon(
      FACESX,
      FACESY,
      this.faces,
      () => this.faceIndex,
      statusBarOn,
    )

    // armor percentage - should be colored later
    this.armorWidget = new PercentWidget(
      ARMORX,
      ARMORY,
      this.tallNum,
      () => pl.armorPoints,
      statusBarOn,
      this.tallPercent,
    )

    // keyboxes 0-2
    this.keyBoxesWidgets[0] = new MultiIcon(
      KEY0X,
      KEY0Y,
      this.keys,
      () => this.keyBoxes[0],
      statusBarOn,
    )
    this.keyBoxesWidgets[1] = new MultiIcon(
      KEY1X,
      KEY1Y,
      this.keys,
      () => this.keyBoxes[1],
      statusBarOn,
    )
    this.keyBoxesWidgets[2] = new MultiIcon(
      KEY2X,
      KEY2Y,
      this.keys,
      () => this.keyBoxes[2],
      statusBarOn,
    )

    // ammo count (all four kinds)
    this.ammoWidgets[0] = new NumberWidget(
      AMMO0X,
      AMMO0Y,
      this.shortNum,
      () => pl.ammo[0],
      statusBarOn,
      AMMO0WIDTH,
    )
    this.ammoWidgets[1] = new NumberWidget(
      AMMO1X,
      AMMO1Y,
      this.shortNum,
      () => pl.ammo[1],
      statusBarOn,
      AMMO1WIDTH,
    )
    this.ammoWidgets[2] = new NumberWidget(
      AMMO2X,
      AMMO2Y,
      this.shortNum,
      () => pl.ammo[2],
      statusBarOn,
      AMMO2WIDTH,
    )
    this.ammoWidgets[3] = new NumberWidget(
      AMMO3X,
      AMMO3Y,
      this.shortNum,
      () => pl.ammo[3],
      statusBarOn,
      AMMO3WIDTH,
    )

    // max ammo count (all four kinds)
    this.maxAmmoWidgets[0] = new NumberWidget(
      MAXAMMO0X,
      MAXAMMO0Y,
      this.shortNum,
      () => pl.maxAmmo[0],
      statusBarOn,
      MAXAMMO0WIDTH,
    )
    this.maxAmmoWidgets[1] = new NumberWidget(
      MAXAMMO1X,
      MAXAMMO1Y,
      this.shortNum,
      () => pl.maxAmmo[1],
      statusBarOn,
      MAXAMMO1WIDTH,
    )
    this.maxAmmoWidgets[2] = new NumberWidget(
      MAXAMMO2X,
      MAXAMMO2Y,
      this.shortNum,
      () => pl.maxAmmo[2],
      statusBarOn,
      MAXAMMO2WIDTH,
    )
    this.maxAmmoWidgets[3] = new NumberWidget(
      MAXAMMO3X,
      MAXAMMO3Y,
      this.shortNum,
      () => pl.maxAmmo[3],
      statusBarOn,
      MAXAMMO3WIDTH,
    )
  }

  private stopped = false
  // 1444
  start(): void {
    if (!this.stopped) {
      this.stop()
    }

    this.initData()
    this.createWidgets()
    this.stopped = false
  }

  // 1456
  stop(): void {
    if (this.stopped) {
      return
    }

    this.iVideo.palette = this.playpal.p[0]
  }

  // 1466
  init(): void {
    this.loadData()
    const scale = this.rVideo.scale
    this.rVideo.screens[4] = new Screen(ST_WIDTH * scale, ST_HEIGHT * scale)
  }
}
