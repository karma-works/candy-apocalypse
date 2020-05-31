import { State } from '../doom/info'

//
// Overlay psprites are scaled shapes
// drawn directly on the view screen,
// coordinates are given for a 320*200 view screen.
//
export const enum PSpriteNum {
    Weapon,
    Flash,
    NUMPSPRITES,
}

export interface PSpriteDef {
  // a NULL state means not active
  state: State | null
  tics: number
  sX: number
  sY: number
}
