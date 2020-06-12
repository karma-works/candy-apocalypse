// posts are runs of non masked source pixels
export class Post {
  // -1 is the last post in a column
  topDelta: number;
  // length data bytes follows
  length: number;
  bytes: Uint8Array;
  constructor(buffer: ArrayBuffer) {
    const int8 = new Uint8Array(buffer, 0)
    this.topDelta = int8[0]
    if (this.topDelta !== 0xff) {
      this.length = int8[1]
      // 2 or 3
      this.bytes = new Uint8Array(buffer, 3, this.length)
    } else {
      this.length = 0
      this.bytes = new Uint8Array([])
    }
  }
}
