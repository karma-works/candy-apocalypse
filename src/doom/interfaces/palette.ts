import { gammaTable } from './gamma'

export const enum Color {
  Red,
  Green,
  Blue,
  Alpha,
}

export class Palette {
  private colors = Array.from({ length: gammaTable.length },
    () => new Uint8ClampedArray(256 * 4),
  )

  constructor(buffer?: ArrayBuffer) {
    if (buffer) {
      const int = new Uint8Array(buffer)

      for (let g = 0; g < gammaTable.length; ++g) {
        let i = 0
        let o = 0
        let c: number
        do {
          c = gammaTable[g][int[i++]]
          this.colors[g][o++] = ((c << 8) + c) / 65535 * 255
          c = gammaTable[g][int[i++]]
          this.colors[g][o++] = ((c << 8) + c) / 65535 * 255
          c = gammaTable[g][int[i++]]
          this.colors[g][o++] = ((c << 8) + c) / 65535 * 255
          this.colors[g][o++] = 255
        } while (o < 256 * 4)
      }
    } else {
      for (let g = 0; g < gammaTable.length; ++g) {
        let i = 0
        let o = 0
        let c: number
        do {
          c = gammaTable[g][i]
          this.colors[g][o++] = ((c << 8) + c) / 65535 * 255
          c = gammaTable[g][i]
          this.colors[g][o++] = ((c << 8) + c) / 65535 * 255
          c = gammaTable[g][i]
          this.colors[g][o++] = ((c << 8) + c) / 65535 * 255
          i++
          this.colors[g][o++] = 255
        } while (o < 256 * 4)
      }
    }
  }

  get(i: number, gamma: number): Uint8ClampedArray {
    return this.colors[gamma].subarray(i * 4, i * 4 + 4)
  }
  getColors(color: Color, gamma: number): Uint8ClampedArray {
    return this.colors[gamma].filter((_, i) => i % 4 === color)
  }
}
