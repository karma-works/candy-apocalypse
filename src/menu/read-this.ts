import { MenuItem, MenuStruct } from './typedefs'
import { GameMode } from '../global/doomdef'
import { Menu } from './menu'
import { mainDef } from './doom-menu'

const enum Read1 {
  ReadThisEmpty,
  ReadEnd
}

export const readMenu1: MenuItem[] = [
  {
    status: 1,
    name: '',
    routine: readThis2,
  },
]

export const readDef1: MenuStruct = {
  numItems: Read1.ReadEnd,
  prevMenu: mainDef,
  menuItems: readMenu1,
  routine: drawReadThis1,
  x: 280, y: 185,
  lastOn: 0,
}

const enum Read2 {
  ReadThisEmpty,
  ReadEnd
}

const readMenu2: MenuItem[] = [
  {
    status: 1,
    name: '',
    routine: finishReadThis,
  },
]

export const readDef2: MenuStruct = {
  numItems: Read2.ReadEnd,
  prevMenu: readDef1,
  menuItems: readMenu2,
  routine: drawReadThis2,
  x: 330, y: 175,
  lastOn: 0,
}

//
// Read This Menus
// Had a "quick hack to fix romero bug"
//
export function drawReadThis1(menu: Menu): void {
  menu.inHelpScreens = true
  switch (menu.doom.gameMode) {
  case GameMode.Commercial:
    menu.rvideo.drawPatchDirect(0, 0, 0,
      menu.wad.cacheLumpName('HELP'),
    )
    break
  case GameMode.Shareware:
  case GameMode.Registered:
  case GameMode.Retail:
    menu.rvideo.drawPatchDirect(0, 0, 0,
      menu.wad.cacheLumpName('HELP1'),
    )
    break
  default:
    break
  }
}

//
// Read This Menus - optional second page.
//
function drawReadThis2(menu: Menu): void {
  menu.inHelpScreens = true
  switch (menu.doom.gameMode) {
  case GameMode.Retail:
  case GameMode.Commercial:
    // This hack keeps us from having to change menus.
    menu.rvideo.drawPatchDirect(0, 0, 0,
      menu.wad.cacheLumpName('CREDIT'),
    )
    break
  case GameMode.Shareware:
  case GameMode.Registered:
    menu.rvideo.drawPatchDirect(0, 0, 0,
      menu.wad.cacheLumpName('HELP2'),
    )
    break
  default:
    break
  }
}

function readThis2(menu: Menu): void {
  menu.setupNextMenu(readDef2)
}
export function finishReadThis(menu: Menu): void {
  menu.setupNextMenu(mainDef)
}
