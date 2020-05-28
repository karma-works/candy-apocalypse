import { MenuItem, MenuStruct } from './typedefs'
import { Menu } from './menu'
import { mainDef } from './doom-menu'

const enum Load {
  Load1,
  Load2,
  Load3,
  Load4,
  Load5,
  Load6,
  LoadEnd,
}

const loadMenu: MenuItem[] = [
  {
    status: 1,
    name: '',
    routine: loadSelect,
    alphaKey: 'e',
  },
  {
    status: 1,
    name: '',
    routine: loadSelect,
    alphaKey: '2',
  },
  {
    status: 1,
    name: '',
    routine: loadSelect,
    alphaKey: '3',
  },
  {
    status: 1,
    name: '',
    routine: loadSelect,
    alphaKey: '4',
  },
  {
    status: 1,
    name: '',
    routine: loadSelect,
    alphaKey: '5',
  },
  {
    status: 1,
    name: '',
    routine: loadSelect,
    alphaKey: '6',
  },
]

export const loadDef: MenuStruct = {
  numItems: Load.LoadEnd,
  prevMenu: mainDef,
  menuItems: loadMenu,
  routine: drawLoad,
  x: 80, y: 54,
  lastOn: 0,
}

function loadSelect(menu: Menu, choice: number): void {
  debugger
}

function drawLoad(menu: Menu): void {
  debugger
}

export function quickLoad(menu: Menu): void {
  debugger
}
