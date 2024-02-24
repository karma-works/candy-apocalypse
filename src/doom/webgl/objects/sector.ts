import { BackSide, FrontSide, Group, Mesh, Side } from 'three';
import { Line as DoomLine } from '../../rendering/defs/line';
import { Sector as DoomSector } from '../../rendering/defs/sector'
import { Seg as DoomSeg } from '../../rendering/segs/seg';
import { FRACBITS } from '../../misc/fixed';
import { MeshBasicPaletteMaterial } from '../materials/mesh-basic-palette-material';
import { PlaneGeometry } from '../geometries/plane-geometry';
import { Seg } from './seg';
import { Textures } from '../textures';

type SectorMesh = Mesh<PlaneGeometry, MeshBasicPaletteMaterial>

export class Sector extends Group {
  floor: SectorMesh;
  ceiling: SectorMesh;
  frontSegs: {[id: number]: Seg};

  constructor(
    private sector: DoomSector,
    segs: readonly DoomSeg[],
    lines: readonly DoomLine[],
    private textures: Textures,
    private skyFlatNum: number,
  ) {
    super()

    this.visible = false

    const frontLines = lines.filter(({ frontSector }) => frontSector === sector)
    const backLines = lines.filter(({ backSector }) => backSector === sector)

    this.add(this.floor = this.createMesh([ ...frontLines, ...backLines ], FrontSide))
    this.add(this.ceiling = this.createMesh([ ...frontLines, ...backLines ], BackSide))

    const frontSegs = segs.filter(({ frontSector }) => frontSector === sector)
    this.frontSegs = this.createSegs(frontSegs)
    this.add(...Object.values(this.frontSegs))
  }

  dispose(): void {
    this.floor.geometry.dispose()
    this.floor.material.dispose()
    this.ceiling.geometry.dispose()
    this.ceiling.material.dispose()

    for (const seg of Object.values(this.frontSegs)) {
      seg.dispose()
    }
  }

  update(colorMap: Uint8ClampedArray) {
    // already up to date
    if (this.visible) {
      return
    }

    this.visible = true

    this.updateHeight()
    this.updateTextureMap(colorMap)
  }

  updateSeg(secId: number, colorMap: Uint8ClampedArray): void {
    this.frontSegs[secId].update(colorMap)
  }

  private createMesh(lines: readonly DoomLine[], side: Side): SectorMesh {
    const mesh = new Mesh(
      new PlaneGeometry(this.sector, lines),
      new MeshBasicPaletteMaterial({ side }),
    )

    return mesh
  }

  private createSegs(segs: readonly DoomSeg[]): {[i: number]: Seg} {
    return segs.reduce((acc, s) => {
      return {
        ...acc,
        [s.id]: new Seg(s, this.textures, this.skyFlatNum),
      }
    }, {} as {[i: number]: Seg})
  }

  private updateHeight(): void {
    this.floor.position.y = this.sector.floorHeight >> FRACBITS
    this.ceiling.position.y = this.sector.ceilingHeight >> FRACBITS
  }

  private updateTextureMap(colorMap: Uint8ClampedArray): void {
    // TODO test sky flatnum

    this.floor.material.map = this.textures.getFlatTexture(this.sector.floorPic)
    this.floor.material.paletteTexture.palette = this.textures.palette
    this.floor.material.paletteTexture.colorMap = colorMap

    if (this.sector.ceilingPic === this.skyFlatNum) {
      this.ceiling.material.visible = false
    } else {
      this.ceiling.material.map = this.textures.getFlatTexture(this.sector.ceilingPic)
      this.ceiling.material.paletteTexture.palette = this.textures.palette
      this.ceiling.material.paletteTexture.colorMap = colorMap
    }
  }
}
