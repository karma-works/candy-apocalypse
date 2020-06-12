import { State } from '../doom/info'

//
// Frame flags:
// handles maximum brightness (torches, muzzle flare, light sources)
//
// flag in thing->frame
export const FF_FULLBRIGHT = 0x8000
export const FF_FRAMEMASK = 0x7fff

//
// Overlay psprites are scaled shapes
// drawn directly on the view screen,
// coordinates are given for a 320*200 view screen.
//
export const enum PSpriteNum {
    Weapon,
    Flash,
    NUM_PSPRITES,
}

export class PSpriteDef {
  // a NULL state means not active
  state: State | null = null
  tics = 0
  sX = 0
  sY = 0

  reset(): void {
    this.state = null
    this.tics = 0
    this.sX = 0
    this.sY = 0
  }
}
