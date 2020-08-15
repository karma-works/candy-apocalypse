import { FRACBITS } from '../misc/fixed'
import { LumpType } from '../wad/lump'
import { Vertex } from '../rendering/data/vertex'

export class VertexArray extends Array<MapVertex> {
  static type: LumpType = 'vertexes'
  static isType(_: ArrayBuffer, name: string): boolean {
    return name === 'VERTEXES'
  }
  static get [Symbol.species](): ArrayConstructor {
    return Array
  }

  constructor(buffer: ArrayBuffer) {
    const numVertexes = buffer.byteLength / MapVertex.sizeOf
    if (numVertexes !== Math.floor(numVertexes)) {
      throw 'invalid length of vertexes'
    }

    super(numVertexes)

    // Copy and convert vertex coordinates,
    // internal representation as fixed.
    for (let i = 0, mlPtr = 0;
      i < numVertexes;
      ++i, mlPtr += MapVertex.sizeOf
    ) {
      this[i] = new MapVertex(buffer.slice(mlPtr))
    }
  }

  getVertexes(): Vertex[] {
    return this.map(({ x, y }) =>
      new Vertex(x << FRACBITS, y << FRACBITS),
    )
  }
}

// A single Vertex.
class MapVertex {
  static sizeOf = 2 + 2

  x: number
  y: number

  constructor(buffer: ArrayBuffer) {
    const int16 = new Int16Array(buffer, 0, 2)
    this.x = int16[0]
    this.y = int16[1]
  }
}
