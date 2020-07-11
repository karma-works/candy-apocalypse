import { MenuItem, MenuStruct } from './typedefs'
import { chooseSkill, episodeDef } from './episode-select'
import { Menu } from './menu'

export const enum NewGame {
  KillThings,
  TooRough,
  HurtMe,
  Violence,
  Nightmare,
  NewgEnd
}

const newGameMenu: MenuItem[] = [
  {
    status: 1,
    name: 'M_JKILL',
    routine: (...args) => chooseSkill(...args),
    alphaKey: 'i',
  },
  {
    status: 1,
    name: 'M_ROUGH',
    routine: (...args) => chooseSkill(...args),
    alphaKey: 'h',
  },
  {
    status: 1,
    name: 'M_HURT',
    routine: (...args) => chooseSkill(...args),
    alphaKey: 'h',
  },
  {
    status: 1,
    name: 'M_ULTRA',
    routine: (...args) => chooseSkill(...args),
    alphaKey: 'u',
  },
  {
    status: 1,
    name: 'M_NMARE',
    routine: (...args) => chooseSkill(...args),
    alphaKey: 'n',
  },
]

export const newDef: MenuStruct = {
  numItems: NewGame.NewgEnd,
  prevMenu: episodeDef,
  menuItems: newGameMenu,
  routine: drawNewGame,
  x: 48, y: 63,
  lastOn: NewGame.HurtMe,
}

//
// M_NewGame
//
function drawNewGame(menu: Menu): void {
  menu.rvideo.drawPatchDirect(
    96, 14, 0,
    menu.wad.cacheLumpName('M_NEWG'),
  )
  menu.rvideo.drawPatchDirect(
    54, 38, 0,
    menu.wad.cacheLumpName('M_SKILL'),
  )
}
