import { FRACUNIT } from '../misc/fixed'

//
// sky mapping
//

// SKY, store the number for name.
export const SKY_FLAT_NAME = 'F_SKY1'

// The sky map is 256*128*4 maps.
export const ANGLE_TO_SKY_SHIFT = 22

export class Sky {
  flatNum = 0
  texture = 0
  textureMid = 100 * FRACUNIT
}
