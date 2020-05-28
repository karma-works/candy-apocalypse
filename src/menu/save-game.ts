import { LINEHEIGHT, Menu } from './menu'
import { MenuItem, MenuStruct } from './typedefs'
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
async function drawSave(menu: Menu): Promise<void> {
  menu.rvideo.drawPatchDirect(
    72, 28, 0,
    await menu.wad.cacheLumpName('M_SAVEG'),
  )

  for (let i = 0; i < Save.SaveEnd; ++i) {
    await menu.drawSaveLoadBorder(saveDef.x, saveDef.y + LINEHEIGHT * i)
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
export async function doSave(menu: Menu, slot: number): Promise<void> {
  menu.clearMenus()

  // PICK QUICKSAVE SLOT YET?
  if (menu.quickSaveSlot === -2) {
    menu.quickSaveSlot = slot
  }
}

//
// User wants to save. Start string input for M_Responder
//
async function saveSelect(menu: Menu, choice: number): Promise<void> {
  // we are going to be intercepting all chars
  menu.saveStringEnter = true

  menu.saveSlot = choice
  menu.saveOldString = menu.saveGameStrings[choice]
  menu.saveCharIndex = menu.saveGameStrings[choice].length
}

//
//      M_QuickSave
//
async function quickSaveResponse(menu: Menu, ch: number): Promise<void> {
  if (ch === 'y'.charCodeAt(0)) {
    await doSave(menu, menu.quickSaveSlot)
  }
}

export async function quickSave(menu: Menu): Promise<void> {
  if (menu.quickSaveSlot < 0) {
    menu.startControlPanel()
    await menu.readSaveStrings()
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
