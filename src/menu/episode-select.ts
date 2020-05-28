import { MenuItem, MenuStruct } from './typedefs'
import { NewGame, newDef } from './new-game'
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

//
//      M_Episode
//
let epi: number

async function drawEpisode(menu: Menu): Promise<void> {
  menu.rvideo.drawPatchDirect(
    54, 38, 0,
    await menu.wad.cacheLumpName('M_EPISOD'),
  )
}

async function verifyNightmare(menu: Menu, ch: number): Promise<void> {
  if (ch !== 'y'.charCodeAt(0)) {
    return
  }

  menu.clearMenus()
}

export async function chooseSkill(menu: Menu, choice: number): Promise<void> {
  if (choice === NewGame.Nightmare) {
    menu.startMessage(menu.doom.strings.nightmare, verifyNightmare, true)
    return
  }

  menu.clearMenus()
}

async function episode(menu: Menu, choice: number): Promise<void> {
  epi = choice
  menu.setupNextMenu(newDef)
}
