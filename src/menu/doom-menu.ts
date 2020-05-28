import { MenuItem, MenuStruct } from './typedefs'
import { Menu } from './menu'

export const enum MainEnum {
  NewGame,
  Options,
  LoadGame,
  SaveGame,
  ReadThis,
  QuitDoom,
  MainEnd,
}

export const mainMenu: MenuItem[] = [
  {
    status: 1,
    name: 'M_NGAME',
    routine: newGame,
    alphaKey: 'n',
  },
  {
    status: 1,
    name: 'M_OPTION',
    routine: options,
    alphaKey: 'o',
  },
  {
    status: 1,
    name: 'M_LOADG',
    routine: loadGame,
    alphaKey: 'l',
  },
  {
    status: 1,
    name: 'M_SAVEG',
    routine: saveGame,
    alphaKey: 's',
  },
  // Another hickup with Special edition.
  {
    status: 1,
    name: 'M_RDTHIS',
    routine: readThis,
    alphaKey: 'r',
  },
  {
    status: 1,
    name: 'M_QUITG',
    routine: quitDOOM,
    alphaKey: 'q',
  },
]

export const mainDef: MenuStruct = {
  numItems: MainEnum.MainEnd,
  prevMenu: null,
  menuItems: mainMenu,
  routine: drawMainMenu,
  x: 97, y: 64,
  lastOn: 0,
}

function newGame(menu: Menu, choice: number): void {
  debugger
}
function options(menu: Menu, choice: number): void {
  debugger
}
export function loadGame(menu: Menu, choice: number): void {
  debugger
}
export function saveGame(menu: Menu, choice: number): void {
  debugger
}
function readThis(menu: Menu, choice: number): void {
  debugger
}
export function quitDOOM(menu: Menu, choice: number): void {
  debugger
}

function drawMainMenu(menu: Menu): void {
  // debugger
}
