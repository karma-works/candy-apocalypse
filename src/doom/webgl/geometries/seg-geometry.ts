import { FRACBITS } from '../../misc/fixed';
import { PlaneGeometry } from 'three';
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

    this.vertices[0].x = this.vertices[2].x = v1.y >> FRACBITS
    this.vertices[1].x = this.vertices[3].x = v2.y >> FRACBITS

    this.vertices[0].z = this.vertices[2].z = v1.x >> FRACBITS
    this.vertices[1].z = this.vertices[3].z = v2.x >> FRACBITS
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

    if (this.vertices[0].y === top && this.vertices[2].y === bottom) {
      return
    }

    this.vertices[0].y = this.vertices[1].y = top
    this.vertices[2].y = this.vertices[3].y = bottom
    this.verticesNeedUpdate = true
    this.computeBoundingSphere()
    this.computeFaceNormals()
  }

  updateUvs(leftOffset: number, topOffset: number, tex: number) {
    const texWidth = this.textures[tex].patch.width << FRACBITS
    const texHeight = this.textures[tex].patch.height << FRACBITS

    const uvs = this.faceVertexUvs[0]
    let changes = false

    let val = leftOffset / texWidth
    if (uvs[0][0].x !== val) {
      uvs[0][0].x = uvs[0][1].x = uvs[1][0].x = val
      changes = true
    }
    val = 1 - topOffset / texHeight
    if (uvs[0][0].y !== val) {
      uvs[0][0].y = uvs[0][2].y = uvs[1][2].y = val
      changes = true
    }
    val = (leftOffset + this.width) / texWidth
    if (uvs[0][2].x !== val) {
      uvs[0][2].x = uvs[1][1].x = uvs[1][2].x = val
      changes = true
    }
    val = 1 - (topOffset + this.height) / texHeight
    if (uvs[0][1].y !== val) {
      uvs[0][1].y = uvs[1][0].y = uvs[1][1].y = val
      changes = true
    }

    if (changes) {
      this.uvsNeedUpdate = true
    }
  }

}
