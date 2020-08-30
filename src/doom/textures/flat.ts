import { LumpType } from '../wad/lump'

const FLAT_SIZE = 64 * 64

export class Flat extends Uint8ClampedArray {
  static type: LumpType = 'flat'
  static isType(buffer: ArrayBuffer): boolean {
    return buffer.byteLength === FLAT_SIZE
  }

  constructor(buffer?: ArrayBuffer) {
    if (buffer) {
      super(buffer)
    } else {
      super(FLAT_SIZE)
    }
  }
}
