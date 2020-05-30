import { BBox } from '../misc/bbox'

//
// INTERNAL MAP TYPES
//  used by play and refresh
//

//
// Your plain vanilla vertex.
// Note: transformed values not buffered locally,
//  like some DOOM-alikes ("wt", "WebView") did.
//
export interface Vertex {
  x: number
  y: number
}

//
// The SECTORS record, at runtime.
// Stores things/mobjs.
//
export interface Sector {
    floorHeight: number
    ceilingHeight: number
    floorPic: number
    ceilingPic: number
    lightLevel: number
    special: number
    tag: number

    // 0 = untraversed, 1,2 = sndlines -1
    soundTraversed: number

    // thing that made a sound (or null)
    soundTarget: /* MObj |  */null

    // mapblock bounding box for height changes
    blockBox: number[]

    // origin for any sounds played by the sector
    soundOrg: /* DegenMObj |  */null

    // if == validcount, already checked
    validCount: number

    // list of mobjs in sector
    thingList: /* MObj |  */null

    // thinker_t for reversable actions
    specialData: null

    lineCount: number
    // [linecount] size
    lines: Line[]
}

//
// The SideDef.
//
export interface Side {
  // add this to the calculated texture column
  textureOffset: number

  // add this to the calculated texture top
  rowOffset: number

  // Texture indices.
  // We do not maintain names here.
  topTexture: number
  bottomTexture: number
  midTexture: number

  // Sector the SideDef is facing.
  sector: Sector
}

//
// Move clipping aid for LineDefs.
//
export const enum SlopeType {
  Horizontal,
  Vertical,
  Positive,
  Negative,
}


export interface Line {
  // Vertices, from v1 to v2.
  v1: Vertex
  v2: Vertex

  // Precalculated v2 - v1 for side checking.
  dX: number
  dY: number

  // Animation related.
  flags: number
  special: number
  tag: number

  // Visual appearance: SideDefs.
  //  sidenum[1] will be -1 if one sided
  sideNum: number[]

  // Neat. Another bounding box, for the extent
  //  of the LineDef.
  bbox: BBox

  // To aid move clipping.
  slopeType :SlopeType

  // Front and back sector.
  // Note: redundant? Can be retrieved from SideDefs.
  frontSector: Sector | null
  backSector: Sector | null

  // if == validcount, already checked
  validCount: number

  // thinker_t for reversable actions
  specialData: null
}

//
// A SubSector.
// References a Sector.
// Basically, this is a list of LineSegs,
//  indicating the visible walls that define
//  (all or some) sides of a convex BSP leaf.
//
export interface SubSector {
  sector: Sector | null
  numLines: number
  firstLine: number
}

//
// The LineSeg.
//
export interface Seg {
  v1: Vertex
  v2: Vertex

  offset: number

  angle: number

  sideDef: Side
  lineDef: Line

  // Sector references.
  // Could be retrieved from linedef, too.
  // backsector is NULL for one sided lines
  frontSector: Sector
  backSector: Sector | null
}

//
// BSP node.
//
export interface Node {
  // Partition line.
  x: number
  y: number
  dX: number
  dY: number

  // Bounding box for each child.
  bbox: BBox[]

  // If NF_SUBSECTOR its a subsector.
  children: number[]
}

// posts are runs of non masked source pixels
export class Post {
  // -1 is the last post in a column
  topDelta: number
  // length data bytes follows
  length: number

  bytes: Uint8Array

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

  columnOfs: number[]

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
