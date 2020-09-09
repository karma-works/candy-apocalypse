import { DataTexture, NearestFilter, RGBAFormat, RepeatWrapping } from 'three'
import { Video as IVideo } from '../interfaces/video'
import { Palette } from '../interfaces/palette'
import { Patch } from '../rendering/defs/patch'
import { Data as RData } from '../rendering/data'
import { Video as RVideo } from '../rendering/video'
import { Rendering } from './rendering'

export class Textures {

  textureCache: DataTexture[] = []

  get palette(): Palette {
    return this.rendering.iVideo.palette
  }
  get rData(): RData {
    return this.rendering.rData
  }

  constructor(private rendering: Rendering) { }

  getTextureFromPatch(patch: Patch, palette: Palette): DataTexture {
    const rVideo = new RVideo(patch.width, patch.height)
    rVideo.init(1)
    const iVideo = new IVideo(rVideo)
    iVideo.uploadNewPalette(palette)
    rVideo.drawPatch(patch.leftOffset, patch.topOffset, 0, patch)

    const data = new Uint8ClampedArray(patch.width * patch.height * 4)

    iVideo.drawInImageData(data)

    const t = new DataTexture(
      data,
      patch.width,
      patch.height,
      RGBAFormat,
    )

    t.wrapS = RepeatWrapping
    t.wrapT = RepeatWrapping

    t.magFilter = NearestFilter

    return t
  }

  getTexture(num: number): DataTexture {
    const palette = this.palette
    num = this.rData.textures.getNum(num)

    if (!this.textureCache[num]) {
      const patch = this.rData.textures[num].patch
      this.textureCache[num] = this.getTextureFromPatch(patch, palette)
    }
    return this.textureCache[num]
  }
}
