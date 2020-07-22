import { MenuItem, MenuStruct } from './typedefs'
import { Game } from '../game/game'
import { MainMenu } from './main'
import { Menu } from './menu'
import { NewGameMenu } from './new-game'
import { Video as RVideo } from '../rendering/video'
import { Strings } from '../translation/strings'
import { Wad } from '../wad/wad'

const enum Episodes {
  Ep1,
  Ep2,
  Ep3,
  Ep4,
  EpEnd,
}

//
//      M_Episode
//
export class EpisodeMenu implements MenuStruct {
  numItems = Episodes.EpEnd

  menuItems: MenuItem[] = [
    {
      status: 1,
      name: 'M_EPI1',
      routine: this.episode,
      alphaKey: 'k',
    },
    {
      status: 1,
      name: 'M_EPI2',
      routine: this.episode,
      alphaKey: 't',
    },
    {
      status: 1,
      name: 'M_EPI3',
      routine: this.episode,
      alphaKey: 'i',
    },
    {
      status: 1,
      name: 'M_EPI4',
      routine: this.episode,
      alphaKey: 't',
    },
  ]
  x = 48
  y = 63
  lastOn = Episodes.Ep1

  newGameMenu = new NewGameMenu(this)

  public get game(): Game {
    return this.prevMenu.game
  }
  public get menu(): Menu {
    return this.prevMenu.menu
  }
  public get rVideo(): RVideo {
    return this.prevMenu.rVideo
  }
  public get strings(): Strings {
    return this.prevMenu.strings
  }
  public get wad(): Wad {
    return this.prevMenu.wad
  }

  constructor(public prevMenu: MainMenu) { }

  epi = 0

  routine(): void {
    this.rVideo.drawPatchDirect(
      54, 38, 0,
      this.wad.cacheLumpName('M_EPISOD'),
    )
  }

  private episode(choice: number): void {
    this.epi = choice
    this.menu.setupNextMenu(this.newGameMenu)
  }
}
