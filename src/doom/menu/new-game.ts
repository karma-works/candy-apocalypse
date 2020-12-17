import { MenuItem, MenuStruct } from './typedefs'
import { SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { EpisodeMenu } from './episode'
import { Game } from '../game/game'
import { LumpReader } from '../wad/lump-reader'
import { MainMenu } from './main'
import { Menu } from './menu'
import { Patch } from '../rendering/defs/patch'
import { Video as RVideo } from '../rendering/video'
import { ScanCode } from '../interfaces/scancodes'
import { Skill } from '../doom/mode'
import { Strings } from '../translation/strings'

export const enum NewGame {
  KillThings,
  TooRough,
  HurtMe,
  Violence,
  Nightmare,
  NewgEnd
}

export class NewGameMenu implements MenuStruct {
  numItems = NewGame.NewgEnd

  menuItems: MenuItem[] = [
    {
      status: 1,
      name: 'M_JKILL',
      routine: this.chooseSkill,
      alphaKey: 'i',
    },
    {
      status: 1,
      name: 'M_ROUGH',
      routine: this.chooseSkill,
      alphaKey: 'h',
    },
    {
      status: 1,
      name: 'M_HURT',
      routine: this.chooseSkill,
      alphaKey: 'h',
    },
    {
      status: 1,
      name: 'M_ULTRA',
      routine: this.chooseSkill,
      alphaKey: 'u',
    },
    {
      status: 1,
      name: 'M_NMARE',
      routine: this.chooseSkill,
      alphaKey: 'n',
    },
  ]

  x = 48
  y = 63
  lastOn = NewGame.HurtMe

  private get game(): Game {
    return this.prevMenu.game
  }
  private get menu(): Menu {
    return this.prevMenu.menu
  }
  private get rVideo(): RVideo {
    return this.prevMenu.rVideo
  }
  private get strings(): Strings {
    return this.prevMenu.strings
  }
  private get wad(): LumpReader {
    return this.prevMenu.wad
  }

  constructor(public prevMenu: EpisodeMenu | MainMenu) { }

  //
  // M_NewGame
  //
  routine(): void {
    const offsetX = (this.rVideo.width - SCREENWIDTH) / 2
    const offsetY = (this.rVideo.height - SCREENHEIGHT) / 2
    this.rVideo.drawPatch(
      96 + offsetX, 14 + offsetY, 0,
      this.wad.cacheLumpName('M_NEWG', Patch),
    )
    this.rVideo.drawPatch(
      54 + offsetX, 38 + offsetY, 0,
      this.wad.cacheLumpName('M_SKILL', Patch),
    )
  }

  private verifyNightmare(ch: number): void {
    if (ch !== ScanCode.KeyY) {
      return
    }

    // eslint-disable-next-line no-extra-parens
    const epi = (<EpisodeMenu> this.prevMenu).epi || 0
    this.game.deferedInitNew(Skill.Nightmare, epi + 1, 1)
    this.menu.clearMenus()
  }

  private chooseSkill(choice: number): void {
    if (choice === NewGame.Nightmare) {
      this.menu.startMessage(this.strings.nightmare, true, this.verifyNightmare)
      return
    }

    // eslint-disable-next-line no-extra-parens
    const epi = (<EpisodeMenu> this.prevMenu).epi || 0
    this.game.deferedInitNew(choice, epi + 1, 1)
    this.menu.clearMenus()
  }

}
