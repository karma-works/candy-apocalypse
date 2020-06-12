import { Post } from './post'
// column_t is a list of 0 or more post_t, (byte)-1 terminated
export class Column {
  constructor(private buffer: ArrayBuffer) { }
  *[Symbol.iterator](): Generator<Post, void> {
    let i = 0
    let post = new Post(this.buffer.slice(i))
    while (post.topDelta !== 0xff) {
      yield post
      i += post.length + 4
      post = new Post(this.buffer.slice(i))
    }
  }
}
