import { FRACBITS } from '../../misc/fixed'
import { Sector } from './sector'

//
// The SideDef.
//
export class Side {
  static sizeOf = 10

  constructor(
    // add this to the calculated texture column
    public textureOffset: number,
    // add this to the calculated texture top
    public rowOffset: number,
    // Texture indices.
    // We do not maintain names here.
    public topTexture: number,
    public bottomTexture: number,
    public midTexture: number,
    // Sector the SideDef is facing.
    public sector: Sector,
  ) { }

  unArchive(buffer: ArrayBuffer): void {
    const int16 = new Int16Array(buffer)
    let int16Ptr = 0
    this.textureOffset = int16[int16Ptr++] << FRACBITS
    this.rowOffset = int16[int16Ptr++] << FRACBITS
    this.topTexture = int16[int16Ptr++]
    this.bottomTexture = int16[int16Ptr++]
    this.midTexture = int16[int16Ptr++]
  }

  archive(): ArrayBuffer {
    return new Int16Array([
      this.textureOffset >> FRACBITS,
      this.rowOffset >> FRACBITS,
      this.topTexture,
      this.bottomTexture,
      this.midTexture,
    ]).buffer
  }
}
