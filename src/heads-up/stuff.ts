import { Patch } from '../rendering/patch'
import { Wad } from '../wad/wad'

// the first font characters
export const HU_FONTSTART = '!'.charCodeAt(0)
// the last font characters
export const HU_FONTEND = '_'.charCodeAt(0)

// Calculate # of glyphs in font.
export const HU_FONTSIZE =
    HU_FONTEND - HU_FONTSTART + 1

export class HeadsUp {
  font: Patch[] = []

  messageOn = false
  messageDontFuckWithMe = false
  messageNotToBeFuckedWith = false

  showMessages = true

  constructor(private wad: Wad) { }

  async init(): Promise<void> {
    let buffer: string
    let paddedJ: string
    let j = HU_FONTSTART
    for (let i = 0; i < HU_FONTSIZE; ++i) {
      paddedJ = `${j++}`
      paddedJ = '0'.repeat(3 - paddedJ.length) + paddedJ
      buffer = 'STCFN' + paddedJ

      this.font[i] = new Patch(await this.wad.cacheLumpName(buffer))
    }
  }
}
