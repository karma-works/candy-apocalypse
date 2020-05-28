import { LINEHEIGHT, Menu } from './menu'
import { MenuItem, MenuStruct } from './typedefs'
import { mainDef } from './doom-menu'

export const enum Load {
  Load1,
  Load2,
  Load3,
  Load4,
  Load5,
  Load6,
  LoadEnd,
}

export const loadMenu: MenuItem[] = [
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

//
// M_LoadGame & Cie.
//
async function drawLoad(menu: Menu): Promise<void> {
  menu.rvideo.drawPatchDirect(
    72, 28, 0,
    await menu.wad.cacheLumpName('M_LOADG'),
  )

  for (let i = 0; i < Load.LoadEnd; ++i) {
    await menu.drawSaveLoadBorder(loadDef.x, loadDef.y + LINEHEIGHT * i)
    menu.writeText(
      loadDef.x,
      loadDef.y + LINEHEIGHT * i,
      menu.saveGameStrings[i],
    )
  }
}

//
// User wants to load this game
//
async function loadSelect(menu: Menu/* , choice: number */): Promise<void> {
  menu.clearMenus()
}

//
// M_QuickLoad
//
async function quickLoadResponse(menu: Menu, choice: number): Promise<void> {
  if (choice === 'y'.charCodeAt(0)) {
    await loadSelect(menu/* , menu.quickSaveSlot */)
  }
}
export async function quickLoad(menu: Menu): Promise<void> {
  if (menu.quickSaveSlot < 0) {
    menu.startMessage(menu.doom.strings.qsavespot, undefined, false)
    return
  }
  menu.startMessage(
    menu.doom.strings.qlprompt(menu.saveGameStrings[menu.quickSaveSlot]),
    quickLoadResponse,
    true,
  )
}
