import { Group, Mesh } from 'three';
import { SegGeometry, SegPart } from '../geometries/seg-geometry';
import { Seg as DoomSeg } from '../../rendering/segs/seg'
import { FRACBITS } from '../../misc/fixed';
import { Line } from '../../rendering/defs/line';
import { MapLineFlag } from '../../doom/data';
import { MeshBasicPaletteMaterial } from '../materials/mesh-basic-palette-material';
import { SKY_FLAT_NAME } from '../../level/sky';
import { Sector } from '../../rendering/defs/sector';
import { TextureLoader } from '../texture-loader';

type SegMesh = Mesh<SegGeometry, MeshBasicPaletteMaterial>

export class Seg extends Group {
  top?: SegMesh
  mid: SegMesh
  bottom?: SegMesh

  private skyFlatNum: number;

  constructor(
    private seg: DoomSeg,
    private textures: TextureLoader,
  ) {
    super()

    this.skyFlatNum = textures.flats.numForName(SKY_FLAT_NAME)

    this.add(this.mid = this.createMesh(SegPart.Mid))
    if (seg.backSector) {
      this.add(this.top = this.createMesh(SegPart.Top))
      this.add(this.bottom = this.createMesh(SegPart.Bottom))
    }

    this.update(255)
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
      if (frontSector.ceilingPic === this.skyFlatNum &&
        backSector.ceilingPic === this.skyFlatNum
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
      if (frontSector.ceilingPic === this.skyFlatNum &&
        backSector.ceilingPic === this.skyFlatNum
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
      seg: { frontSector, backSector, sideDef },
      bottom, mid, top,
    } = this

    this.updateTextureMap(mid, sideDef.midTexture, lightLevel);

    if (backSector) {
      if (top &&
        frontSector.ceilingPic === this.skyFlatNum &&
        backSector.ceilingPic === this.skyFlatNum
      ) {
        top.material.visible = false
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
    mesh.material.alphaMap = texture.alphaMap;
    mesh.material.lightLevel = lightLevel
  }

}
