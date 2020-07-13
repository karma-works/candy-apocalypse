import { LINEHEIGHT, Menu } from './menu'
import { MenuItem, MenuStruct } from './typedefs'
import { GameState } from '../global/doomdef'
import { Sfx } from '../doom/sounds/sfx'
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

//
//  M_SaveGame & Cie.
//
function drawSave(menu: Menu): void {
  menu.rvideo.drawPatchDirect(
    72, 28, 0,
    menu.wad.cacheLumpName('M_SAVEG'),
  )

  for (let i = 0; i < Save.SaveEnd; ++i) {
    menu.drawSaveLoadBorder(saveDef.x, saveDef.y + LINEHEIGHT * i)
    menu.writeText(
      saveDef.x,
      saveDef.y + LINEHEIGHT * i,
      menu.saveGameStrings[i],
    )
  }

  if (menu.saveStringEnter) {
    const i = menu.stringWidth(menu.saveGameStrings[menu.saveSlot])
    menu.writeText(
      saveDef.x + i,
      saveDef.y + LINEHEIGHT * menu.saveSlot,
      '_',
    )
  }
}

//
// M_Responder calls this when user is finished
//
export function doSave(menu: Menu, slot: number): void {
  menu.clearMenus()

  // PICK QUICKSAVE SLOT YET?
  if (menu.quickSaveSlot === -2) {
    menu.quickSaveSlot = slot
  }
}

//
// User wants to save. Start string input for M_Responder
//
function saveSelect(menu: Menu, choice: number): void {
  // we are going to be intercepting all chars
  menu.saveStringEnter = true

  menu.saveSlot = choice
  menu.saveOldString = menu.saveGameStrings[choice]
  menu.saveCharIndex = menu.saveGameStrings[choice].length
}

//
//      M_QuickSave
//
function quickSaveResponse(menu: Menu, ch: number): void {
  if (ch === 'y'.charCodeAt(0)) {
    doSave(menu, menu.quickSaveSlot)
    menu.dSound.startSound(null, Sfx.Swtchx)
  }
}

export function quickSave(menu: Menu): void {
  if (!menu.game.userGame) {
    menu.dSound.startSound(null, Sfx.Oof)
    return
  }
  if (menu.game.gameState !== GameState.Level) {
    return
  }

  if (menu.quickSaveSlot < 0) {
    menu.startControlPanel()
    menu.readSaveStrings()
    menu.setupNextMenu(saveDef)
    // means to pick a slot now
    menu.quickSaveSlot = -2
    return
  }
  menu.startMessage(
    menu.doom.strings.qsprompt(menu.saveGameStrings[menu.quickSaveSlot]),
    quickSaveResponse,
    true,
  )
}
