// posts are runs of non masked source pixels
export class Post {
  // -1 is the last post in a column
  topDelta: number
  // length data bytes follows
  length: number

  bytes: Uint8Array

  constructor(private buffer: ArrayBuffer) {
    const int8 = new Int8Array(buffer, 0)
    this.topDelta = int8[0]

    if (this.topDelta !== -1) {
      this.length = int8[1]
      // 2 or 3
      this.bytes = new Uint8Array(buffer, 3, this.length)
    } else {
      this.length = 0
      this.bytes = new Uint8Array([])
    }
  }
}

// column_t is a list of 0 or more post_t, (byte)-1 terminated
export class Column {
  constructor(private buffer: ArrayBuffer) { }

  *[Symbol.iterator](): Generator<Post, void> {
    let i = 0
    let post = new Post(this.buffer.slice(i))

    while (post.topDelta !== -1) {
      yield post

      i += post.length + 4
      post = new Post(this.buffer.slice(i))
    }
  }
}

// Patches.
// A patch holds one or more columns.
// Patches are used for sprites and all masked pictures,
// and we compose textures from the TEXTURE1/2 lists
// of patches.
export class Patch {
  // bounding box size
  width: number
  height: number
  // pixels to the left of origin
  leftOffset: number
  // pixels below the origin
  topOffset: number

  private columnOfs: number[]

  constructor(private buffer: ArrayBuffer) {
    const int16 = new Int16Array(buffer, 0, 4)

    this.width = int16[0]
    this.height = int16[1]
    this.leftOffset = int16[2]
    this.topOffset = int16[3]

    this.columnOfs = [ ...new Uint32Array(buffer, 4 * int16.BYTES_PER_ELEMENT, this.width) ]
  }

  getColumn(col: number): Column {
    const begin = this.columnOfs[col]
    const end = this.columnOfs[col + 1]

    return new Column(this.buffer.slice(begin, end))
  }

}
