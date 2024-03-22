import { LIGHT_SEG_SHIFT } from '../rendering/rendering';
import { BSP as LegacyBSP } from '../rendering/bsp';
import { Rendering } from './rendering';
import { Sector } from '../rendering/defs/sector';
import { Seg } from '../rendering/segs/seg';

export class BSP extends LegacyBSP {
  constructor(protected rendering: Rendering) {
    super(rendering)
  }

  protected subSector(num: number) {
    const frontSector = super.subSector(num)

    this.updateSector(frontSector)

    return frontSector
  }


  private updateSector({ id, lightLevel }: Sector) {
    if (this.rendering.levelGroup?.sectors[id].visible) {
      return
    }

    lightLevel += this.rendering.extraLight << LIGHT_SEG_SHIFT
    if (this.rendering.fixedColorMap) {
      lightLevel = 255
    }

    this.rendering.levelGroup?.updateSector(id, lightLevel)
  }

  protected addLine(seg: Seg) {
    super.addLine(seg)

    const { frontSector, backSector } = this

    if (frontSector && backSector) {
      this.updateSeg(frontSector, seg)
    }
  }

  private updateSeg({ id: secId, lightLevel }: Sector, { id }: Seg) {
    lightLevel += this.rendering.extraLight << LIGHT_SEG_SHIFT
    if (this.rendering.fixedColorMap) {
      lightLevel = 255
    }

    this.rendering.levelGroup?.updateSeg(secId, id, lightLevel)
  }
}
