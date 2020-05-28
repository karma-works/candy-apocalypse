import { MenuItem, MenuStruct } from './typedefs'
import { Menu } from './menu'
import { mainDef } from './doom-menu'

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

const optionsMenu: MenuItem[] = [
  {
    status: 1,
    name: 'M_ENDGAM',
    routine: endGame,
    alphaKey: 'e',
  },
  {
    status: 1,
    name: 'M_MESSG',
    routine: changeMessages,
    alphaKey: 'm',
  },
  {
    status: 1,
    name: 'M_DETAIL',
    routine: changeDetail,
    alphaKey: 'g',
  },
  {
    status: 2,
    name: 'M_SCRNSZ',
    routine: sizeDisplay,
    alphaKey: 's',
  },
  {
    status: -1,
    name: '',
  },
  {
    status: 2,
    name: 'M_MSENS',
    routine: changeSensitivity,
    alphaKey: 'm',
  },
  {
    status: -1,
    name: '',
  },
  {
    status: 1,
    name: 'M_SVOL',
    routine: sound,
    alphaKey: 's',
  },
]

export const optionsDef: MenuStruct = {
  numItems: Options.OptEnd,
  prevMenu: mainDef,
  menuItems: optionsMenu,
  routine: drawOptions,
  x: 60, y: 37,
  lastOn: 0,
}

export function endGame(menu: Menu, choice: number): void {
  debugger
}
export function changeMessages(menu: Menu, choice: number): void {
  debugger
}
export function changeDetail(menu: Menu, choice: number): void {
  debugger
}
export function sizeDisplay(menu: Menu, choice: number): void {
  debugger
}
function changeSensitivity(menu: Menu, choice: number): void {
  debugger
}
function sound(menu: Menu, choice: number): void {
  debugger
}

function drawOptions(menu: Menu): void {
  debugger
}
