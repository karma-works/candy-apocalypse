import { MenuItem, MenuStruct } from './typedefs'
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


function readThis2(menu: Menu, choice: number): void {
  debugger
}
export function finishReadThis(menu: Menu, choice: number): void {
  debugger
}

export function drawReadThis1(menu: Menu): void {
  debugger
}
function drawReadThis2(menu: Menu): void {
  debugger
}
