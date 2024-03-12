import { LIGHT_SEG_SHIFT } from '../rendering/rendering'
import { Segs as LegacySegs } from '../rendering/segs'
import { MapLineFlag } from '../doom/data'
import { Rendering } from './rendering'
import { Sector } from '../rendering/defs/sector'

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
    this.updateSector(frontSector)
    this.rendering.levelGroup?.updateSeg(frontSector.id, curLine.id, lightLevel)
  }

  updateSector({ id, lightLevel, lines }: Sector) {
    if (this.rendering.levelGroup?.sectors[id].visible) {
      return
    }

    lightLevel += this.rendering.extraLight << LIGHT_SEG_SHIFT

    this.rendering.levelGroup?.updateSector(id, lightLevel)

    // Check for neighbors sector that are on the same height.
    // They might be skipped in the rendering because no segs are visible.
    lines.forEach(({ frontSector, backSector }) => {
      if (!frontSector || !backSector ||
        frontSector.ceilingHeight !== backSector.ceilingHeight ||
        frontSector.floorHeight !== backSector.floorHeight
      ) {
        return
      }

      this.updateSector(id === frontSector.id ? backSector : frontSector)
    })
  }
}
