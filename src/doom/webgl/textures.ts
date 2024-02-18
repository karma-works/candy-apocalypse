import {
  DataTexture,
  EquirectangularReflectionMapping,
  RGBFormat,
} from 'three'
import { FlatTexture } from './textures/flat-texture'
import { Video as IVideo } from '../interfaces/video'
import { Palette } from '../interfaces/palette'
import { PatchTexture } from './textures/patch-texture'
import { Data as RData } from '../rendering/data'
import { Video as RVideo } from '../rendering/video'
import { Rendering } from './rendering'
import { VisSprite } from '../rendering/things/vis-sprite'

// Second one is the alphamap
type PatchTextureTuple = [PatchTexture, PatchTexture]

export class Textures {
  private patchCache: PatchTextureTuple[] = []
  private flipPatchCache: PatchTextureTuple[] = []
  private patchTextureCache: PatchTextureTuple[] = []
  private skyTextureCache: DataTexture[] = []
  private flatTextureCache: FlatTexture[] = []

  get palette(): Palette {
    return this.rendering.iVideo.palette
  }
  private get rData(): RData {
    return this.rendering.data
  }

  constructor(private rendering: Rendering) { }

  getPatchTexture(num: number): PatchTextureTuple {
    num = this.rData.textures.getNum(num)

    if (!this.patchTextureCache[num]) {
      const patch = this.rData.textures[num].patch
      this.patchTextureCache[num] = [
        new PatchTexture(patch), new PatchTexture(patch, true),
      ]
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

  getSprite(sprite: VisSprite): PatchTextureTuple {
    const flip = sprite.xIScale < 0
    const lump = this.rData.sprites[sprite.patch].lump

    const cache = flip ? this.flipPatchCache : this.patchCache
    if (!cache[lump]) {
      const patch = this.rData.sprites[sprite.patch].patch
      cache[lump] = [
        new PatchTexture(patch), new PatchTexture(patch, true),
      ]

      if (flip) {
        cache[lump][0].repeat.set(-1, 1)
        cache[lump][1].repeat.set(-1, 1)
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

      const data = new Uint8ClampedArray(1024 * 512 * 3)
      iVideo.drawInImageData(data, false)

      const t = new DataTexture(data, 1024, 512, RGBFormat)
      t.mapping = EquirectangularReflectionMapping
      t.flipY = true

      this.skyTextureCache[num] = t
    }
    return this.skyTextureCache[num]
  }

}
