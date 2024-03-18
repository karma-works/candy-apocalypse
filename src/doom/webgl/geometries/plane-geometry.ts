import { Float32BufferAttribute, Matrix4, ShapeGeometry, ShapePath, Vector2 } from 'three';
import { FRACUNIT } from '../../misc/fixed';
import { Line } from '../../rendering/defs/line';
import { Sector } from '../../rendering/defs/sector';
import { Vertex } from '../../rendering/data/vertex';

const rotate1 = new Matrix4()
rotate1.set(
  1, 0, 0, 0,
  0, 0, 1, 0,
  0, -1, 0, 0,
  0, 0, 0, 1,
)
const rotate2 = new Matrix4()
rotate2.set(
  0, 0, -1, 0,
  0, 1, 0, 0,
  1, 0, 0, 0,
  0, 0, 0, 1,
)

export class PlaneGeometry extends ShapeGeometry {
  constructor(
    sector: Sector,
    lines: readonly Line[],
  ) {
    const shapePath = new ShapePath()

    const clockwise = lines.filter(({ frontSector }) => frontSector === sector)
      .map(({ v1, v2 }) => [ v1, v2 ] as [Vertex, Vertex])
    const counterClockWise = lines.filter(({ backSector }) => backSector === sector)
      .map(({ v1, v2 }) => [ v2, v1 ] as [Vertex, Vertex])
    const vertices = [ ...clockwise, ...counterClockWise ]

    let firstVertex = vertices[0]
    let lastVertex: [Vertex, Vertex] | null = null

    let candidates: [Vertex, Vertex][]

    while (vertices.length > 0) {
      if (lastVertex === null) {
        firstVertex = lastVertex = vertices[0]
        vertices.shift()

        shapePath.moveTo(lastVertex[0].x / FRACUNIT, lastVertex[0].y / FRACUNIT)
      }

      candidates = vertices.filter(([ v1 ]) => lastVertex &&
        v1.x === lastVertex[1].x && v1.y === lastVertex[1].y)

      if (candidates.length === 0) {
        // Before giving up and starting a new path, find closest point
        const lastPoint = lastVertex[1]
        const closest = [ firstVertex, ...vertices ]
          .sort(([ a ], [ b ]) => {
            // Does not bother with sqrt
            const distA = Math.pow(a.x - lastPoint.x, 2) +
              Math.pow(a.y - lastPoint.y, 2)
            const distB = Math.pow(b.x - lastPoint.x, 2) +
              Math.pow(b.y - lastPoint.y, 2)

            return distA - distB
          })

        if (closest[0] === firstVertex) {
          lastVertex = null
        } else {
          candidates = closest
        }
      }

      if (candidates.length === 0) {
        lastVertex = null
      } else {
        lastVertex = candidates[0]
        shapePath.lineTo(lastVertex[0].x / FRACUNIT, lastVertex[0].y / FRACUNIT)
        vertices.splice(vertices.indexOf(lastVertex), 1)
      }
    }

    // Quick fix for bad shapes
    // - The Ultimate DOOM: E4M3
    // - Doom II - Hell on Earth: MAP19
    // - Final Doom - TNT: Evilution: MAP27
    // - Final Doom - The Plutonia Experiment: MAP31
    shapePath.subPaths = shapePath.subPaths.filter(h => h.curves.length)
    const shapes = shapePath.toShapes(false)
    shapes.forEach(s => s.holes = s.holes.filter(h => h.curves.length))

    super(shapes)

    // Use matrix for more precise rotation
    // this.rotateX(-Math.PI / 2)
    this.applyMatrix4(rotate1)

    // this.rotateY(-Math.PI / 2)
    this.applyMatrix4(rotate2)

    const uv = this.attributes.uv as Float32BufferAttribute
    const vec2 = new Vector2()
    for (let i = 0; i < uv.count; ++i) {
      vec2.fromBufferAttribute(uv, i)
      vec2.divideScalar(64)
      uv.setXY(i, vec2.x, vec2.y)
    }
  }
}
