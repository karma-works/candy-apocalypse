import { Column } from './column'
// Patches.
// A patch holds one or more columns.
// Patches are used for sprites and all masked pictures,
// and we compose textures from the TEXTURE1/2 lists
// of patches.
export class Patch {
  // bounding box size
  width: number;
  height: number;
  // pixels to the left of origin
  leftOffset: number;
  // pixels below the origin
  topOffset: number;
  columnOfs: number[];
  constructor(private buffer?: ArrayBuffer) {
    if (buffer) {
      const int16 = new Int16Array(buffer, 0, 4)
      this.width = int16[0]
      this.height = int16[1]
      this.leftOffset = int16[2]
      this.topOffset = int16[3]
      this.columnOfs = [ ...new Uint32Array(buffer, 4 * int16.BYTES_PER_ELEMENT, this.width) ]
    } else {
      this.width = 0
      this.height = 0
      this.leftOffset = 0
      this.topOffset = 0
      this.columnOfs = []
    }
  }
  getColumn(col: number): Column {
    if (this.buffer === undefined) {
      throw 'this.buffer = undefined'
    }
    const begin = this.columnOfs[col]
    const end = this.columnOfs[col + 1]
    return new Column(this.buffer.slice(begin, end))
  }
}
