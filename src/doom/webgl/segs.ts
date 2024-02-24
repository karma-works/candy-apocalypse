import { Segs as LegacySegs } from '../rendering/segs'
import { MapLineFlag } from '../doom/data'
import { Rendering } from './rendering'

export class Segs extends LegacySegs {
  constructor(protected rendering: Rendering) {
    super(rendering)
  }

  clearDrawSegs(): void {
    super.clearDrawSegs()
  }

  // Catch every segs (wall) that would be rendered
  // by the legacy renderer.
  // Find their associated sector and update them
  storeWallRange(): void {
    const { curLine, frontSector } = this.bsp

    if (curLine === null || frontSector === null) {
      throw 'undefined curLine or frontSector'
    }

    curLine.lineDef.flags |= MapLineFlag.Mapped

    let sectorColorMap = this.rendering.fixedColorMap
    if (!sectorColorMap) {
      sectorColorMap = this.plane.calculateLights(frontSector.lightLevel)[25]
    }

    let segColorMap = this.rendering.fixedColorMap
    if (!segColorMap) {
      this.calculateLights()
      segColorMap = this.wallLights[8]
    }

    this.rendering.levelScene?.updateSector(frontSector.id, sectorColorMap)
    this.rendering.levelScene?.updateSeg(frontSector.id, curLine.id, segColorMap)
  }
}
