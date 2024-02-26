import { LIGHT_SEG_SHIFT } from '../rendering/rendering'
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

    const lightLevel = frontSector.lightLevel + (this.rendering.extraLight << LIGHT_SEG_SHIFT)
    let colorMap = this.rendering.fixedColorMap
    if (!colorMap) {
      colorMap = this.plane.calculateLights(15)[0]
    }

    this.rendering.levelScene?.updateSector(frontSector.id, colorMap, lightLevel)
    this.rendering.levelScene?.updateSeg(frontSector.id, curLine.id, colorMap, lightLevel)
  }
}
