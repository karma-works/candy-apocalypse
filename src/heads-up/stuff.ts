import { GameMode, TICRATE } from '../global/doomdef'
import { Doom } from '../doom/doom'
import { Game } from '../game/game'
import { Lib } from './lib'
import { Patch } from '../rendering/patch'
import { Player } from '../doom/player'
import { SText } from './s-text'
import { Strings } from '../translation/strings'
import { TextLine } from './text-line'
import { Wad } from '../wad/wad'

// the first font characters
export const HU_FONTSTART = '!'.charCodeAt(0)
// the last font characters
export const HU_FONTEND = '_'.charCodeAt(0)

// Calculate # of glyphs in font.
export const HU_FONTSIZE =
    HU_FONTEND - HU_FONTSTART + 1

const MSG_X = 0
const MSG_Y = 0
// in lines
const MSG_HEIGHT = 1

const MSG_TIMEOUT = 4 * TICRATE

export class HeadsUp {
  //
  // Locally used constants, shortcuts.
  //
  private get TITLE(): string {
    return this.mapNames[(this.game.gameEpisode - 1) * 9 + this.game.gameMap - 1]
  }
  private get TITLE2(): string {
    return this.mapNames2[this.game.gameMap - 1]
  }
  private get TITLEP(): string {
    return this.mapNamesP[this.game.gameMap - 1]
  }
  private get TITLET(): string {
    return this.mapNamesT[this.game.gameMap - 1]
  }
  private readonly TITLE_X = 0
  private get TITLE_Y(): number {
    return 167 - this.font[0].height
  }

  //
  // Builtin map names.
  // The actual names can be found in DStrings.h.
  //

  // DOOM shareware/registered/retail (Ultimate) names.
  private get mapNames(): readonly string[] {
    return [
      this.strings.hustrE1m1,
      this.strings.hustrE1m2,
      this.strings.hustrE1m3,
      this.strings.hustrE1m4,
      this.strings.hustrE1m5,
      this.strings.hustrE1m6,
      this.strings.hustrE1m7,
      this.strings.hustrE1m8,
      this.strings.hustrE1m9,

      this.strings.hustrE2m1,
      this.strings.hustrE2m2,
      this.strings.hustrE2m3,
      this.strings.hustrE2m4,
      this.strings.hustrE2m5,
      this.strings.hustrE2m6,
      this.strings.hustrE2m7,
      this.strings.hustrE2m8,
      this.strings.hustrE2m9,

      this.strings.hustrE3m1,
      this.strings.hustrE3m2,
      this.strings.hustrE3m3,
      this.strings.hustrE3m4,
      this.strings.hustrE3m5,
      this.strings.hustrE3m6,
      this.strings.hustrE3m7,
      this.strings.hustrE3m8,
      this.strings.hustrE3m9,

      this.strings.hustrE4m1,
      this.strings.hustrE4m2,
      this.strings.hustrE4m3,
      this.strings.hustrE4m4,
      this.strings.hustrE4m5,
      this.strings.hustrE4m6,
      this.strings.hustrE4m7,
      this.strings.hustrE4m8,
      this.strings.hustrE4m9,

      'NEWLEVEL',
      'NEWLEVEL',
      'NEWLEVEL',
      'NEWLEVEL',
      'NEWLEVEL',
      'NEWLEVEL',
      'NEWLEVEL',
      'NEWLEVEL',
      'NEWLEVEL',
    ]
  }
  // DOOM 2 map names.
  private get mapNames2(): readonly string[] {
    return [
      this.strings.hustr1,
      this.strings.hustr2,
      this.strings.hustr3,
      this.strings.hustr4,
      this.strings.hustr5,
      this.strings.hustr6,
      this.strings.hustr7,
      this.strings.hustr8,
      this.strings.hustr9,
      this.strings.hustr10,
      this.strings.hustr11,

      this.strings.hustr12,
      this.strings.hustr13,
      this.strings.hustr14,
      this.strings.hustr15,
      this.strings.hustr16,
      this.strings.hustr17,
      this.strings.hustr18,
      this.strings.hustr19,
      this.strings.hustr20,

      this.strings.hustr21,
      this.strings.hustr22,
      this.strings.hustr23,
      this.strings.hustr24,
      this.strings.hustr25,
      this.strings.hustr26,
      this.strings.hustr27,
      this.strings.hustr28,
      this.strings.hustr29,
      this.strings.hustr30,
      this.strings.hustr31,
      this.strings.hustr32,
    ]
  }
  // Plutonia WAD map names.
  private get mapNamesP(): readonly string[] {
    return [
      this.strings.phustr1,
      this.strings.phustr2,
      this.strings.phustr3,
      this.strings.phustr4,
      this.strings.phustr5,
      this.strings.phustr6,
      this.strings.phustr7,
      this.strings.phustr8,
      this.strings.phustr9,
      this.strings.phustr10,
      this.strings.phustr11,

      this.strings.phustr12,
      this.strings.phustr13,
      this.strings.phustr14,
      this.strings.phustr15,
      this.strings.phustr16,
      this.strings.phustr17,
      this.strings.phustr18,
      this.strings.phustr19,
      this.strings.phustr20,

      this.strings.phustr21,
      this.strings.phustr22,
      this.strings.phustr23,
      this.strings.phustr24,
      this.strings.phustr25,
      this.strings.phustr26,
      this.strings.phustr27,
      this.strings.phustr28,
      this.strings.phustr29,
      this.strings.phustr30,
      this.strings.phustr31,
      this.strings.phustr32,
    ]
  }
  // TNT WAD map names.
  private get mapNamesT(): readonly string[] {
    return [
      this.strings.thustr1,
      this.strings.thustr2,
      this.strings.thustr3,
      this.strings.thustr4,
      this.strings.thustr5,
      this.strings.thustr6,
      this.strings.thustr7,
      this.strings.thustr8,
      this.strings.thustr9,
      this.strings.thustr10,
      this.strings.thustr11,

      this.strings.thustr12,
      this.strings.thustr13,
      this.strings.thustr14,
      this.strings.thustr15,
      this.strings.thustr16,
      this.strings.thustr17,
      this.strings.thustr18,
      this.strings.thustr19,
      this.strings.thustr20,

      this.strings.thustr21,
      this.strings.thustr22,
      this.strings.thustr23,
      this.strings.thustr24,
      this.strings.thustr25,
      this.strings.thustr26,
      this.strings.thustr27,
      this.strings.thustr28,
      this.strings.thustr29,
      this.strings.thustr30,
      this.strings.thustr31,
      this.strings.thustr32,
    ]
  }

  private plr: Player | null = null
  private title: TextLine | null = null
  font: Patch[] = []
  private chatOn = false

  messageOn = false
  messageDontFuckWithMe = false
  messageNotToBeFuckedWith = false

  private message: SText | null = null
  private messageCounter = 0

  showMessages = true

  private headsUpActive = false

  private get game(): Game {
    return this.doom.game
  }
  private get strings(): Strings {
    return this.doom.strings
  }
  private get wad(): Wad {
    return this.doom.wad
  }

  private lib = new Lib(this)

  constructor(public doom: Doom) { }

  init(): void {
    let buffer: string
    let paddedJ: string
    let j = HU_FONTSTART
    for (let i = 0; i < HU_FONTSIZE; ++i) {
      paddedJ = `${j++}`
      paddedJ = '0'.repeat(3 - paddedJ.length) + paddedJ
      buffer = 'STCFN' + paddedJ

      this.font[i] = new Patch(this.wad.cacheLumpName(buffer))
    }
  }

  private stop(): void {
    this.headsUpActive = false
  }

  start(): void {
    if (this.headsUpActive) {
      this.stop()
    }

    this.plr = this.game.players[this.game.consolePlayer]
    this.messageOn = false
    this.messageDontFuckWithMe = false
    this.messageNotToBeFuckedWith = false
    this.chatOn = false

    // create the message widget
    this.message = new SText(
      MSG_X, MSG_Y, MSG_HEIGHT,
      this.font,
      HU_FONTSTART, this,
    )

    // create the map title widget
    this.title = new TextLine(
      this.TITLE_X, this.TITLE_Y,
      this.font,
      HU_FONTSTART,
    )

    this.title

    let s: string
    switch (this.doom.gameMode) {
    case GameMode.Shareware:
    case GameMode.Registered:
    case GameMode.Retail:
      s = this.TITLE
      break
    case GameMode.Commercial:
    default:
      s = this.TITLE2
      break
    }

    let c: string
    for (c of Array.from(s)) {
      this.title.addChar(c)
    }

    this.headsUpActive = true

  }

  drawer() : void{
    if (this.message === null) {
      throw 'this.message = null'
    }
    if (this.title === null) {
      throw 'this.title = null'
    }
    this.lib.drawSText(this.message)
    this.lib.drawTextLine(this.title, false)
  }

  erase(): void {
    if (this.message === null) {
      throw 'this.message = null'
    }
    if (this.title === null) {
      throw 'this.title = null'
    }
    this.lib.eraseSText(this.message)
    this.lib.eraseTextLine(this.title)
  }

  ticker(): void {
    // tick down message counter if message is up
    if (this.messageCounter && !--this.messageCounter) {
      this.messageOn = false
      this.messageNotToBeFuckedWith = false
    }

    if (this.showMessages || this.messageDontFuckWithMe) {
      if (this.plr === null) {
        throw 'this.plr = null'
      }

      // display message if necessary
      if (this.plr.message && !this.messageNotToBeFuckedWith ||
        this.plr.message && this.messageDontFuckWithMe
      ) {
        if (this.message === null) {
          throw 'this.message = null'
        }

        this.message.addMessage('', this.plr.message)
        this.plr.message = ''
        this.messageOn = true
        this.messageCounter = MSG_TIMEOUT
        this.messageNotToBeFuckedWith = this.messageDontFuckWithMe
        this.messageDontFuckWithMe = false
      }
    }

    // check for incoming chat characters
    if (this.game.netGame) {
      debugger
    }
  }
}
