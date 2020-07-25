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
  columns = new Array<Column>()

  constructor()
  constructor(buffer: ArrayBuffer)
  constructor(columns: readonly Column[])
  constructor(arg: ArrayBuffer | readonly Column[] = []) {
    if (arg instanceof ArrayBuffer) {
      const int16 = new Int16Array(arg, 0, 4)
      this.width = int16[0]
      this.height = int16[1]
      this.leftOffset = int16[2]
      this.topOffset = int16[3]
      this.columnOfs = [ ...new Uint32Array(arg, 4 * int16.BYTES_PER_ELEMENT, this.width) ]

      let begin: number
      let end: number
      for (let col = 0; col < this.columnOfs.length; ++col) {
        begin = this.columnOfs[col]
        end = this.columnOfs[col + 1]
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
