import {
  BackSide,
  FrontSide,
  Mesh,
  Object3D,
  Side,
} from 'three'
import { FRACBITS } from '../misc/fixed'
import { Plane as LegacyPlane } from '../rendering/plane'
import { Line } from '../rendering/defs/line'
import { MeshBasicPaletteMaterial } from './materials/mesh-basic-palette-material'
import { PlaneGeometry } from './geometries/plane-geometry'
import { Rendering } from './rendering'
import { Sector } from '../rendering/defs/sector'
import { Seg } from '../rendering/segs/seg'
import { Textures } from './textures'

type FloorOrCeilingMesh = Mesh<PlaneGeometry, MeshBasicPaletteMaterial>

interface FloorAndCeiling {
  sector: Sector
  floor: FloorOrCeilingMesh
  ceiling: FloorOrCeilingMesh
}

export class Plane extends LegacyPlane {

  private facs = new Array<FloorAndCeiling>()

  private colorMap = new Uint8ClampedArray()

  get textures(): Textures {
    return this.rendering.textures
  }

  constructor(protected rendering: Rendering,
    width: number, height: number,
  ) {
    super(rendering, width, height)
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

      if (fac.floor.visible || fac.ceiling.visible) {
        if (!this.rendering.fixedColorMap) {
          this.calculateLights(fac.sector.lightLevel)
          this.colorMap = this.planeZLight[8]
        } else {
          this.colorMap = this.rendering.fixedColorMap
        }
      }

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
    const mesh = new Mesh(
      new PlaneGeometry(sector, lines),
      new MeshBasicPaletteMaterial({ side }),
    )
    mesh.visible = false

    return mesh
  }

  private updateGeometryHeight(mesh: FloorOrCeilingMesh, y: number): void {
    y >>= FRACBITS
    mesh.position.y = y
  }

  private updateTextureMap(mesh: FloorOrCeilingMesh, flat: number): void {
    if (flat === this.level.sky.flatNum) {
      mesh.material.visible = false
    } else {
      mesh.material.map = this.textures.getFlatTexture(flat)
      mesh.material.paletteTexture.palette = this.textures.palette
      mesh.material.paletteTexture.colorMap = this.colorMap
    }
  }
}
