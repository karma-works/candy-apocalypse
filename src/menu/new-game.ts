import { MenuItem, MenuStruct } from './typedefs'
import { Menu } from './menu'
import { episodeDef } from './episode-select'

const enum NewGame {
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
    routine: chooseSkill,
    alphaKey: 'i',
  },
  {
    status: 1,
    name: 'M_ROUGH',
    routine: chooseSkill,
    alphaKey: 'h',
  },
  {
    status: 1,
    name: 'M_HURT',
    routine: chooseSkill,
    alphaKey: 'h',
  },
  {
    status: 1,
    name: 'M_ULTRA',
    routine: chooseSkill,
    alphaKey: 'u',
  },
  {
    status: 1,
    name: 'M_NMARE',
    routine: chooseSkill,
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

function chooseSkill(menu: Menu, choice: number): void {
  debugger
}

function drawNewGame(menu: Menu): void {
  debugger
}
