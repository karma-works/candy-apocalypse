import {
  DataTexture,
  RGBFormat,
  WebGLCubeRenderTarget,
  WebGLRenderer,
} from 'three'
import { FlatTexture } from './flat-texture'
import { Video as IVideo } from '../interfaces/video'
import { Palette } from '../interfaces/palette'
import { PatchTexture } from './patch-texture'
import { Data as RData } from '../rendering/data'
import { Video as RVideo } from '../rendering/video'
import { Rendering } from './rendering'
import { VisSprite } from '../rendering/things/vis-sprite'

export class Textures {
  private patchCache: PatchTexture[] = []
  private flipPatchCache: PatchTexture[] = []
  private patchTextureCache: PatchTexture[] = []
  private skyTextureCache: WebGLCubeRenderTarget[] = []
  private flatTextureCache: FlatTexture[] = []

  get palette(): Palette {
    return this.rendering.iVideo.palette
  }
  private get rData(): RData {
    return this.rendering.data
  }

  constructor(private rendering: Rendering) { }

  getPatchTexture(num: number): PatchTexture {
    num = this.rData.textures.getNum(num)

    if (!this.patchTextureCache[num]) {
      const patch = this.rData.textures[num].patch
      this.patchTextureCache[num] = new PatchTexture(patch)
    }
    return this.patchTextureCache[num]
  }

  getFlatTexture(num: number): FlatTexture {
    num = this.rData.flats.getNum(num)

    if (!this.flatTextureCache[num]) {
      const flat = this.rData.flats[num].flat
      this.flatTextureCache[num] = new FlatTexture(flat)
    }
    return this.flatTextureCache[num]
  }

  getSprite(sprite: VisSprite): PatchTexture {
    const flip = sprite.xIScale < 0
    const lump = this.rData.sprites[sprite.patch].lump

    const cache = flip ? this.flipPatchCache : this.patchCache
    if (!cache[lump]) {
      const patch = this.rData.sprites[sprite.patch].patch
      cache[lump] = new PatchTexture(patch)

      if (flip) {
        cache[lump].repeat.set(-1, 1)
      }
    }

    return cache[lump]
  }

  getSkyTexture(num: number, renderer: WebGLRenderer): WebGLCubeRenderTarget {
    const palette = this.palette
    num = this.rData.textures.getNum(num)

    if (!this.skyTextureCache[num]) {
      const patch = this.rData.textures[num].patch

      const rVideo = new RVideo(1024, 512)
      rVideo.init(1)
      const iVideo = new IVideo(rVideo)
      iVideo.palette = palette

      const y = 160
      for (let i = 0; i < 4; ++i) {
        rVideo.drawPatch(256 * i, y, 0, patch, { flipped: true })
      }

      const data = new Uint8ClampedArray(1024 * 512 * 3)
      iVideo.drawInImageData(data, false)

      const t = new DataTexture(data, 1024, 512, RGBFormat)
      t.flipY = true

      const rt = new WebGLCubeRenderTarget(t.image.height)
      rt.fromEquirectangularTexture(renderer, t)

      this.skyTextureCache[num] = rt
    }
    return this.skyTextureCache[num]
  }

}
