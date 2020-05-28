import { MenuItem, MenuStruct } from './typedefs'
import { Menu } from './menu'
import { mainDef } from './doom-menu'

const enum Episodes {
  Ep1,
  Ep2,
  Ep3,
  Ep4,
  EpEnd,
}

const episodeMenu: MenuItem[] = [
  {
    status: 1,
    name: 'M_EPI1',
    routine: episode,
    alphaKey: 'k',
  },
  {
    status: 1,
    name: 'M_EPI2',
    routine: episode,
    alphaKey: 't',
  },
  {
    status: 1,
    name: 'M_EPI3',
    routine: episode,
    alphaKey: 'i',
  },
  {
    status: 1,
    name: 'M_EPI4',
    routine: episode,
    alphaKey: 't',
  },
]

export const episodeDef: MenuStruct = {
  numItems: Episodes.EpEnd,
  prevMenu: mainDef,
  menuItems: episodeMenu,
  routine: drawEpisode,
  x: 48, y: 63,
  lastOn: Episodes.Ep1,
}

function episode(menu: Menu, choice: number): void {
  debugger
}

function drawEpisode(menu: Menu): void {
  debugger
}
