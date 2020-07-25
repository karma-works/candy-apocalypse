import { LINEHEIGHT, Menu } from './menu'
import { MenuItem, MenuStruct } from './typedefs'
import { Sound as DSound } from '../doom/sound'
import { OptionsMenu } from './options'
import { Patch } from '../rendering/defs/patch'
import { Video as RVideo } from '../rendering/video'
import { Wad } from '../wad/wad'

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
  private get wad(): Wad {
    return this.prevMenu.wad
  }

  constructor(public prevMenu: OptionsMenu) { }

  //
  // Change Sfx & Music volumes
  //
  routine(): void {
    this.rVideo.drawPatchDirect(60, 38, 0,
      this.wad.cacheLumpName('M_SVOL', Patch),
    )

    this.menu.drawThermo(
      this.x,
      this.y + LINEHEIGHT * (Sound.SfxVol + 1),
      16,
      this.dSound.sfxVolume,
    )
    this.menu.drawThermo(
      this.x,
      this.y + LINEHEIGHT * (Sound.MusicVol + 1),
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
  }
}
