import { LINEHEIGHT, Menu } from './menu'
import { MenuItem, MenuStruct } from './typedefs'
import { optionsDef } from './options'

export const enum Sound {
  SfxVol,
  SfxEmpty1,
  MusicVol,
  SfxEmpty2,
  SoundEnd,
}

const soundMenu: MenuItem[] = [
  {
    status: 2,
    name: 'M_SFXVOL',
    routine: sfxVol,
    alphaKey: 's',
  },
  {
    status: -1,
    name: '',
  },
  {
    status: 2,
    name: 'M_MUSVOL',
    routine: musicVol,
    alphaKey: 'm',
  },
  {
    status: -1,
    name: '',
  },
]

export const soundDef: MenuStruct = {
  numItems: Sound.SoundEnd,
  prevMenu: optionsDef,
  menuItems: soundMenu,
  routine: drawSound,
  x: 80, y: 64,
  lastOn: 0,
}

//
// Change Sfx & Music volumes
//
function drawSound(menu: Menu): void {
  menu.rvideo.drawPatchDirect(60, 38, 0,
    menu.wad.cacheLumpName('M_SVOL'),
  )

  menu.drawThermo(
    soundDef.x,
    soundDef.y + LINEHEIGHT * (Sound.SfxVol + 1),
    16,
    0, // TODO
  )
  menu.drawThermo(
    soundDef.x,
    soundDef.y + LINEHEIGHT * (Sound.MusicVol + 1),
    16,
    0, // TODO
  )
}

function sfxVol(/* menu: Menu, choice: number */): void {
  // TODO
}
function musicVol(/* menu: Menu, choice: number */): void {
  // TODO
}

