// posts are runs of non masked source pixels
export class Post {
  // -1 is the last post in a column
  topDelta: number;
  // length data bytes follows
  length: number;
  bytes: Uint8Array;

  constructor()
  constructor(length: number)
  constructor(buffer: ArrayBuffer)
  constructor(arg: ArrayBuffer | number = 0) {
    if (typeof arg === 'number') {
      this.topDelta = 0
      this.length = arg
      this.bytes = new Uint8Array(arg)
    } else {
      const int8 = new Uint8Array(arg, 0)

      this.topDelta = int8[0]
      if (this.topDelta !== 0xff) {
        this.length = int8[1]
        this.bytes = new Uint8Array(arg, 3, this.length)
      } else {
        this.length = 0
        this.bytes = new Uint8Array([])
      }
    }
  }
}
