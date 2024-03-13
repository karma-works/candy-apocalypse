import { Group, Mesh, MeshLambertMaterial, MixOperation } from 'three';
import { SegGeometry, SegPart } from '../geometries/seg-geometry';
import { Seg as DoomSeg } from '../../rendering/segs/seg'
import { FRACBITS } from '../../misc/fixed';
import { Line } from '../../rendering/defs/line';
import { MapLineFlag } from '../../doom/data';
import { MeshBasicPaletteMaterial } from '../materials/mesh-basic-palette-material';
import { Sector } from '../../rendering/defs/sector';
import { Sky } from '../../level/sky';
import { TextureLoader } from '../texture-loader';

type SegMesh = Mesh<SegGeometry, MeshBasicPaletteMaterial>
type SkyMesh = Mesh<SegGeometry, MeshLambertMaterial>

function isSkyMesh(ceiling: SegMesh | SkyMesh): ceiling is SkyMesh {
  return !!(ceiling as SkyMesh).material.isMeshLambertMaterial
}

export class Seg extends Group {
  top?: SegMesh | SkyMesh
  mid: SegMesh
  bottom?: SegMesh

  constructor(
    private seg: DoomSeg,
    private textures: TextureLoader,
    private sky?: Sky,
  ) {
    super()

    this.add(this.mid = this.createMesh(SegPart.Mid))
    if (seg.backSector) {
      if (seg.frontSector.ceilingPic === sky?.flatNum &&
        seg.backSector.ceilingPic === sky?.flatNum
      ) {
        this.add(this.top = this.createSkyMesh())
      } else {
        this.add(this.top = this.createMesh(SegPart.Top))
      }
      this.add(this.bottom = this.createMesh(SegPart.Bottom))
    }

    this.update(seg.frontSector.lightLevel)
  }

  dispose() {
    this.mid.geometry.dispose()
    this.mid.material.dispose()
    this.top?.geometry.dispose()
    this.top?.material.dispose()
    this.bottom?.geometry.dispose()
    this.bottom?.material.dispose()
  }

  update(lightLevel: number) {
    this.updateWallVertices()
    this.updateWallUvs()
    this.updateTextureMaps(lightLevel)
  }

  private createMesh(part: SegPart): SegMesh {
    const mesh = new Mesh(
      new SegGeometry(this.seg, part, this.textures.textures),
      new MeshBasicPaletteMaterial({
        paletteMap: this.textures.paletteTexture,
      }),
    )
    mesh.visible = false

    return mesh
  }
  private createSkyMesh(): SkyMesh {
    const mesh = new Mesh(
      new SegGeometry(this.seg, SegPart.Top, this.textures.textures),
      new MeshLambertMaterial({
        refractionRatio: 1,
        combine: MixOperation,
      }),
    )
    mesh.visible = false

    return mesh
  }

  private updateWallVertices(): void {
    const {
      seg: { sideDef },
      bottom, mid, top,
    } = this

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
      const textureHeight = this.textures.textures.getHeight(tex) << FRACBITS
      // bottom of texture at bottom
      return frontSector.floorHeight + textureHeight - frontSector.ceilingHeight
    } else {
      // top of texture at top
      return 0
    }
  }
  private getMaskedMidOffset(frontSector: Sector, backSector: Sector, lineDef: Line, tex: number): number {
    if (lineDef.flags & MapLineFlag.DontPegBottom) {
      const textureHeight = this.textures.textures.getHeight(tex) << FRACBITS

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
      if (frontSector.ceilingPic === this.sky?.flatNum &&
        backSector.ceilingPic === this.sky?.flatNum
      ) {
        return backSector.ceilingHeight - frontSector.ceilingHeight
      } else {
        return 0
      }

    } else {
      const textureHeight = this.textures.textures.getHeight(tex) << FRACBITS
      // bottom of texture
      return backSector.ceilingHeight + textureHeight - frontSector.ceilingHeight
    }
  }
  private getBottomOffset(frontSector: Sector, backSector: Sector, lineDef: Line): number {
    // two sided line

    if (lineDef.flags & MapLineFlag.DontPegBottom) {
      // bottom of texture at bottom

      // hack to allow height changes in outdoor areas
      if (frontSector.ceilingPic === this.sky?.flatNum &&
        backSector.ceilingPic === this.sky?.flatNum
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

  private updateWallUvs(): void {
    const {
      seg: { frontSector, backSector, sideDef, lineDef },
      bottom, mid, top,
    } = this

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

  private updateTextureMaps(lightLevel: number): void {
    const {
      seg: { backSector, sideDef, v1, v2 },
      bottom, mid, top,
    } = this

    if (v1.y === v2.y) {
      lightLevel -= 16
    } else if (v1.x === v2.x) {
      lightLevel += 16
    }
    lightLevel = Math.max(0, Math.min(lightLevel, 255))

    this.updateTextureMap(mid, sideDef.midTexture, lightLevel);

    if (backSector) {
      if (top && isSkyMesh(top)) {
        top.material.envMap = this.textures.getSkyTexture(this.sky!.texture)
        top.material.refractionRatio = 1
        top.material.combine = MixOperation
      } else {
        this.updateTextureMap(top, sideDef.topTexture, lightLevel);
      }
      this.updateTextureMap(bottom, sideDef.bottomTexture, lightLevel);
    }
  }

  private updateTextureMap(
    mesh: SegMesh | undefined,
    texNum: number,
    lightLevel: number,
  ) {
    if (!mesh) {
      return
    }
    const texture = this.textures.getPatchTexture(texNum);
    mesh.material.map = texture.map;
    if (texture.transparent) {
      mesh.material.alphaMap = texture.alphaMap;
      mesh.material.transparent = true
    }
    mesh.material.lightLevel = lightLevel
  }

}
