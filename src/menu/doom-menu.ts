import { GameMode, Language } from '../global/doomdef'
import { MenuItem, MenuStruct } from './typedefs'
import { Menu } from './menu'
import { episodeDef } from './episode-select'
import { loadDef } from './load-game'
import { newDef } from './new-game'
import { optionsDef } from './options'
import { readDef1 } from './read-this'
import { saveDef } from './save-game'

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


//
// Selected from DOOM menu
//
export async function loadGame(menu: Menu): Promise<void> {
  menu.setupNextMenu(loadDef)
  await menu.readSaveStrings()
}

//
// Selected from DOOM menu
//
export async function saveGame(menu: Menu): Promise<void> {
  menu.setupNextMenu(saveDef)
  await menu.readSaveStrings()
}

//
// M_DrawMainMenu
//
async function drawMainMenu(menu: Menu): Promise<void> {
  menu.rvideo.drawPatchDirect(
    94, 2, 0,
    await menu.wad.cacheLumpName('M_DOOM'),
  )
}

//
// M_NewGame
//
async function newGame(menu: Menu): Promise<void> {
  if (menu.doom.gameMode === GameMode.Commercial) {
    menu.setupNextMenu(newDef)
  } else {
    menu.setupNextMenu(episodeDef)
  }
}

async function options(menu: Menu): Promise<void> {
  menu.setupNextMenu(optionsDef)
}

//
// M_ReadThis
//
async function readThis(menu: Menu): Promise<void> {
  menu.setupNextMenu(readDef1)
}

async function quitResponse(menu: Menu, ch: number): Promise<void> {
  if (ch !== 'y'.charCodeAt(0)) {
    return
  }
  // TODO
}

export async function quitDOOM(menu: Menu): Promise<void> {
  let endString: string
  // We pick index 0 which is language sensitive,
  //  or one at random, between 1 and maximum number.
  if (menu.doom.language !== Language.English) {
    endString = `${menu.doom.strings.endmsg[0]}\n\n` + menu.doom.strings.dosy
  } else {
    const idx = menu.game.gametic % (menu.doom.strings.numQuitMessages - 2) + 1
    endString = `${menu.doom.strings.endmsg[idx]}\n\n` + menu.doom.strings.dosy
  }
  menu.startMessage(endString, quitResponse, true)
}
