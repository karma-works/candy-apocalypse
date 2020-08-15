import { LumpType } from '../../wad/lump'

export class Sfx {
  static type: LumpType = 'sfx'
  static isType(buffer: ArrayBuffer): boolean {
    try {
      new Sfx(buffer)
      return true
    } catch {
      return false
    }
  }


  format: number
  sampleRate: number

  samples: Uint8Array

  constructor(buffer: ArrayBuffer) {
    const uint16 = new Uint16Array(buffer, 0x00, 2);
    [ this.format, this.sampleRate ] = uint16

    if (this.format !== 3) {
      throw `unknown sfx format ${this.format}`
    }
    // if (this.sampleRate !== 11025) {
    //   throw `invalid sfx sampleRate ${this.sampleRate}`
    // }

    const uint32 = new Uint32Array(buffer, 0x04, 1)
    const length = uint32[0] - 32

    this.samples = new Uint8Array(buffer, 0x18, length)
  }
}
