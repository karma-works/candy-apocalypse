import { DataTexture, NearestFilter, RGBAFormat, RepeatWrapping } from 'three'
import { Patch } from '../rendering/defs/patch'
import { Video as RVideo } from '../rendering/video'

export class PatchTexture extends DataTexture {
  constructor(patch: Patch) {
    const rVideo = new RVideo(patch.width, patch.height)
    rVideo.init(1)
    rVideo.drawPatch(patch.leftOffset, patch.topOffset, 0, patch)

    const source = rVideo.screens[0]
    const alpha = rVideo.alpha

    const dest = new Uint8ClampedArray(source.length * 4)
    let s = 0
    let d = 0
    while (s < source.length) {
      dest[d++] = source[s]
      dest[d++] = source[s]
      dest[d++] = source[s]
      dest[d++] = alpha[s]
      s++
    }

    super(dest, patch.width, patch.height, RGBAFormat)

    this.flipY = true

    this.wrapS = RepeatWrapping
    this.wrapT = RepeatWrapping

    this.magFilter = NearestFilter
  }
}
