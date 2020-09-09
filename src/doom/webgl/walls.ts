import {
  Face3,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  Scene,
  Vector2,
  Vector3,
} from 'three'
import { Data } from '../rendering/data'
import { FRACBITS } from '../misc/fixed'
import { Level } from '../level/level'
import { Line } from '../rendering/defs/line'
import { MapLineFlag } from '../doom/data'
import { Rendering } from './rendering'
import { Sector } from '../rendering/defs/sector'
import { Seg } from '../rendering/segs/seg'
import { Textures } from './textures'
import { Vertex } from '../rendering/data/vertex'

type WallMesh = Mesh<Geometry, MeshBasicMaterial>

interface Wall {
  seg: Seg
  top?: WallMesh
  mid?: WallMesh
  bottom?: WallMesh
}

export class Walls {
  walls: Wall[] = []

  private get level(): Level {
    return this.rendering.level
  }
  private get rData(): Data {
    return this.rendering.rData
  }
  private get textures(): Textures {
    return this.rendering.textures
  }

  constructor(private rendering: Rendering) { }

  drawSeg(segId: number, seg: Seg, scene: Scene): void {
    const wall: Wall = { seg }
    this.walls[segId] = wall

    if (!seg.backSector) {
      wall.mid = new Mesh(this.createGeometry(), new MeshBasicMaterial())
      scene.add(wall.mid)
    } else {
      wall.top = new Mesh(this.createGeometry(), new MeshBasicMaterial())
      scene.add(wall.top)
      wall.bottom = new Mesh(this.createGeometry(), new MeshBasicMaterial())
      scene.add(wall.bottom)
    }

    this.updateWallVertices(wall)
    this.updateWallUvs(wall)
    this.updateWallTextureMap(wall)
  }
  refreshWalls(): void {
    this.walls.forEach(wall => {
      this.updateWallVertices(wall)
      this.updateWallUvs(wall)
      this.updateWallTextureMap(wall)
    })
  }

  private createGeometry(): Geometry {
    const geometry = new Geometry()
    geometry.vertices.push(
      new Vector3(0, -1, 1),
      new Vector3(0, 1, 1),
      new Vector3(0, -1, -1),
      new Vector3(0, 1, -1),
    )
    geometry.faces.push(
      new Face3(0, 2, 1),
      new Face3(2, 3, 1),
    )
    geometry.faceVertexUvs[0].push(
      [ new Vector2(0, 0), new Vector2(1, 1), new Vector2(0, 1) ],
      [ new Vector2(0, 0), new Vector2(1, 0), new Vector2(1, 1) ],
    )
    geometry.computeFaceNormals()

    return geometry
  }
  private getVertices(v1: Vertex, v2: Vertex, bottom: number, top: number): Vector3[] {
    if (top < bottom) {
      bottom = top
    }
    return [
      new Vector3(v1.x >> FRACBITS, v1.y >> FRACBITS, top >> FRACBITS),
      new Vector3(v2.x >> FRACBITS, v2.y >> FRACBITS, top >> FRACBITS),
      new Vector3(v1.x >> FRACBITS, v1.y >> FRACBITS, bottom >> FRACBITS),
      new Vector3(v2.x >> FRACBITS, v2.y >> FRACBITS, bottom >> FRACBITS),
    ]
  }
  private updateGeometryVertices(geometry: Geometry, vertices: Vector3[]): void {
    vertices.forEach((v, i) => {
      if (!geometry.vertices[i].equals(v)) {
        geometry.vertices[i].copy(v)
        geometry.verticesNeedUpdate = true
      }
    })
  }
  private updateWallVertices({
    seg: { v1, v2, frontSector, backSector },
    bottom, mid, top,
  }: Wall): void {
    if (mid) {
      this.updateGeometryVertices(
        mid.geometry,
        this.getVertices(v1, v2, frontSector.floorHeight, frontSector.ceilingHeight),
      )
    } else if (backSector) {
      if (top) {
        this.updateGeometryVertices(
          top.geometry,
          this.getVertices(v1, v2, backSector.ceilingHeight, frontSector.ceilingHeight),
        )
      }
      if (bottom) {
        this.updateGeometryVertices(
          bottom.geometry,
          this.getVertices(v1, v2, frontSector.floorHeight, backSector.floorHeight),
        )
      }
    }
  }

  private getMidOffset(frontSector: Sector, lineDef: Line, tex: number): number {
    if (lineDef.flags & MapLineFlag.DontPegBottom) {
      const textureHeight = this.rData.textures.getHeight(tex) << FRACBITS
      // bottom of texture at bottom
      return frontSector.floorHeight + textureHeight - frontSector.ceilingHeight
    } else {
      // top of texture at top
      return 0
    }
  }
  private getTopOffset(frontSector: Sector, backSector: Sector, lineDef: Line, tex: number): number {
    // two sided line

    if (lineDef.flags & MapLineFlag.DontPegTop) {
      // top of texture at top

      // hack to allow height changes in outdoor areas
      if (frontSector.ceilingPic === this.level.sky.flatNum &&
        backSector.ceilingPic === this.level.sky.flatNum
      ) {
        return backSector.ceilingHeight - frontSector.ceilingHeight
      } else {
        return 0
      }

    } else {
      const textureHeight = this.rData.textures.getHeight(tex) << FRACBITS
      // bottom of texture
      return backSector.ceilingHeight + textureHeight - frontSector.ceilingHeight
    }
  }
  private getBottomOffset(frontSector: Sector, backSector: Sector, lineDef: Line): number {
    // two sided line

    if (lineDef.flags & MapLineFlag.DontPegBottom) {
      // bottom of texture at bottom

      // hack to allow height changes in outdoor areas
      if (frontSector.ceilingPic === this.level.sky.flatNum &&
        backSector.ceilingPic === this.level.sky.flatNum
      ) {
        return backSector.ceilingHeight - backSector.floorHeight
      } else {
        return frontSector.ceilingHeight - backSector.floorHeight
      }
    } else {
      // top of texture at top
      return 0
    }
  }
  private getUvs(wallWidth: number, wallHeight: number,
    leftOffset: number, topOffset: number,
    tex: number,
  ): Vector2[][] {
    const texWidth = this.rData.textures[tex].patch.width << FRACBITS
    const texHeight = this.rData.textures[tex].patch.height << FRACBITS

    const uvs = [
      topOffset / texHeight,
      (leftOffset + wallWidth) / texWidth,
      (topOffset + wallHeight) / texHeight,
      leftOffset / texWidth,
    ]
    // if (wallHeight < 0) debugger
    return [
      [ new Vector2(uvs[3], uvs[0]), new Vector2(uvs[3], uvs[2]), new Vector2(uvs[1], uvs[0]) ],
      [ new Vector2(uvs[3], uvs[2]), new Vector2(uvs[1], uvs[2]), new Vector2(uvs[1], uvs[0]) ],
    ]
  }
  private updateGeometryUVs(geometry: Geometry, uvss: Vector2[][]): void {
    uvss.forEach((uvs, i) => {
      uvs.forEach((uv, j) => {
        if (!uv.equals(geometry.faceVertexUvs[0][i][j])) {
          geometry.faceVertexUvs[0][i][j].copy(uv)
          geometry.uvsNeedUpdate = true
        }
      })
    })
  }
  private updateWallUvs({
    seg: { frontSector, backSector, sideDef, lineDef },
    bottom, mid, top,
  }: Wall): void {
    const wallWidth = Math.sqrt(lineDef.dX * lineDef.dX + lineDef.dY * lineDef.dY)
    let wallHeight: number
    const leftOffset = sideDef.textureOffset
    let topOffset: number

    if (mid) {
      wallHeight = frontSector.ceilingHeight - frontSector.floorHeight
      topOffset = this.getMidOffset(frontSector, lineDef, sideDef.midTexture)
      topOffset += sideDef.rowOffset

      this.updateGeometryUVs(
        mid.geometry,
        this.getUvs(wallWidth, wallHeight, leftOffset, topOffset, sideDef.midTexture),
      )
    } else if (backSector) {
      if (top) {
        wallHeight = frontSector.ceilingHeight - backSector.ceilingHeight
        topOffset = this.getTopOffset(frontSector, backSector, lineDef, sideDef.topTexture)
        topOffset += sideDef.rowOffset

        this.updateGeometryUVs(
          top.geometry,
          this.getUvs(wallWidth, wallHeight, leftOffset, topOffset, sideDef.topTexture),
        )
      }
      if (bottom) {
        wallHeight = backSector.floorHeight - frontSector.floorHeight
        topOffset = this.getBottomOffset(frontSector, backSector, lineDef)
        topOffset += sideDef.rowOffset

        this.updateGeometryUVs(
          bottom.geometry,
          this.getUvs(wallWidth, wallHeight, leftOffset, topOffset, sideDef.bottomTexture),
        )
      }
    }
  }

  private updateWallTextureMap({
    seg: { backSector, sideDef },
    bottom, mid, top,
  }: Wall): void {
    if (mid) {
      mid.material.map = this.textures.getTexture(sideDef.midTexture)
    } else if (backSector) {
      if (top) {
        top.material.map = this.textures.getTexture(sideDef.topTexture)
      }
      if (bottom) {
        bottom.material.map = this.textures.getTexture(sideDef.bottomTexture)
      }
    }
  }
}
