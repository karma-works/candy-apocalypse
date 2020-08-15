import { FRACBITS } from '../misc/fixed'
import { LumpType } from '../wad/lump'
import { Node } from '../rendering/bsp/node'

export class NodeArray extends Array<MapNode> {
  static type: LumpType = 'nodes'
  static isType(_: ArrayBuffer, name: string): boolean {
    return name === 'NODES'
  }
  static get [Symbol.species](): ArrayConstructor {
    return Array
  }

  constructor(buffer: ArrayBuffer) {
    const numNodes = buffer.byteLength / MapNode.sizeOf
    if (numNodes !== Math.floor(numNodes)) {
      throw 'invalid length of nodes'
    }

    super(numNodes)

    for (let i = 0, msPtr = 0;
      i < numNodes;
      ++i, msPtr += MapNode.sizeOf
    ) {
      this[i] = new MapNode(buffer.slice(msPtr))
    }
  }

  getNodes(): Node[] {
    return this.map(n =>
      new Node(
        n.x << FRACBITS,
        n.y << FRACBITS,
        n.dX << FRACBITS,
        n.dY << FRACBITS,
        n.children,
        n.bbox,
      ),
    )
  }

}

// Indicate a leaf.
class MapNode {
  static sizeOf = 2 + 2 + 2 + 2 + 2 * 4 * 2 + 2 * 2

  // Partition line from (x,y) to x+dx,y+dy)
  x: number
  y: number
  dX: number
  dY: number

  // Bounding box for each child,
  // clip against view frustum.
  bbox: number[][]

  // If NF_SUBSECTOR its a subsector,
  // else it's a node of another subtree.
  children: number[]

  constructor(buffer: ArrayBuffer) {
    const int16 = new Int16Array(buffer, 0, 12)
    const uint16 = new Uint16Array(buffer, 24, 2)

    this.x = int16[0]
    this.y = int16[1]
    this.dX = int16[2]
    this.dY = int16[3]
    this.bbox = [
      [ int16[4], int16[5], int16[6], int16[7] ],
      [ int16[8], int16[9], int16[10], int16[11] ],
    ]
    this.children = [ uint16[0], uint16[1] ]
  }
}
