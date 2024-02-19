import {
  Mesh,
  Object3D,
} from 'three'
import { SegGeometry, SegPart } from './geometries/seg-geometry'
import { FRACBITS } from '../misc/fixed'
import { Segs as LegacySegs } from '../rendering/segs'
import { Line } from '../rendering/defs/line'
import { MapLineFlag } from '../doom/data'
import { MeshBasicPaletteMaterial } from './materials/mesh-basic-palette-material'
import { Plane } from './plane'
import { Rendering } from './rendering'
import { Sector } from '../rendering/defs/sector'
import { Seg } from '../rendering/segs/seg'
import { Textures } from './textures'

type WallMesh = Mesh<SegGeometry, MeshBasicPaletteMaterial>

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
      mid: this.createMesh(seg, SegPart.Mid),
    }
    this.walls[i] = wall

    wall.mid.visible = false
    parent.add(wall.mid)

    if (seg.backSector) {
      wall.top = this.createMesh(seg, SegPart.Top)
      parent.add(wall.top)
      wall.bottom = this.createMesh(seg, SegPart.Bottom)
      parent.add(wall.bottom)
    }

  }

  private createMesh(seg: Seg, part: SegPart): WallMesh {
    const mesh = new Mesh(
      new SegGeometry(seg, part, this.data.textures),
      new MeshBasicPaletteMaterial(),
    )
    mesh.visible = false

    return mesh
  }

  private updateWallVertices({
    seg: { sideDef },
    bottom, mid, top,
  }: Wall): void {
    if (top) {
      top.geometry.updateHeight()
      top.visible = true
    }
    if (bottom) {
      bottom.geometry.updateHeight()
      bottom.visible = true
    }

    if (sideDef.midTexture) {
      mid.geometry.updateHeight()
      mid.visible = true
    } else {
      mid.visible = false
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
  private updateWallUvs({
    seg: { frontSector, backSector, sideDef, lineDef },
    bottom, mid, top,
  }: Wall): void {
    const leftOffset = sideDef.textureOffset
    let topOffset: number

    if (!backSector) {
      topOffset = this.getMidOffset(frontSector, lineDef, sideDef.midTexture)
      topOffset += sideDef.rowOffset

      mid.geometry.updateUvs(leftOffset, topOffset, sideDef.midTexture)
    } else {
      if (top) {
        topOffset = this.getTopOffset(frontSector, backSector, lineDef, sideDef.topTexture)
        topOffset += sideDef.rowOffset

        top.geometry.updateUvs(leftOffset, topOffset, sideDef.topTexture)
      }
      if (bottom) {
        topOffset = this.getBottomOffset(frontSector, backSector, lineDef)
        topOffset += sideDef.rowOffset

        bottom.geometry.updateUvs(leftOffset, topOffset, sideDef.bottomTexture)
      }

      if (sideDef.midTexture) {
        topOffset = this.getMaskedMidOffset(frontSector, backSector, lineDef, sideDef.midTexture)
        topOffset += sideDef.rowOffset

        mid.geometry.updateUvs(leftOffset, topOffset, sideDef.midTexture)
      }
    }
  }

  private updateWallTextureMap({
    seg: { frontSector, backSector, sideDef },
    bottom, mid, top,
  }: Wall): void {
    let texture = this.textures.getPatchTexture(sideDef.midTexture)
    mid.material.map = texture.map
    mid.material.alphaMap = texture.alphaMap
    mid.material.paletteTexture.palette = this.textures.palette
    mid.material.paletteTexture.colorMap = this.colorMap

    if (backSector) {
      if (top) {
        if (frontSector.ceilingPic === this.level.sky.flatNum &&
          backSector.ceilingPic === this.level.sky.flatNum
        ) {
          top.material.visible = false
        } else {
          texture = this.textures.getPatchTexture(sideDef.topTexture)
          top.material.map = texture.map
          top.material.alphaMap = texture.alphaMap
          top.material.paletteTexture.palette = this.textures.palette
          top.material.paletteTexture.colorMap = this.colorMap
        }
      }
      if (bottom) {
        texture = this.textures.getPatchTexture(sideDef.bottomTexture)
        bottom.material.map = texture.map
        bottom.material.alphaMap = texture.alphaMap
        bottom.material.paletteTexture.palette = this.textures.palette
        bottom.material.paletteTexture.colorMap = this.colorMap
      }
    }
  }
}
