import { DataTexture, RGBAFormat } from 'three'
import { Palette } from '../../interfaces/palette'

export class PaletteTexture extends DataTexture {
  private data: Uint8Array
  private _palette: Palette
  set palette(p: Palette) {
    if (p !== this._palette) {
      this._palette = p
      this.update()
    }
  }
  private _colorMap: Uint8ClampedArray
  set colorMap(m: Uint8ClampedArray) {
    if (m !== this._colorMap) {
      this._colorMap = m
      this.update()
    }
  }

  constructor() {
    const palette = new Uint8Array(256 * 4)
    super(palette, 256, 1, RGBAFormat)

    this.data = palette
    this._palette = new Palette()
    this._colorMap = new Uint8ClampedArray(
      Array.from({ length: 256 }, (_, i) => i),
    )
    this.colorSpace = 'srgb'
  }

  update(): void {
    const gamma = 0
    const palette = this._palette
    let mapped: number

    for (let i = 0; i < 256; ++i) {
      mapped = this._colorMap[i]
      this.data.set(
        palette.get(mapped, gamma),
        i * 4,
      )
    }

    this.needsUpdate = true
  }
}
