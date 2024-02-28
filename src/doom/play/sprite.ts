import { Player } from '../doom/player'
import { State } from '../doom/info/state'
import { states } from '../doom/info/states'

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
  static sizeOf = 16

  // a NULL state means not active
  state: State<unknown, [Player, PSpriteDef]> | null = null
  tics = 0
  sX = 0
  sY = 0

  constructor(public id: number) { }

  reset(): void {
    this.state = null
    this.tics = 0
    this.sX = 0
    this.sY = 0
  }

  unArchive(buffer: ArrayBuffer): void {
    const int32 = new Int32Array(buffer)
    let int32Ptr = 0
    const state = int32[int32Ptr++]
    if (state) {
      this.state = states[state] as State<unknown, [unknown]>
    }
    this.tics = int32[int32Ptr++]
    this.sX = int32[int32Ptr++]
    this.sY = int32[int32Ptr++]
  }

  archive(): ArrayBuffer {
    return new Int32Array([
      states.indexOf(this.state as State<unknown, [unknown]>),
      this.tics,
      this.sX,
      this.sY,
    ]).buffer
  }
}
