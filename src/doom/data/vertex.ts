//
// INTERNAL MAP TYPES
//  used by play and refresh
//
//
// Your plain vanilla vertex.
// Note: transformed values not buffered locally,
//  like some DOOM-alikes ("wt", "WebView") did.
//
export class Vertex {
  constructor(
    public x: number = 0,
    public y: number = 0,
  ) { }
}
