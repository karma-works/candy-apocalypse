import { LINEHEIGHT, Menu } from './menu'
import { MenuItem, MenuStruct } from './typedefs'
import { SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { Sound as DSound } from '../doom/sound'
import { LumpReader } from '../wad/lump-reader'
import { OptionsMenu } from './options'
import { Patch } from '../rendering/defs/patch'
import { Video as RVideo } from '../rendering/video'

export const enum Sound {
  SfxVol,
  SfxEmpty1,
  MusicVol,
  SfxEmpty2,
  SoundEnd,
}

export class SoundMenu implements MenuStruct {
  numItems = Sound.SoundEnd

  menuItems: MenuItem[] = [
    {
      status: 2,
      name: 'M_SFXVOL',
      routine: this.sfxVol,
      alphaKey: 's',
    },
    {
      status: -1,
    },
    {
      status: 2,
      name: 'M_MUSVOL',
      routine: this.musicVol,
      alphaKey: 'm',
    },
    {
      status: -1,
    },
  ]

  x = 80
  y = 64
  lastOn = 0

  private get dSound(): DSound {
    return this.prevMenu.dSound
  }
  private get menu(): Menu {
    return this.prevMenu.menu
  }
  private get rVideo(): RVideo {
    return this.prevMenu.rVideo
  }
  private get wad(): LumpReader {
    return this.prevMenu.wad
  }

  constructor(public prevMenu: OptionsMenu) { }

  //
  // Change Sfx & Music volumes
  //
  routine(): void {
    const offsetX = (this.rVideo.width - SCREENWIDTH) / 2
    const offsetY = (this.rVideo.height - SCREENHEIGHT) / 2

    this.rVideo.drawPatch(60 + offsetX, 38 + offsetY, 0,
      this.wad.cacheLumpName('M_SVOL', Patch),
    )

    this.menu.drawThermo(
      this.x + offsetX,
      this.y + LINEHEIGHT * (Sound.SfxVol + 1) + offsetY,
      16,
      this.dSound.sfxVolume,
    )
    this.menu.drawThermo(
      this.x + offsetX,
      this.y + LINEHEIGHT * (Sound.MusicVol + 1) + offsetY,
      16,
      this.dSound.musicVolume,
    )
  }

  private sfxVol(choice: number): void {
    switch (choice) {
    case 0:
      if (this.dSound.sfxVolume) {
        --this.dSound.sfxVolume
      }
      break
    case 1:
      if (this.dSound.sfxVolume < 15) {
        ++this.dSound.sfxVolume
      }
      break
    }

    this.dSound.setSfxVolume(this.dSound.sfxVolume)
    this.menu.saveDefaults()
  }
  private musicVol(choice: number): void {
    switch (choice) {
    case 0:
      if (this.dSound.musicVolume) {
        --this.dSound.musicVolume
      }
      break
    case 1:
      if (this.dSound.musicVolume < 15) {
        ++this.dSound.musicVolume
      }
      break
    }

    this.dSound.setMusicVolume(this.dSound.musicVolume)
    this.menu.saveDefaults()
  }
}
