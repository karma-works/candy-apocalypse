import { BackSide, FrontSide, Group, Mesh, MeshLambertMaterial, MixOperation, NotEqualStencilFunc, Side } from 'three';
import { Line as DoomLine } from '../../rendering/defs/line';
import { Sector as DoomSector } from '../../rendering/defs/sector'
import { Seg as DoomSeg } from '../../rendering/segs/seg';
import { FRACUNIT } from '../../misc/fixed';
import { MObj } from './mobj';
import { MeshBasicPaletteMaterial } from '../materials/mesh-basic-palette-material';
import { PlaneGeometry } from '../geometries/plane-geometry';
import { Seg } from './seg';
import { Sky } from '../../level/sky';
import { TextureLoader } from '../texture-loader';

type SectorMesh = Mesh<PlaneGeometry, MeshBasicPaletteMaterial>
type SkyMesh = Mesh<PlaneGeometry, MeshLambertMaterial>

function isSkyMesh(ceiling: SectorMesh | SkyMesh): ceiling is SkyMesh {
  return !!(ceiling as SkyMesh).material.isMeshLambertMaterial
}

export class Sector extends Group {
  floor: SectorMesh;
  ceiling: SectorMesh | SkyMesh;
  frontSegs: {[id: number]: Seg};

  get stencilRef() {
    return this.floor.material.stencilRef
  }
  set stencilRef(ref: number) {
    this.floor.material.stencilRef = ref
    this.ceiling.material.stencilRef = ref
  }

  constructor(
    private sector: DoomSector,
    segs: readonly DoomSeg[],
    lines: readonly DoomLine[],
    private textures: TextureLoader,
    private sky?: Sky,
  ) {
    super()

    this.visible = false

    const frontLines = lines.filter(({ frontSector }) => frontSector === sector)
    const backLines = lines.filter(({ backSector }) => backSector === sector)

    const geometry = new PlaneGeometry(sector, [ ...frontLines, ...backLines ])
    this.add(this.floor = this.createMesh(geometry, FrontSide))
    if (sector.ceilingPic === sky?.flatNum) {
      this.add(this.ceiling = this.createSkyMesh(geometry))
    } else {
      this.add(this.ceiling = this.createMesh(geometry, BackSide))
    }

    const frontSegs = segs.filter(({ frontSector }) => frontSector === sector)
    this.frontSegs = this.createSegs(frontSegs)
    const frontSegsMeshes = Object.values(this.frontSegs)
    frontSegsMeshes.length && this.add(...frontSegsMeshes)

    this.update(sector.lightLevel)

    this.stencilRef = sector.id % 255 + 1
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

    // After the MObj
    mesh.renderOrder = MObj.RENDER_ORDER + 1

    mesh.material.stencilWrite = true
    mesh.material.stencilFunc = NotEqualStencilFunc

    return mesh
  }
  private createSkyMesh(geometry: PlaneGeometry): SkyMesh {
    return new Mesh(geometry, new MeshLambertMaterial({
      side: BackSide,
      refractionRatio: 1,
      combine: MixOperation,
    }))
  }

  private createSegs(segs: readonly DoomSeg[]): {[i: number]: Seg} {
    return segs.reduce((acc, s) => {
      return {
        ...acc,
        [s.id]: new Seg(s, this.textures, this.sky),
      }
    }, {} as {[i: number]: Seg})
  }

  private updateHeight(): void {
    this.floor.position.y = this.sector.floorHeight / FRACUNIT
    this.ceiling.position.y = this.sector.ceilingHeight / FRACUNIT
  }

  private updateTextureMap(lightLevel: number): void {
    this.floor.material.lightLevel = lightLevel
    this.floor.material.map = this.textures.getFlatTexture(this.sector.floorPic)

    if (isSkyMesh(this.ceiling)) {
      this.ceiling.material.envMap = this.textures.getSkyTexture(this.sky!.texture)
      this.ceiling.material.refractionRatio = 1
      this.ceiling.material.combine = MixOperation
    } else {
      this.ceiling.material.lightLevel = lightLevel
      this.ceiling.material.map = this.textures.getFlatTexture(this.sector.ceilingPic)
    }
  }
}
