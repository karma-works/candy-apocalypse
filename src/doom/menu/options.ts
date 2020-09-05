import { LINEHEIGHT, Menu } from './menu'
import { MenuItem, MenuStruct } from './typedefs'
import { Sound as DSound } from '../doom/sound'
import { Doom } from '../doom'
import { Game } from '../game/game'
import { HeadsUp } from '../heads-up/stuff'
import { LumpReader } from '../wad/lump-reader'
import { MainMenu } from './main'
import { Patch } from '../rendering/defs/patch'
import { Video as RVideo } from '../rendering/video'
import { RenderingInterface } from '../rendering/rendering-interface'
import { ScanCode } from '../interfaces/scancodes'
import { SfxName } from '../doom/sounds/sfx-name'
import { SoundMenu } from './sound'
import { Strings } from '../translation/strings'

const enum Options {
  EndGame,
  Messages,
  Detail,
  ScrnSize,
  OptionEmpty1,
  MouseSens,
  OptionEmpty2,
  SoundVol,
  OptEnd,
}

const detailNames = [ 'M_GDHIGH', 'M_GDLOW' ]
const msgNames = [ 'M_MSGOFF', 'M_MSGON' ]

export class OptionsMenu implements MenuStruct {
  numItems = Options.OptEnd

  menuItems: MenuItem[] = [
    {
      status: 1,
      name: 'M_ENDGAM',
      routine: this.endGame,
      alphaKey: 'e',
    },
    {
      status: 1,
      name: 'M_MESSG',
      routine: this.changeMessages,
      alphaKey: 'm',
    },
    {
      status: 1,
      name: 'M_DETAIL',
      routine: this.changeDetail,
      alphaKey: 'g',
    },
    {
      status: 2,
      name: 'M_SCRNSZ',
      routine: this.sizeDisplay,
      alphaKey: 's',
    },
    {
      status: -1,
    },
    {
      status: 2,
      name: 'M_MSENS',
      routine: this.changeSensitivity,
      alphaKey: 'm',
    },
    {
      status: -1,
    },
    {
      status: 1,
      name: 'M_SVOL',
      routine: this.sound,
      alphaKey: 's',
    },
  ]

  x = 60
  y = 37
  lastOn = 0

  soundMenu = new SoundMenu(this)

  private get doom(): Doom {
    return this.prevMenu.doom
  }
  public get dSound(): DSound {
    return this.prevMenu.dSound
  }
  private get game(): Game {
    return this.prevMenu.game
  }
  private get headsUp(): HeadsUp {
    return this.menu.headsUp
  }
  public get menu(): Menu {
    return this.prevMenu.menu
  }
  private get rendering(): RenderingInterface {
    return this.menu.rendering
  }
  public get rVideo(): RVideo {
    return this.prevMenu.rVideo
  }
  private get strings(): Strings {
    return this.prevMenu.strings
  }
  public get wad(): LumpReader {
    return this.prevMenu.wad
  }

  constructor(public prevMenu: MainMenu) { }


  //
  //      Toggle messages on/off
  //
  changeMessages(): void {
    this.headsUp.showMessages = !this.headsUp.showMessages
    if (!this.headsUp.showMessages) {
      this.game.player.message = this.strings.msgoff
    } else {
      this.game.player.message = this.strings.msgon
    }
    this.headsUp.messageDontFuckWithMe = true

    this.menu.saveDefaults()
  }

  //
  // M_EndGame
  //
  private endGameResponse(ch: number): void {
    if (ch !== ScanCode.KeyY) {
      return
    }

    this.menu.currentMenu.lastOn = this.menu.itemOn
    this.menu.clearMenus()
    this.doom.startTitle()
  }
  endGame(): void {
    if (!this.game.userGame) {
      this.dSound.startSound(null, SfxName.Oof)
      return
    }
    if (this.game.netGame) {
      this.menu.startMessage(this.strings.netend, false)
      return
    }
    this.menu.startMessage(this.strings.endgame, true, this.endGameResponse)
  }

  private changeSensitivity(choice: number): void {
    switch (choice) {
    case 0:
      if (this.game.mouseSensitivity) {
        --this.game.mouseSensitivity
      }
      break
    case 1:
      if (this.game.mouseSensitivity < 9) {
        ++this.game.mouseSensitivity
      }
      break
    }
    this.menu.saveDefaults()
  }

  changeDetail(/* choice: number */): void {
    this.rendering.highDetails = !this.rendering.highDetails

    this.menu.saveDefaults()

    if (!this.rendering.highDetails) {
      this.game.player.message = this.strings.detailhi
    } else {
      this.game.player.message = this.strings.detaillo
    }
  }
  sizeDisplay(choice: number): void {
    switch (choice) {
    case 0:
      if (this.rendering.screenSize > 0) {
        --this.rendering.screenSize
      }
      break
    case 1:
      if (this.rendering.screenSize < 8) {
        ++this.rendering.screenSize
      }
      break
    }

    this.menu.saveDefaults()
  }
  private sound(): void {
    this.menu.setupNextMenu(this.soundMenu)
  }

  routine(): void {
    this.rVideo.drawPatch(
      108, 15, 0,
      this.wad.cacheLumpName('M_OPTTTL', Patch),
    )

    this.rVideo.drawPatch(
      this.x + 175, this.y + LINEHEIGHT * Options.Detail, 0,
      this.wad.cacheLumpName(detailNames[this.rendering.highDetails ? 1 : 0], Patch),
    )

    this.rVideo.drawPatch(
      this.x + 120, this.y + LINEHEIGHT * Options.Messages, 0,
      this.wad.cacheLumpName(msgNames[this.headsUp.showMessages ? 1 : 0], Patch),
    )

    this.menu.drawThermo(
      this.x,
      this.y + LINEHEIGHT * (Options.MouseSens + 1),
      10,
      this.game.mouseSensitivity,
    )

    this.menu.drawThermo(
      this.x,
      this.y + LINEHEIGHT * (Options.ScrnSize + 1),
      9,
      this.rendering.screenSize,
    )

  }
}
