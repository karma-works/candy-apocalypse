import { PowerType, SCREENWIDTH, SCREEN_MUL } from '../global/doomdef'
import { Doom } from '../doom/doom'
import { Game } from '../game/game'
import { Video as IVideo } from '../interfaces/video'
import { Player } from '../doom/player'
import { Video as RVideo } from '../rendering/video'
import { Wad } from '../wad/wad'

// Size of statusbar.
// Now sensitive for scaling.
const ST_HEIGHT = 32 * SCREEN_MUL
const ST_WIDTH = SCREENWIDTH

// Palette indices.
// For damage/bonus red-/gold-shifts
const START_RED_PALS = 1
const START_BONUS_PALS = 9
const NUM_RED_PALS = 8
const NUM_BONUS_PALS = 4
// Radiation suit, green shift.
const RADIATION_PAL = 13

export class StatusBar {
  // main player in game
  private player: Player | null = null

  // ST_Start() has just been called
  private firstTime = false

  // used to execute ST_Init() only once
  private veryFirstTime = true

  // lump number for PLAYPAL
  private luPalette = -1

  private get rVideo(): RVideo {
    return this.doom.rendering.video
  }
  private get iVideo(): IVideo {
    return this.doom.iVideo
  }
  private get wad(): Wad {
    return this.doom.wad
  }
  private get game(): Game {
    return this.doom.game
  }

  constructor(private doom: Doom) { }

  private palette = 0

  // 1000
  private doPaletteStuff(): void {
    if (this.player === null) {
      throw 'this.player = null'
    }

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

    if (palette !== this.palette) {
      this.palette = palette
      const pal = this.wad.cacheLumpNum(this.luPalette)

      this.iVideo.setPalette(pal.slice(palette * 768))
    }
  }

  // 1108
  drawer(fullScreen: boolean, refresh: boolean): void {
    this.firstTime = this.firstTime || refresh

    // Do red-/gold-shifts from damage/items
    this.doPaletteStuff()
  }

  // 1201
  private loadData(): void {
    this.luPalette = this.wad.getNumForName('PLAYPAL')
  }

  // 1249
  private initData(): void {
    this.firstTime = true
    this.player = this.game.players[this.game.consolePlayer]

    this.palette = -1
  }

  private stopped = false
  // 1444
  start(): void {
    if (!this.stopped) {
      this.stop()
    }

    this.initData()
    this.stopped = false
  }

  // 1456
  stop(): void {
    if (this.stopped) {
      return
    }

    this.iVideo.setPalette(this.wad.cacheLumpNum(this.luPalette))
  }

  // 1466
  init(): void {
    this.veryFirstTime = false
    this.loadData()
    this.rVideo.screens[4] = new Uint8ClampedArray(ST_WIDTH * ST_HEIGHT)
  }
}
