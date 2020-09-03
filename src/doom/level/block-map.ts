import { FRACBITS } from '../misc/fixed'
import { LumpType } from '../wad/lump'

// BLOCKMAP
// Created from axis aligned bounding box
// of the map, a rectangular array of
// blocks of size ...
// Used to speed up collision detection
// by spatial subdivision in 2D.
//

export class BlockMap {
  static type: LumpType = 'block-map'
  static isType(_: ArrayBuffer, name: string): boolean {
    return name === 'BLOCKMAP'
  }

  // Blockmap size.
  width: number
  // size in mapblocks
  height: number
  // origin of block map
  originX: number
  originY: number

  private int16: Int16Array

  constructor(buffer = new ArrayBuffer(0)) {
    this.int16 = new Int16Array(buffer);

    [
      this.originX, this.originY, this.width, this.height,
    ] = this.int16

    this.originX <<= FRACBITS
    this.originY <<= FRACBITS
  }

  *getLines(x: number, y: number): Generator<number, void> {
    let offset = y * this.width + x
    offset = this.int16[offset + 4]

    for (let list = this.int16[offset];
      list !== -1;
      offset++, list = this.int16[offset]
    ) {
      yield list
    }
  }
}
