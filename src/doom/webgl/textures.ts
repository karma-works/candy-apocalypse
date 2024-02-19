import {
  DataTexture,
  EquirectangularReflectionMapping,
  RGBAFormat,
} from 'three'
import { FlatTexture } from './textures/flat-texture'
import { Video as IVideo } from '../interfaces/video'
import { Palette } from '../interfaces/palette'
import { PatchTexture } from './textures/patch-texture'
import { Data as RData } from '../rendering/data'
import { Video as RVideo } from '../rendering/video'
import { Rendering } from './rendering'
import { VisSprite } from '../rendering/things/vis-sprite'

type PatchTextures = {
  map: PatchTexture,
  alphaMap: PatchTexture,
}

export class Textures {
  private patchCache: PatchTextures[] = []
  private flipPatchCache: PatchTextures[] = []
  private patchTextureCache: PatchTextures[] = []
  private skyTextureCache: DataTexture[] = []
  private flatTextureCache: FlatTexture[] = []

  get palette(): Palette {
    return this.rendering.iVideo.palette
  }
  private get rData(): RData {
    return this.rendering.data
  }

  constructor(private rendering: Rendering) { }

  getPatchTexture(num: number): PatchTextures {
    num = this.rData.textures.getNum(num)

    if (!this.patchTextureCache[num]) {
      const patch = this.rData.textures[num].patch
      this.patchTextureCache[num] = {
        map: new PatchTexture(patch),
        alphaMap: new PatchTexture(patch, true),
      }
      this.patchTextureCache[num].map.needsUpdate = true
      this.patchTextureCache[num].alphaMap.needsUpdate = true
    }
    return this.patchTextureCache[num]
  }

  getFlatTexture(num: number): FlatTexture {
    num = this.rData.flats.getNum(num)

    if (!this.flatTextureCache[num]) {
      const flat = this.rData.flats[num].flat
      this.flatTextureCache[num] = new FlatTexture(flat)
      this.flatTextureCache[num].needsUpdate = true
    }
    return this.flatTextureCache[num]
  }

  getSprite(sprite: VisSprite): PatchTextures {
    const flip = sprite.xIScale < 0
    const lump = this.rData.sprites[sprite.patch].lump

    const cache = flip ? this.flipPatchCache : this.patchCache
    if (!cache[lump]) {
      const patch = this.rData.sprites[sprite.patch].patch
      cache[lump] = {
        map: new PatchTexture(patch),
        alphaMap: new PatchTexture(patch, true),
      }
      cache[lump].map.needsUpdate = true
      cache[lump].alphaMap.needsUpdate = true

      if (flip) {
        cache[lump].map.repeat.set(-1, 1)
        cache[lump].alphaMap.repeat.set(-1, 1)
      }
    }

    return cache[lump]
  }

  getSkyTexture(num: number): DataTexture {
    const palette = this.palette
    num = this.rData.textures.getNum(num)

    if (!this.skyTextureCache[num]) {
      const patch = this.rData.textures[num].patch

      const rVideo = new RVideo({ logical: [ 1024, 512 ] })
      rVideo.init(1)
      const iVideo = new IVideo(rVideo)
      iVideo.palette = palette

      const y = 160
      for (let i = 0; i < 4; ++i) {
        rVideo.drawPatch(256 * i, y, 0, patch, { flipped: true })
      }

      const data = new Uint8ClampedArray(1024 * 512 * 4)
      iVideo.drawInImageData(data, true)

      const t = new DataTexture(data, 1024, 512, RGBAFormat)
      t.mapping = EquirectangularReflectionMapping
      t.flipY = true
      t.needsUpdate = true

      this.skyTextureCache[num] = t
    }
    return this.skyTextureCache[num]
  }

}
