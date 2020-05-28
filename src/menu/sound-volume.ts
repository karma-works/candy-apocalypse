import { MenuItem, MenuStruct } from './typedefs'
import { Menu } from './menu'
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

function sfxVol(menu: Menu, choice: number): void {
  debugger
}
function musicVol(menu: Menu, choice: number): void {
  debugger
}


function drawSound(menu: Menu): void {
  debugger
}
