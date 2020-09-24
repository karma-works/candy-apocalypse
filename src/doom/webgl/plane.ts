import {
  BackSide,
  FrontSide,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  ShapeGeometry,
  ShapePath,
  Side,
} from 'three'
import { FRACBITS } from '../misc/fixed'
import { Plane as LegacyPlane } from '../rendering/plane'
import { Line } from '../rendering/defs/line'
import { Rendering } from './rendering'
import { Sector } from '../rendering/defs/sector'
import { Seg } from '../rendering/segs/seg'
import { Textures } from './textures'
import { Vertex } from '../rendering/data/vertex'

type FloorOrCeilingMesh = Mesh<ShapeGeometry, MeshBasicMaterial>

interface FloorAndCeiling {
  sector: Sector
  floor: FloorOrCeilingMesh
  ceiling: FloorOrCeilingMesh
}

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

export class Plane extends LegacyPlane {

  private facs = new Array<FloorAndCeiling>()

  get textures(): Textures {
    return this.rendering.textures
  }

  constructor(protected rendering: Rendering) {
    super(rendering)
  }

  reset(): void {
    this.facs.forEach(w => {
      w.floor.geometry.dispose()
      w.ceiling.geometry.dispose()
    })

    this.facs.length = 0
  }

  setVisiblePlane(seg: Seg): void {
    let idx = this.level.sectors.indexOf(seg.frontSector)

    this.facs[idx].ceiling.visible = true
    this.facs[idx].floor.visible = true

    if (seg.backSector !== null) {
      idx = this.level.sectors.indexOf(seg.backSector)
      this.facs[idx].ceiling.visible = true
      this.facs[idx].floor.visible = true
    }
  }

  clearPlanes(): void {
    super.clearPlanes()
    this.facs.forEach(({ floor, ceiling }) => {
      ceiling.visible = false
      floor.visible = false
    })
  }

  drawPlanes(): void {
    this.facs.forEach(fac => {
      if (fac.floor.visible) {
        this.updateGeometryHeight(fac.floor, fac.sector.floorHeight)
        this.updateTextureMap(fac.floor, fac.sector.floorPic)
      }

      if (fac.ceiling.visible) {
        this.updateGeometryHeight(fac.ceiling, fac.sector.ceilingHeight)
        this.updateTextureMap(fac.ceiling, fac.sector.ceilingPic)
      }
    })
  }

  createPlane(i: number, sector: Sector, lines: Line[], parent: Object3D): void {
    const fac: FloorAndCeiling = {
      sector,
      floor: this.createMesh(sector, [ ...lines ], FrontSide),
      ceiling: this.createMesh(sector, [ ...lines ], BackSide),
    }
    this.facs[i] = fac

    parent.add(fac.floor)
    parent.add(fac.ceiling)
  }

  private createMesh(sector: Sector, lines: Line[], side: Side): FloorOrCeilingMesh {
    const shapePath = new ShapePath()

    const clock = lines.filter(({ frontSector }) => frontSector === sector)
      .map(({ v1, v2 }) => [ v1, v2 ] as [Vertex, Vertex])
    const antiClock = lines.filter(({ backSector }) => backSector === sector)
      .map(({ v1, v2 }) => [ v2, v1 ] as [Vertex, Vertex])
    const vertexes = [ ...clock, ...antiClock ]

    let firstVertexes = vertexes[0]
    let lastVertexes: [Vertex, Vertex] | null = null

    let candidates: [Vertex, Vertex][]

    while (vertexes.length > 0) {
      if (lastVertexes === null) {
        firstVertexes = lastVertexes = vertexes[0]
        vertexes.shift()

        shapePath.moveTo(lastVertexes[0].x >> FRACBITS, lastVertexes[0].y >> FRACBITS)
      }

      candidates = vertexes.filter(([ v1 ]) => lastVertexes &&
        v1.x === lastVertexes[1].x && v1.y === lastVertexes[1].y)

      if (candidates.length === 0) {
        // Before giving up and starting a new path, find closest point
        const lastPoint = lastVertexes[1]
        const closest = [ firstVertexes, ...vertexes ]
          .sort(([ a ], [ b ]) => {
            // Does not bother with sqrt
            const distA = Math.pow(a.x - lastPoint.x, 2) +
              Math.pow(a.y - lastPoint.y, 2)
            const distB = Math.pow(b.x - lastPoint.x, 2) +
              Math.pow(b.y - lastPoint.y, 2)

            return distA - distB
          })

        if (closest[0] === firstVertexes) {
          lastVertexes = null
        } else {
          candidates = closest
        }
      }

      if (candidates.length === 0) {
        lastVertexes = null
      } else {
        lastVertexes = candidates[0]
        shapePath.lineTo(lastVertexes[0].x >> FRACBITS, lastVertexes[0].y >> FRACBITS)
        vertexes.splice(vertexes.indexOf(lastVertexes), 1)
      }
    }

    const geometry = new ShapeGeometry(shapePath.toShapes(false))
    geometry.applyMatrix4(rotate1)
    geometry.applyMatrix4(rotate2)

    geometry.faceVertexUvs[0].forEach(uvs => {
      uvs.forEach(uv => {
        uv.divideScalar(64)
      })
    })

    const mesh = new Mesh(
      geometry,
      new MeshBasicMaterial({ side }),
    )
    mesh.visible = false

    return mesh
  }

  private updateGeometryHeight(mesh: FloorOrCeilingMesh, y: number): void {
    y >>= FRACBITS
    if (mesh.geometry.vertices[0].y !== y) {
      mesh.geometry.vertices.forEach(v => v.y = y)

      mesh.geometry.verticesNeedUpdate = true
      mesh.geometry.computeBoundingSphere()
    }
  }

  private updateTextureMap(mesh: FloorOrCeilingMesh, flat: number): void {
    if (flat === this.level.sky.flatNum) {
      mesh.material.visible = false
    } else {
      mesh.material.map = this.textures.getFlat(flat)
    }
  }
}
