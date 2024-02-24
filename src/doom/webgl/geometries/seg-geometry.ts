import { Float32BufferAttribute, PlaneGeometry } from 'three';
import { FRACBITS } from '../../misc/fixed';
import { Seg } from '../../rendering/segs/seg';
import { TextureArray } from '../../textures/texture-array';

export const enum SegPart { Top, Mid, Bottom }

export class SegGeometry extends PlaneGeometry {
  // Width, won't change
  private width = 0
  // Height, can change
  private height = 0

  private lastUvsParams: [number, number, number] = [ -1, -1, -1 ]

  constructor(
    private seg: Seg,
    private part: SegPart,
    private textures: TextureArray,
  ) {
    super()

    const { v1, v2 } = seg

    this.width = Math.sqrt(
      (v1.x - v2.x) * (v1.x - v2.x) +
      (v1.y - v2.y) * (v1.y - v2.y),
    )

    const pos = this.attributes.position as Float32BufferAttribute
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

    const pos = this.attributes.position as Float32BufferAttribute
    if (pos.getY(0) === top && pos.getY(2) === bottom) {
      return
    }

    pos.setY(0, top)
    pos.setY(1, top)
    pos.setY(2, bottom)
    pos.setY(3, bottom)

    pos.needsUpdate = true
    this.lastUvsParams = [ -1, -1, -1 ]

    this.computeBoundingSphere()
  }

  updateUvs(leftOffset: number, topOffset: number, tex: number) {
    const [ lastLeft, lastTop, lastTex ] = this.lastUvsParams
    if (leftOffset === lastLeft &&
        topOffset === lastTop &&
        tex === lastTex) {
      return
    }
    this.lastUvsParams = [ leftOffset, topOffset, tex ]

    const texWidth = this.textures[tex].patch.width << FRACBITS
    const texHeight = this.textures[tex].patch.height << FRACBITS

    const uvs = this.attributes.uv as Float32BufferAttribute

    const x1 = leftOffset / texWidth
    const x2 = (leftOffset + this.width) / texWidth
    const y1 = 1 - (topOffset + this.height) / texHeight
    const y2 = 1 - topOffset / texHeight

    uvs.setXY(0, x1, y2)
    uvs.setXY(1, x2, y2)
    uvs.setXY(2, x1, y1)
    uvs.setXY(3, x2, y1)

    uvs.needsUpdate = true
  }

}
