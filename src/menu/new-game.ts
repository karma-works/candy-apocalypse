import { MenuItem, MenuStruct } from './typedefs'
import { EpisodeMenu } from './episode'
import { Game } from '../game/game'
import { MainMenu } from './main'
import { Menu } from './menu'
import { Video as RVideo } from '../rendering/video'
import { Skill } from '../doom/mode'
import { Strings } from '../translation/strings'
import { Wad } from '../wad/wad'

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
  private get wad(): Wad {
    return this.prevMenu.wad
  }

  constructor(public prevMenu: EpisodeMenu | MainMenu) { }

  //
  // M_NewGame
  //
  routine(): void {
    this.rVideo.drawPatchDirect(
      96, 14, 0,
      this.wad.cacheLumpName('M_NEWG'),
    )
    this.rVideo.drawPatchDirect(
      54, 38, 0,
      this.wad.cacheLumpName('M_SKILL'),
    )
  }

  private verifyNightmare(ch: number): void {
    if (ch !== 'y'.charCodeAt(0)) {
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
