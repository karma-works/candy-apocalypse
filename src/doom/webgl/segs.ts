import { LIGHT_SEG_SHIFT } from '../rendering/rendering'
import { Segs as LegacySegs } from '../rendering/segs'
import { MapLineFlag } from '../doom/data'
import { Rendering } from './rendering'
import { Sector } from '../rendering/defs/sector'
import { Seg } from '../rendering/segs/seg'

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

    this.updateSeg(frontSector, curLine)
  }

  private updateSeg({ id: secId, lightLevel }: Sector, { id }: Seg) {
    lightLevel += this.rendering.extraLight << LIGHT_SEG_SHIFT
    if (this.rendering.fixedColorMap) {
      lightLevel = 255
    }

    this.rendering.levelGroup?.updateSeg(secId, id, lightLevel)
  }

}
