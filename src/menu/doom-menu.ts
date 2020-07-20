import { GameMode, GameVersion, Language } from '../doom/mode'
import { MenuItem, MenuStruct } from './typedefs'
import { GameState } from '../global/doomdef'
import { Menu } from './menu'
import { Sfx } from '../doom/sounds/sfx'
import { episodeDef } from './episode-select'
import { loadDef } from './load-game'
import { newDef } from './new-game'
import { optionsDef } from './options'
import { readDef1 } from './read-this'
import { saveDef } from './save-game'


//
// M_QuitDOOM
//
const quitSounds: readonly Sfx[] = [
  Sfx.Pldeth,
  Sfx.Dmpain,
  Sfx.Popain,
  Sfx.Slop,
  Sfx.Telept,
  Sfx.Posit1,
  Sfx.Posit3,
  Sfx.Sgtatk,
]

const quitSounds2: readonly Sfx[] = [
  Sfx.Vilact,
  Sfx.Getpow,
  Sfx.Boscub,
  Sfx.Slop,
  Sfx.Skeswg,
  Sfx.Kntdth,
  Sfx.Bspact,
  Sfx.Sgtatk,
]


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
export function loadGame(menu: Menu): void {
  menu.setupNextMenu(loadDef)
  menu.readSaveStrings()
}

//
// Selected from DOOM menu
//
export function saveGame(menu: Menu): void {
  if (!menu.game.userGame) {
    menu.startMessage(menu.doom.strings.savedead, undefined, false)
    return
  }

  if (menu.game.gameState !== GameState.Level) {
    return
  }

  menu.setupNextMenu(saveDef)
  menu.readSaveStrings()
}

//
// M_DrawMainMenu
//
function drawMainMenu(menu: Menu): void {
  menu.rvideo.drawPatchDirect(
    94, 2, 0,
    menu.wad.cacheLumpName('M_DOOM'),
  )
}

//
// M_NewGame
//
function newGame(menu: Menu): void {
  if (menu.doom.gameMode === GameMode.Commercial ||
    menu.doom.gameVersion === GameVersion.Chex) {
    menu.setupNextMenu(newDef)
  } else {
    menu.setupNextMenu(episodeDef)
  }
}

function options(menu: Menu): void {
  menu.setupNextMenu(optionsDef)
}

//
// M_ReadThis
//
function readThis(menu: Menu): void {
  menu.setupNextMenu(readDef1)
}

function quitResponse(menu: Menu, ch: number): void {
  if (ch !== 'y'.charCodeAt(0)) {
    return
  }
  if (!menu.game.netGame) {
    if (menu.doom.gameMode === GameMode.Commercial) {
      menu.dSound.startSound(null,
        quitSounds2[menu.game.gameTic >> 2 & 7])
    } else {
      menu.dSound.startSound(null,
        quitSounds[menu.game.gameTic >> 2 & 7])
    }
  }
  // TODO
}

export function quitDOOM(menu: Menu): void {
  let endString: string
  // We pick index 0 which is language sensitive,
  //  or one at random, between 1 and maximum number.
  if (menu.doom.language !== Language.English) {
    endString = `${menu.doom.strings.endmsg[0]}\n\n` + menu.doom.strings.dosy
  } else {
    const idx = menu.game.gameTic % (menu.doom.strings.numQuitMessages - 2) + 1
    endString = `${menu.doom.strings.endmsg[idx]}\n\n` + menu.doom.strings.dosy
  }
  menu.startMessage(endString, quitResponse, true)
}
