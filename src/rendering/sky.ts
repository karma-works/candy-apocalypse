import { FRACUNIT } from '../misc/fixed'

//
// sky mapping
//

// SKY, store the number for name.
export const SKY_FLAT_NAME = 'F_SKY1'

// The sky map is 256*128*4 maps.
export const ANGLE_TO_SKY_SHIFT = 22

export class Sky {
  skyFlatNum = 0
  skyTexture = 0
  skyTextureMid = 0

  //
  // R_InitSkyMap
  // Called whenever the view size changes.
  //
  initSkyMap(): void {
    this.skyTextureMid = 100 * FRACUNIT
  }
}
