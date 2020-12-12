import { DataTexture, RGBFormat } from 'three'
import { Palette } from '../interfaces/palette'

export class PaletteTexture extends DataTexture {
  private data: Uint8Array
  private _palette: Palette
  set palette(p: Palette) {
    if (p !== this._palette) {
      this._palette = p
      this.update()
    }
  }

  constructor() {
    const palette = new Uint8Array(256 * 3)
    super(palette, 256, 1, RGBFormat)

    this.data = palette
    this._palette = new Palette()
  }

  update(): void {
    const gamma = 0
    const palette = this._palette

    for (let i = 0; i < 256; ++i) {
      this.data.set(
        palette.get(i, gamma).subarray(0, 3),
        i * 3,
      )
    }

    this.needsUpdate = true
  }
}
