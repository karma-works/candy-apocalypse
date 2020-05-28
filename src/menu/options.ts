import { LINEHEIGHT, Menu } from './menu'
import { MenuItem, MenuStruct } from './typedefs'
import { mainDef } from './doom-menu'
import { soundDef } from './sound-volume'

const enum Options {
  EndGame,
  Messages,
  Detail,
  ScrnSize,
  OptionEmpty1,
  MouseSens,
  OptionEmpty2,
  SoundVol,
  OptEnd,
}

const optionsMenu: MenuItem[] = [
  {
    status: 1,
    name: 'M_ENDGAM',
    routine: endGame,
    alphaKey: 'e',
  },
  {
    status: 1,
    name: 'M_MESSG',
    routine: changeMessages,
    alphaKey: 'm',
  },
  {
    status: 1,
    name: 'M_DETAIL',
    routine: changeDetail,
    alphaKey: 'g',
  },
  {
    status: 2,
    name: 'M_SCRNSZ',
    routine: sizeDisplay,
    alphaKey: 's',
  },
  {
    status: -1,
    name: '',
  },
  {
    status: 2,
    name: 'M_MSENS',
    routine: changeSensitivity,
    alphaKey: 'm',
  },
  {
    status: -1,
    name: '',
  },
  {
    status: 1,
    name: 'M_SVOL',
    routine: sound,
    alphaKey: 's',
  },
]

export const optionsDef: MenuStruct = {
  numItems: Options.OptEnd,
  prevMenu: mainDef,
  menuItems: optionsMenu,
  routine: drawOptions,
  x: 60, y: 37,
  lastOn: 0,
}

//
//      Toggle messages on/off
//
export async function changeMessages(menu: Menu): Promise<void> {
  // TODO
  menu.headsUp.showMessages = !menu.headsUp.showMessages
  menu.headsUp.messageDontFuckWithMe = true
}

//
// M_EndGame
//
async function endGameResponse(menu: Menu, ch: number): Promise<void> {
  if (ch !== 'y'.charCodeAt(0)) {
    return
  }

  menu.currentMenu.lastOn = menu.itemOn
  menu.clearMenus()
  menu.doom.startTitle()
}
export async function endGame(menu: Menu): Promise<void> {
  menu.startMessage(menu.doom.strings.endgame, endGameResponse, true)
}

async function changeSensitivity(menu: Menu, choice: number): Promise<void> {
  switch (choice) {
  case 0:
    if (menu.game.mouseSensitivity) {
      --menu.game.mouseSensitivity
    }
    break
  case 1:
    if (menu.game.mouseSensitivity < 9) {
      ++menu.game.mouseSensitivity
    }
    break
  }
}

export async function changeDetail(/* menu: Menu, choice: number */): Promise<void> {
  // TODO
}
export async function sizeDisplay(menu: Menu, choice: number): Promise<void> {
  switch (choice) {
  case 0:
    if (menu.rendering.screenSize > 0) {
      --menu.rendering.screenBlocks
      --menu.rendering.screenSize
    }
    break
  case 1:
    if (menu.rendering.screenSize < 8) {
      ++menu.rendering.screenBlocks
      ++menu.rendering.screenSize
    }
    break
  }
  menu.rendering.setViewSize(
    menu.rendering.screenBlocks,
    menu.rendering.detailLevel,
  )
}
async function sound(menu: Menu): Promise<void> {
  menu.setupNextMenu(soundDef)
}

const detailNames = [ 'M_GDHIGH', 'M_GDLOW' ]
const msgNames = [ 'M_MSGOFF', 'M_MSGON' ]


async function drawOptions(menu: Menu): Promise<void> {
  menu.rvideo.drawPatchDirect(
    108, 15, 0,
    await menu.wad.cacheLumpName('M_OPTTTL'),
  )

  menu.rvideo.drawPatchDirect(
    optionsDef.x + 175, optionsDef.y + LINEHEIGHT * Options.Detail, 0,
    await menu.wad.cacheLumpName(detailNames[menu.rendering.detailLevel]),
  )

  menu.rvideo.drawPatchDirect(
    optionsDef.x + 120, optionsDef.y + LINEHEIGHT * Options.Messages, 0,
    await menu.wad.cacheLumpName(msgNames[menu.headsUp.showMessages ? 0 : 1]),
  )

  await menu.drawThermo(
    optionsDef.x,
    optionsDef.y + LINEHEIGHT * (Options.MouseSens + 1),
    10,
    menu.game.mouseSensitivity,
  )

  await menu.drawThermo(
    optionsDef.x,
    optionsDef.y + LINEHEIGHT * (Options.ScrnSize + 1),
    9,
    menu.rendering.screenSize,
  )

}
