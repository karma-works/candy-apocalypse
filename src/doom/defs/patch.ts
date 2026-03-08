import { Column } from './column'
import { LumpType } from '../../wad/lump'
// Patches.
// A patch holds one or more columns.
// Patches are used for sprites and all masked pictures,
// and we compose textures from the TEXTURE1/2 lists
// of patches.
export class Patch {
  static type: LumpType = 'patch'
  static isType(buffer: ArrayBuffer): boolean {
    try {
      new Patch(buffer)
      return true
    } catch {
      return false
    }
  }

  // bounding box size
  width: number;
  height: number;
  // pixels to the left of origin
  leftOffset: number;
  // pixels below the origin
  topOffset: number;
  columnOfs: number[];
  columns = new Array<Column>()

  constructor()
  constructor(buffer: ArrayBuffer)
  constructor(columns: readonly Column[])
  constructor(arg: ArrayBuffer | readonly Column[] = []) {
    if (arg instanceof ArrayBuffer) {
      const int16 = new Int16Array(arg, 0, 4)
      this.width = int16[0]
      if (this.width <= 0) {
        throw 'patch width is null or negative'
      }
      this.height = int16[1]
      if (this.height <= 0) {
        throw 'patch height is null or negative'
      }
      this.leftOffset = int16[2]
      this.topOffset = int16[3]
      this.columnOfs = [ ...new Uint32Array(arg, 4 * int16.BYTES_PER_ELEMENT, this.width) ]

      let begin: number
      let end: number
      for (let col = 0; col < this.columnOfs.length; ++col) {
        begin = this.columnOfs[col]
        end = this.columnOfs[col + 1]
        if (begin >= end) {
          throw 'column offset not sorted'
        }
        this.columns[col] = new Column(arg.slice(begin, end))
      }
    } else {
      this.width = 0
      this.height = 0
      this.leftOffset = 0
      this.topOffset = 0
      this.columnOfs = []
      this.columns = [ ...arg ]
    }
  }
}
