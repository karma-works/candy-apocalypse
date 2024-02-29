import { BackSide, FrontSide, Group, Mesh, Side } from 'three';
import { Line as DoomLine } from '../../rendering/defs/line';
import { Sector as DoomSector } from '../../rendering/defs/sector'
import { Seg as DoomSeg } from '../../rendering/segs/seg';
import { FRACBITS } from '../../misc/fixed';
import { MeshBasicPaletteMaterial } from '../materials/mesh-basic-palette-material';
import { PlaneGeometry } from '../geometries/plane-geometry';
import { Seg } from './seg';
import { TextureLoader } from '../texture-loader';

type SectorMesh = Mesh<PlaneGeometry, MeshBasicPaletteMaterial>

export class Sector extends Group {
  floor: SectorMesh;
  ceiling: SectorMesh;
  frontSegs: {[id: number]: Seg};

  constructor(
    private sector: DoomSector,
    segs: readonly DoomSeg[],
    lines: readonly DoomLine[],
    private textures: TextureLoader,
    private skyFlatNum: number,
  ) {
    super()

    this.visible = false

    const frontLines = lines.filter(({ frontSector }) => frontSector === sector)
    const backLines = lines.filter(({ backSector }) => backSector === sector)

    const geometry = new PlaneGeometry(sector, [ ...frontLines, ...backLines ])
    this.add(this.floor = this.createMesh(geometry, FrontSide))
    this.add(this.ceiling = this.createMesh(geometry, BackSide))

    const frontSegs = segs.filter(({ frontSector }) => frontSector === sector)
    this.frontSegs = this.createSegs(frontSegs)
    this.add(...Object.values(this.frontSegs))

    this.update(255)
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

  update(lightLevel: number) {
    // already up to date
    if (this.visible) {
      return
    }

    this.visible = true

    this.updateHeight()
    this.updateTextureMap(lightLevel)
  }

  updateSeg(secId: number, lightLevel: number): void {
    this.frontSegs[secId].update(lightLevel)
  }

  private createMesh(geometry: PlaneGeometry, side: Side): SectorMesh {
    const mesh = new Mesh(
      geometry,
      new MeshBasicPaletteMaterial({
        side,
        paletteMap: this.textures.paletteTexture,
      }),
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

  private updateTextureMap(lightLevel: number): void {
    this.floor.material.lightLevel = lightLevel
    this.floor.material.map = this.textures.getFlatTexture(this.sector.floorPic)

    if (this.sector.ceilingPic === this.skyFlatNum) {
      this.ceiling.material.visible = false
    } else {
      this.ceiling.material.lightLevel = lightLevel
      this.ceiling.material.map = this.textures.getFlatTexture(this.sector.ceilingPic)
    }
  }
}
