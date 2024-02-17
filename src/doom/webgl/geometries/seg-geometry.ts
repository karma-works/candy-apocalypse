import { Float32BufferAttribute, PlaneGeometry } from 'three';
import { FRACBITS } from '../../misc/fixed';
import { Seg } from '../../rendering/segs/seg';
import { Textures } from '../../textures/textures';

export const enum SegPart { Top, Mid, Bottom }

export class SegGeometry extends PlaneGeometry {
  // Width, won't change
  private width = 0
  // Height, can change
  private height = 0

  constructor(
    private seg: Seg,
    private part: SegPart,
    private textures: Textures,
  ) {
    super()

    const { v1, v2 } = seg

    this.width = Math.sqrt(
      (v1.x - v2.x) * (v1.x - v2.x) +
      (v1.y - v2.y) * (v1.y - v2.y),
    )

    const pos = this.attributes.position
    pos.setX(0, v1.y >> FRACBITS)
    pos.setX(2, v1.y >> FRACBITS)
    pos.setZ(0, v1.x >> FRACBITS)
    pos.setZ(2, v1.x >> FRACBITS)

    pos.setX(1, v2.y >> FRACBITS)
    pos.setX(3, v2.y >> FRACBITS)
    pos.setZ(1, v2.x >> FRACBITS)
    pos.setZ(3, v2.x >> FRACBITS)

    this.computeVertexNormals()
  }

  private getTop(): number {
    const { backSector, frontSector } = this.seg
    if (!backSector) {
      return frontSector.ceilingHeight
    }
    switch (this.part) {
    case SegPart.Top:
      return frontSector.ceilingHeight
    case SegPart.Bottom:
      return backSector!.floorHeight
    default:
      return Math.min(frontSector.ceilingHeight, backSector.ceilingHeight)
    }
  }
  private getBottom(): number {
    const { backSector, frontSector } = this.seg
    if (!backSector) {
      return frontSector.floorHeight
    }
    switch (this.part) {
    case SegPart.Top:
      return backSector!.ceilingHeight
    case SegPart.Bottom:
      return frontSector.floorHeight
    default:
      return Math.max(frontSector.floorHeight, backSector.floorHeight)
    }
  }

  updateHeight(): void {
    let top = this.getTop()
    let bottom = this.getBottom()
    if (top < bottom) {
      bottom = top
    }
    this.height = top - bottom

    top >>= FRACBITS
    bottom >>= FRACBITS

    const pos = this.attributes.position
    if (pos.getY(0) === top && pos.getY(2) === bottom) {
      return
    }

    pos.setY(0, top)
    pos.setY(1, top)
    pos.setY(2, bottom)
    pos.setY(3, bottom)

    pos.needsUpdate = true

    this.computeBoundingSphere()
  }

  updateUvs(leftOffset: number, topOffset: number, tex: number) {
    const texWidth = this.textures[tex].patch.width << FRACBITS
    const texHeight = this.textures[tex].patch.height << FRACBITS

    const uvs = this.attributes.uv as Float32BufferAttribute
    let changes = false

    const x1 = leftOffset / texWidth
    if (uvs.getX(0) !== x1) {
      uvs.setX(0, x1)
      uvs.setX(2, x1)
      changes = true
    }
    const x2 = (leftOffset + this.width) / texWidth
    if (uvs.getX(1) !== x2) {
      uvs.setX(1, x2)
      uvs.setX(3, x2)
      changes = true
    }
    const y1 = 1 - (topOffset + this.height) / texHeight
    if (uvs.getY(2) !== y1) {
      uvs.setY(2, y1)
      uvs.setY(3, y1)
      changes = true
    }
    const y2 = 1 - topOffset / texHeight
    if (uvs.getY(0) !== y2) {
      uvs.setY(0, y2)
      uvs.setY(1, y2)
      changes = true
    }

    if (changes) {
      uvs.needsUpdate = true
    }
  }

}
