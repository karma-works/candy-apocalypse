import { LumpType } from '../wad/lump'

export class Reject extends Uint8Array {
  static type: LumpType = 'reject'
  static isType(_: ArrayBuffer, name: string): boolean {
    return name === 'REJECT'
  }

  constructor(buffer?: ArrayBuffer) {
    if (buffer) {
      super(buffer)
    } else {
      super()
    }
  }
}
