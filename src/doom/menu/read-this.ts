import { MenuItem, MenuStruct } from './typedefs'
import { SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { LumpReader } from '../wad/lump-reader'
import { MainMenu } from './main'
import { Menu } from './menu'
import { Patch } from '../rendering/defs/patch'
import { Video as RVideo } from '../rendering/video'

export abstract class AbstractReadThisMenu implements MenuStruct {
  numItems = 1

  menuItems: MenuItem[] = [
    {
      status: 1,
      routine: this.readThis,
    },
  ]

  abstract lumpName: string

  abstract x: number
  abstract y: number
  lastOn = 0

  prevMenu: MenuStruct | null = null
  nextMenu: MenuStruct | null = null

  public get menu(): Menu {
    return this.main.menu
  }
  public get rVideo(): RVideo {
    return this.main.rVideo
  }
  public get wad(): LumpReader {
    return this.main.wad
  }

  constructor(private main: MainMenu) { }

  // Read This Menus
  routine(): void {
    const scale = this.rVideo.scale
    const offsetX = (this.rVideo.width - SCREENWIDTH * scale) / 2
    const offsetY = (this.rVideo.height - SCREENHEIGHT * scale) / 2
    this.menu.inHelpScreens = true
    this.rVideo.drawPatch(offsetX, offsetY, 0,
      this.wad.cacheLumpName(this.lumpName, Patch),
    )
  }

  private readThis(): void {
    if (this.nextMenu) {
      this.menu.setupNextMenu(this.nextMenu)
    }
  }
}

export class ReadThis1Menu extends AbstractReadThisMenu {
  lumpName = 'HELP2'
  x = 280
  y = 185
}

export class ReadThis2Menu extends AbstractReadThisMenu {
  lumpName = 'HELP1'
  x = 330
  y = 175
}

export class ReadThisCommercialMenu extends AbstractReadThisMenu {
  lumpName = 'HELP'
  x = 330
  y = 165
}
