import { Post } from './post'
// column_t is a list of 0 or more post_t, (byte)-1 terminated
export class Column {
  posts = new Array<Post>()

  constructor()
  constructor(buffer: ArrayBuffer)
  constructor(posts: readonly Post[])
  constructor(arg: ArrayBuffer | readonly Post[] = []) {
    if (arg instanceof ArrayBuffer) {
      let i = 0
      let post = new Post(arg.slice(i))
      while (post.topDelta !== 0xff) {
        this.posts.push(post)
        i += post.length + 4
        post = new Post(arg.slice(i))
      }
    } else if (Array.isArray(arg)) {
      this.posts = [ ...arg ]
    }
  }
}
