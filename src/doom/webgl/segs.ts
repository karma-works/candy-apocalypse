import {
  Face3,
  Geometry,
  Mesh,
  Object3D,
  Vector2,
  Vector3,
} from 'three'
import { FRACBITS } from '../misc/fixed'
import { Segs as LegacySegs } from '../rendering/segs'
import { Line } from '../rendering/defs/line'
import { MapLineFlag } from '../doom/data'
import { PaletteMaterial } from './palette-material'
import { Plane } from './plane'
import { Rendering } from './rendering'
import { Sector } from '../rendering/defs/sector'
import { Seg } from '../rendering/segs/seg'
import { Textures } from './textures'
import { Vertex } from '../rendering/data/vertex'

type WallMesh = Mesh<Geometry, PaletteMaterial>

interface Wall {
  seg: Seg
  top?: WallMesh
  mid: WallMesh
  bottom?: WallMesh
}

export class Segs extends LegacySegs {
  walls: Wall[] = []

  private colorMap = new Uint8ClampedArray()

  get plane(): Plane {
    return this.rendering.plane
  }
  get textures(): Textures {
    return this.rendering.textures
  }

  constructor(protected rendering: Rendering) {
    super(rendering)
  }

  reset(): void {
    this.walls.forEach(({ mid, bottom, top }) => {
      mid.geometry.dispose()
      if (bottom) {
        bottom.geometry.dispose()
      }
      if (top) {
        top.geometry.dispose()
      }
    })

    this.walls.length = 0
  }

  clearDrawSegs(): void {
    super.clearDrawSegs()
    this.walls.forEach(({ mid, bottom, top }) => {
      mid.visible = false
      if (bottom) {
        bottom.visible = false
      }
      if (top) {
        top.visible = false
      }
    })
  }

  storeWallRange(): void {
    if (this.bsp.curLine === null) {
      throw 'this.bsp.curLine = null'
    }

    this.bsp.curLine.lineDef.flags |= MapLineFlag.Mapped

    const idx = this.level.segs.indexOf(this.bsp.curLine)
    const wall = this.walls[idx]

    if (!this.rendering.fixedColorMap) {
      this.calculateLights()
      this.colorMap = this.wallLights[8]
    } else {
      this.colorMap = this.rendering.fixedColorMap
    }

    this.updateWallVertices(wall)
    this.updateWallUvs(wall)
    this.updateWallTextureMap(wall)


    this.plane.setVisiblePlane(wall.seg)
  }

  createSeg(i: number, seg: Seg, parent: Object3D): void {
    const wall: Wall = {
      seg,
      mid: this.createMesh(),
    }
    this.walls[i] = wall

    wall.mid.visible = false
    parent.add(wall.mid)

    if (seg.backSector) {
      wall.top = this.createMesh()
      parent.add(wall.top)
      wall.bottom = this.createMesh()
      parent.add(wall.bottom)
    }

  }

  private createMesh(): WallMesh {
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

    const mesh = new Mesh(
      geometry,
      new PaletteMaterial(),
    )
    mesh.visible = false

    return mesh
  }

  private getVertices(v1: Vertex, v2: Vertex, bottom: number, top: number): Vector3[] {
    if (top < bottom) {
      bottom = top
    }
    // y, z, x
    return [
      new Vector3(v1.y >> FRACBITS, top >> FRACBITS, v1.x >> FRACBITS),
      new Vector3(v2.y >> FRACBITS, top >> FRACBITS, v2.x >> FRACBITS),
      new Vector3(v1.y >> FRACBITS, bottom >> FRACBITS, v1.x >> FRACBITS),
      new Vector3(v2.y >> FRACBITS, bottom >> FRACBITS, v2.x >> FRACBITS),
    ]
  }
  private updateGeometryVertices(geometry: Geometry, vertices: Vector3[]): void {
    vertices.forEach((v, i) => {
      if (!geometry.vertices[i].equals(v)) {
        geometry.vertices[i].copy(v)
        geometry.verticesNeedUpdate = true

        geometry.computeBoundingSphere()
        geometry.computeFaceNormals()
      }
    })
  }
  private updateWallVertices({
    seg: { v1, v2, frontSector, backSector, sideDef },
    bottom, mid, top,
  }: Wall): void {
    if (!backSector) {
      this.updateGeometryVertices(
        mid.geometry,
        this.getVertices(v1, v2, frontSector.floorHeight, frontSector.ceilingHeight),
      )
      mid.visible = true
    } else if (backSector) {
      if (top) {
        this.updateGeometryVertices(
          top.geometry,
          this.getVertices(v1, v2, backSector.ceilingHeight, frontSector.ceilingHeight),
        )
        top.visible = true
      }
      if (bottom) {
        this.updateGeometryVertices(
          bottom.geometry,
          this.getVertices(v1, v2, frontSector.floorHeight, backSector.floorHeight),
        )
        bottom.visible = true
      }

      if (sideDef.midTexture) {
        this.updateGeometryVertices(
          mid.geometry,
          this.getVertices(v1, v2,
            Math.max(frontSector.floorHeight, backSector.floorHeight),
            Math.min(frontSector.ceilingHeight, backSector.ceilingHeight),
          ),
        )
        mid.visible = true
      } else {
        mid.visible = false
      }

    }
  }

  private getMidOffset(frontSector: Sector, lineDef: Line, tex: number): number {
    if (lineDef.flags & MapLineFlag.DontPegBottom) {
      const textureHeight = this.data.textures.getHeight(tex) << FRACBITS
      // bottom of texture at bottom
      return frontSector.floorHeight + textureHeight - frontSector.ceilingHeight
    } else {
      // top of texture at top
      return 0
    }
  }
  private getMaskedMidOffset(frontSector: Sector, backSector: Sector, lineDef: Line, tex: number): number {
    if (lineDef.flags & MapLineFlag.DontPegBottom) {
      const textureHeight = this.data.textures.getHeight(tex) << FRACBITS

      return Math.max(frontSector.floorHeight, backSector.floorHeight) +
        textureHeight -
        Math.min(frontSector.ceilingHeight, backSector.ceilingHeight)
    } else {
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
      const textureHeight = this.data.textures.getHeight(tex) << FRACBITS
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
    const texWidth = this.data.textures[tex].patch.width << FRACBITS
    const texHeight = this.data.textures[tex].patch.height << FRACBITS

    const uvs = [
      1 - topOffset / texHeight,
      (leftOffset + wallWidth) / texWidth,
      1 - (topOffset + wallHeight) / texHeight,
      leftOffset / texWidth,
    ]
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
    seg: { v1, v2, frontSector, backSector, sideDef, lineDef },
    bottom, mid, top,
  }: Wall): void {
    const wallWidth = Math.sqrt(
      (v1.x - v2.x) * (v1.x - v2.x) +
      (v1.y - v2.y) * (v1.y - v2.y),
    )
    let wallHeight: number
    const leftOffset = sideDef.textureOffset
    let topOffset: number

    if (!backSector) {
      wallHeight = frontSector.ceilingHeight - frontSector.floorHeight
      topOffset = this.getMidOffset(frontSector, lineDef, sideDef.midTexture)
      topOffset += sideDef.rowOffset

      this.updateGeometryUVs(
        mid.geometry,
        this.getUvs(wallWidth, wallHeight, leftOffset, topOffset, sideDef.midTexture),
      )
    } else {
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

      if (sideDef.midTexture) {
        wallHeight = Math.min(frontSector.ceilingHeight, backSector.ceilingHeight) -
          Math.max(frontSector.floorHeight, backSector.floorHeight)
        topOffset = this.getMaskedMidOffset(frontSector, backSector, lineDef, sideDef.midTexture)
        topOffset += sideDef.rowOffset

        this.updateGeometryUVs(
          mid.geometry,
          this.getUvs(wallWidth, wallHeight, leftOffset, topOffset, sideDef.midTexture),
        )
      }
    }
  }

  private updateWallTextureMap({
    seg: { frontSector, backSector, sideDef },
    bottom, mid, top,
  }: Wall): void {
    let patchTuple = this.textures.getPatchTexture(sideDef.midTexture)
    mid.material.map = patchTuple[0]
    mid.material.alphaMap = patchTuple[1]
    mid.material.paletteTexture.palette = this.textures.palette
    mid.material.paletteTexture.colorMap = this.colorMap

    if (backSector) {
      if (top) {
        if (frontSector.ceilingPic === this.level.sky.flatNum &&
          backSector.ceilingPic === this.level.sky.flatNum
        ) {
          top.material.visible = false
        } else {
          patchTuple = this.textures.getPatchTexture(sideDef.topTexture)
          top.material.map = patchTuple[0]
          top.material.alphaMap = patchTuple[1]
          top.material.paletteTexture.palette = this.textures.palette
          top.material.paletteTexture.colorMap = this.colorMap
        }
      }
      if (bottom) {
        patchTuple = this.textures.getPatchTexture(sideDef.bottomTexture)
        bottom.material.map = patchTuple[0]
        bottom.material.alphaMap = patchTuple[1]
        bottom.material.paletteTexture.palette = this.textures.palette
        bottom.material.paletteTexture.colorMap = this.colorMap
      }
    }
  }
}
