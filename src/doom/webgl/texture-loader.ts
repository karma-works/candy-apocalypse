import { ColorMap, ColorMaps } from '../interfaces/colormap'
import {
  DataTexture,
  EquirectangularRefractionMapping,
  RGBAFormat,
} from 'three'
import { Palette, Palettes } from '../interfaces/palette'
import { FlatArray } from '../textures/flat-array'
import { FlatTexture } from './textures/flat-texture'
import { Video as IVideo } from '../interfaces/video'
import { LumpReader } from '../wad/lump-reader'
import { PaletteTexture } from './textures/palette-texture'
import { Patch } from '../rendering/defs/patch'
import { PatchTexture } from './textures/patch-texture'
import { Video as RVideo } from '../rendering/video'
import { SpriteArray } from '../sprites/sprite-array'
import { SpriteDefsArray } from '../sprites/sprite-defs-array'
import { SpriteNum } from '../doom/info/sprite-num'
import { SpriteTexture } from './textures/sprite-texture'
import { TextureArray } from '../textures/texture-array'

export type PatchTextures = {
  map: PatchTexture,
  alphaMap: PatchTexture,
  transparent: boolean
  patch: Patch,
}

export class TextureLoader {
  private patchTextureCache: PatchTextures[] = []
  private skyTextureCache: DataTexture[] = []
  private flatTextureCache: FlatTexture[] = []
  private spriteCache: SpriteTexture[] = []

  paletteTexture: PaletteTexture

  flats: FlatArray
  sprites: SpriteArray
  spriteDefs: SpriteDefsArray
  textures: TextureArray

  constructor(lumpReader?: LumpReader) {
    let palette: Palette
    let colorMap: ColorMap
    if (lumpReader) {
      const palettes = lumpReader.cacheLumpName(Palettes.DEFAULT_LUMP, Palettes)
      palette = palettes.p[0]
      const colorMaps = lumpReader.cacheLumpName(ColorMaps.DEFAULT_LUMP, ColorMaps)
      colorMap = colorMaps.c[0]
    } else {
      palette = new Palette()
      colorMap = new ColorMap()
    }
    this.paletteTexture = new PaletteTexture(palette, colorMap)

    this.flats = new FlatArray(lumpReader)
    this.sprites = new SpriteArray(lumpReader)
    this.spriteDefs = new SpriteDefsArray(this.sprites)
    this.textures = new TextureArray(lumpReader)
  }

  dispose() {
    this.paletteTexture.dispose()
    this.patchTextureCache.forEach(({ map, alphaMap }) => {
      map.dispose(); alphaMap.dispose()
    })
    this.skyTextureCache.forEach(t => t.dispose())
    this.flatTextureCache.forEach(t => t.dispose())
  }

  getPatchTexture(num: number): PatchTextures {
    num = this.textures.getNum(num)

    if (!this.patchTextureCache[num]) {
      const patch = this.textures[num].patch
      const patchTex: PatchTextures = {
        map: new PatchTexture(patch),
        alphaMap: new PatchTexture(patch, true),
        transparent: true,
        patch,
      }
      patchTex.map.needsUpdate = true
      patchTex.alphaMap.needsUpdate = true
      patchTex.transparent = patchTex.alphaMap.image.data.some(s => s !== 255)

      this.patchTextureCache[num] = patchTex
    }
    return this.patchTextureCache[num]
  }

  getFlatTexture(num: number): FlatTexture {
    num = this.flats.getNum(num)

    if (!this.flatTextureCache[num]) {
      const flat = this.flats[num].flat
      this.flatTextureCache[num] = new FlatTexture(flat)
      this.flatTextureCache[num].needsUpdate = true
    }
    return this.flatTextureCache[num]
  }

  getSpriteTexture(num: SpriteNum): SpriteTexture {
    if (!this.spriteCache[num]) {
      const sprDef = this.spriteDefs[num]
      this.spriteCache[num] = new SpriteTexture(sprDef, this.sprites)
      this.spriteCache[num].needsUpdate = true
    }
    return this.spriteCache[num]
  }

  getSkyTexture(num: number): DataTexture {
    const palette = this.paletteTexture.palette
    num = this.textures.getNum(num)

    if (!this.skyTextureCache[num]) {
      const patch = this.textures[num].patch

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
      t.mapping = EquirectangularRefractionMapping
      t.flipY = true
      t.needsUpdate = true
      t.colorSpace = 'srgb'

      this.skyTextureCache[num] = t
    }
    return this.skyTextureCache[num]
  }

}
