import { MenuItem, MenuStruct } from './typedefs'
import { Menu } from './menu'
import { mainDef } from './doom-menu'

const enum Save {
  Save1,
  Save2,
  Save3,
  Save4,
  Save5,
  Save6,
  SaveEnd,
}

const saveMenu: MenuItem[] = [
  {
    status: 1,
    name: '',
    routine: saveSelect,
    alphaKey: 'e',
  },
  {
    status: 1,
    name: '',
    routine: saveSelect,
    alphaKey: '2',
  },
  {
    status: 1,
    name: '',
    routine: saveSelect,
    alphaKey: '3',
  },
  {
    status: 1,
    name: '',
    routine: saveSelect,
    alphaKey: '4',
  },
  {
    status: 1,
    name: '',
    routine: saveSelect,
    alphaKey: '5',
  },
  {
    status: 1,
    name: '',
    routine: saveSelect,
    alphaKey: '6',
  },
]

export const saveDef: MenuStruct = {
  numItems: Save.SaveEnd,
  prevMenu: mainDef,
  menuItems: saveMenu,
  routine: drawSave,
  x: 80, y: 54,
  lastOn: 0,
}

function saveSelect(menu: Menu, choice: number): void {
  debugger
}

function drawSave(menu: Menu): void {
  debugger
}

export function doSave(menu: Menu, slot: number): void {
  debugger
}

export function quickSave(menu: Menu): void {
  debugger
}
