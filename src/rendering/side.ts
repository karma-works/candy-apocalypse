import { Sector } from './sector'
//
// The SideDef.
//
export interface Side {
  // add this to the calculated texture column
  textureOffset: number;
  // add this to the calculated texture top
  rowOffset: number;
  // Texture indices.
  // We do not maintain names here.
  topTexture: number;
  bottomTexture: number;
  midTexture: number;
  // Sector the SideDef is facing.
  sector: Sector;
}
