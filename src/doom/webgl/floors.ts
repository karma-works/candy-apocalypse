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
import { Line } from '../rendering/defs/line'
import { Rendering } from './rendering'
import { Sector } from '../rendering/defs/sector'
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

export class FloorsAndCeilings {
  private facs = new Array<FloorAndCeiling>()

  private get textures(): Textures {
    return this.rendering.textures
  }

  constructor(private rendering: Rendering) { }

  drawSector(i: number, sector: Sector, lines: Line[], parent: Object3D): void {
    const fac: FloorAndCeiling = {
      sector,
      floor: this.createMesh(sector, [ ...lines ], FrontSide),
      ceiling: this.createMesh(sector, [ ...lines ], BackSide),
    }
    this.facs[i] = fac

    this.updateGeometryHeight(fac.floor, fac.sector.floorHeight)
    this.updateGeometryHeight(fac.ceiling, fac.sector.ceilingHeight)

    this.updateTextureMap(fac.floor, fac.sector.floorPic)
    this.updateTextureMap(fac.ceiling, fac.sector.ceilingPic)

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

    let lastVertexes: [Vertex, Vertex] | null = null

    while (vertexes.length > 0) {
      if (lastVertexes === null) {
        lastVertexes = vertexes[0]
        vertexes.shift()

        shapePath.moveTo(lastVertexes[0].x >> FRACBITS, lastVertexes[0].y >> FRACBITS)
      }

      const candidates = vertexes.filter(([ v1 ]) => lastVertexes &&
        v1.x === lastVertexes[1].x && v1.y === lastVertexes[1].y)

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

    return new Mesh(
      geometry,
      new MeshBasicMaterial({ side }),
    )
  }

  refresh(): void {
    this.facs.forEach(fac => {
      this.updateGeometryHeight(fac.floor, fac.sector.floorHeight)
      this.updateGeometryHeight(fac.ceiling, fac.sector.ceilingHeight)

      this.updateTextureMap(fac.floor, fac.sector.floorPic)
      this.updateTextureMap(fac.ceiling, fac.sector.ceilingPic)
    })
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
    mesh.material.map = this.textures.getFlat(flat)
  }
}
