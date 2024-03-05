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

    const secLightLevel = frontSector.lightLevel + (this.rendering.extraLight << LIGHT_SEG_SHIFT)
    let segLightLevel = secLightLevel
    if (curLine.v1.y === curLine.v2.y) {
      segLightLevel -= 16
    } else if (curLine.v1.x === curLine.v2.x) {
      segLightLevel += 16
    }

    this.rendering.levelGroup?.updateSector(frontSector.id, secLightLevel)
    this.rendering.levelGroup?.updateSeg(frontSector.id, curLine.id, segLightLevel)
  }
}
