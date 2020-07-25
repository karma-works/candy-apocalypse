import { ANG180, ANG45 } from '../misc/table'
import { AmmoType, Card, MAX_PLAYERS, PowerType, TICRATE, WeaponType } from '../global/doomdef'
import { BG, FG, Lib, ST_HEIGHT, ST_WIDTH, ST_Y } from './lib'
import { Cheat, Player } from '../doom/player'
import { AutoMap } from '../auto-map/auto-map'
import { BinIcon } from './bin-icon'
import { DEvent } from '../doom/event'
import { Doom } from '../doom/doom'
import { Game } from '../game/game'
import { GameVersion } from '../doom/mode'
import { Video as IVideo } from '../interfaces/video'
import { MultiIcon } from './multi-icon'
import { NumberWidget } from './number-widget'
import { Palette } from '../interfaces/palette'
import { Patch } from '../rendering/defs/patch'
import { PercentWidget } from './percent-widget'
import { Video as RVideo } from '../rendering/video'
import { Rendering } from '../rendering/rendering'
import { Wad } from '../wad/wad'
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

// Location of status bar
const ST_X = 0

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
const FACESY = 168

const EVIL_GRIN_COUNT = 2 * TICRATE
const STRAIGHT_FACE_COUNT = TICRATE / 2 >> 0
const TURN_COUNT = 1 * TICRATE
const OUCH_COUNT = 1 * TICRATE
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
const AMMOY = 171

// HEALTH number pos.
const HEALTHWIDTH = 3
const HEALTHX = 90
const HEALTHY = 171

// Weapon pos.
const ARMSX = 111
const ARMSY = 172
const ARMSBGX = 104
const ARMSBGY = 168
const ARMSXSPACE = 12
const ARMSYSPACE = 10

// Frags pos.
const FRAGSX = 138
const FRAGSY = 171
const FRAGSWIDTH = 2

// ARMOR number pos.
const ARMORWIDTH = 3
const ARMORX = 221
const ARMORY = 171

// Key icon positions.
const KEY0WIDTH = 8
const KEY0HEIGHT = 5
const KEY0X = 239
const KEY0Y = 171
const KEY1WIDTH = KEY0WIDTH
const KEY1X = 239
const KEY1Y = 181
const KEY2WIDTH = KEY0WIDTH
const KEY2X = 239
const KEY2Y = 191

// Ammunition counter.
const AMMO0WIDTH = 3
const AMMO0HEIGHT = 6
const AMMO0X = 288
const AMMO0Y = 173
const AMMO1WIDTH = AMMO0WIDTH
const AMMO1X = 288
const AMMO1Y = 179
const AMMO2WIDTH = AMMO0WIDTH
const AMMO2X = 288
const AMMO2Y = 191
const AMMO3WIDTH = AMMO0WIDTH
const AMMO3X = 288
const AMMO3Y = 185

// Indicate maximum ammunition.
// Only needed because backpack exists.
const MAXAMMO0WIDTH = 3
const MAXAMMO0HEIGHT = 5
const MAXAMMO0X = 314
const MAXAMMO0Y = 173
const MAXAMMO1WIDTH = MAXAMMO0WIDTH
const MAXAMMO1X = 314
const MAXAMMO1Y = 179
const MAXAMMO2WIDTH = MAXAMMO0WIDTH
const MAXAMMO2X = 314
const MAXAMMO2Y = 191
const MAXAMMO3WIDTH = MAXAMMO0WIDTH
const MAXAMMO3X = 314
const MAXAMMO3Y = 185

// pistol
const WEAPON0X = 110
const WEAPON0Y = 172

// shotgun
const WEAPON1X = 122
const WEAPON1Y = 172

// chain gun
const WEAPON2X = 134
const WEAPON2Y = 172

// missile launcher
const WEAPON3X = 110
const WEAPON3Y = 181

// plasma gun
const WEAPON4X = 122
const WEAPON4Y = 181

// bfg
const WEAPON5X = 134
const WEAPON5Y = 181

// WPNS title
const WPNSX = 109
const WPNSY = 191

// DETH title
const DETHX = 109
const DETHY = 191

//Incoming messages window location
//UNUSED
// const MSGTEXTX = viewwindowx)
// const MSGTEXTY = viewwindowy+viewheight-18)
const MSGTEXTX = 0
const MSGTEXTY = 0
// Dimensions given in characters.
const MSGWIDTH = 52
// Or shall I say, in lines?
const MSGHEIGHT = 1

const OUTTEXTX = 0
const OUTTEXTY = 6

// Width, in characters again.
const OUTWIDTH = 52
// Height, in lines.
const OUTHEIGHT = 1


const MAPTITLEY = 0
const MAPHEIGHT = 1

export class StatusBar {
  // main player in game
  private player = new Player()

  // ST_Start() has just been called
  private firstTime = false

  // used to execute ST_Init() only once
  private veryFirstTime = true

  // used for timing
  private clock = 0

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
  public get rendering(): Rendering {
    return this.doom.rendering
  }
  public get rVideo(): RVideo {
    return this.rendering.video
  }
  private get iVideo(): IVideo {
    return this.doom.iVideo
  }
  public get wad(): Wad {
    return this.doom.wad
  }
  private get game(): Game {
    return this.doom.game
  }

  private lib = new Lib(this)

  constructor(private doom: Doom) { }

  private refreshBackground(): void {
    if (this.statusBarOn) {
      this.rVideo.drawPatch(ST_X, 0, BG, this.sBar)

      if (this.game.netGame) {
        this.rVideo.drawPatch(ST_FX, 0, BG, this.faceBack)
      }

      this.rVideo.copyRect(ST_X, 0, BG, ST_WIDTH, ST_HEIGHT, ST_X, ST_Y, FG)
    }
  }

  // Respond to keyboard input events,
  //  intercept cheats.
  responder(ev: DEvent): boolean {
    // TODO see chocolate

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

        for (i = 0; i < WeaponType.NUMWEAPONS; ++i) {
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
      if (pl.cheats & Cheat.GodMode ||
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
  private palettes = new Array<Palette>()

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

    if (this.doom.gameVersion === GameVersion.Chex &&
      palette >= START_RED_PALS && palette < START_RED_PALS + NUM_RED_PALS
    ) {
      palette = RADIATION_PAL
    }

    if (palette !== this.palette) {
      this.palette = palette

      this.iVideo.palette = this.palettes[palette]
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
    const paletteLump = this.wad.getNumForName('PLAYPAL')
    const fullPalette = this.wad.cacheLumpNum(paletteLump)
    const size = this.wad.lumpLength(paletteLump) / (256 * 3)

    for (let i = 0; i < size; ++i) {
      this.palettes[i] = new Palette(fullPalette.slice(i * 256 * 3))
    }
    this.loadGraphics()
  }

  // 1249
  private initData(): void {
    this.firstTime = true
    this.player = this.game.players[this.game.consolePlayer]

    this.clock = 0

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

    this.iVideo.palette = this.palettes[0]
  }

  // 1466
  init(): void {
    this.veryFirstTime = false
    this.loadData()
    this.rVideo.screens[4] = new Uint8ClampedArray(ST_WIDTH * ST_HEIGHT)
  }
}
