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
import { svgRasterizer } from './svg-rasterizer'

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
      const patchName = this.textures[num].name || 'UNKNOWN'
      let tex = svgRasterizer.getTexture(patchName, patch.width, patch.height)
      if (!tex) tex = svgRasterizer.getFallbackTexture('wall', patchName, patch.width || 64, patch.height || 64)
      tex.userData.isSvg = true

      const patchTex: PatchTextures = {
        map: tex as any,
        alphaMap: tex as any,
        transparent: true,
        patch,
      }

      this.patchTextureCache[num] = patchTex
    }
    return this.patchTextureCache[num]
  }

  getFlatTexture(num: number): FlatTexture {
    num = this.flats.getNum(num)

    if (!this.flatTextureCache[num]) {
      const flatName = this.flats[num].name || 'UNKNOWN'
      let tex = svgRasterizer.getTexture(flatName, 64, 64)
      if (!tex) tex = svgRasterizer.getFallbackTexture('flat', flatName, 64, 64)
      tex.userData.isSvg = true

      this.flatTextureCache[num] = tex as any
    }
    return this.flatTextureCache[num]
  }

  getSpriteTexture(num: SpriteNum): SpriteTexture {
    if (!this.spriteCache[num]) {
      const sprDef = this.spriteDefs[num]
      const firstPatchName = this.sprites[sprDef.frames[0].lump[0]]?.name || 'UNKNOWN'
      const spriteName = firstPatchName.substring(0, 4)

      let tex = svgRasterizer.getTexture(spriteName, 64, 64)
      if (!tex) tex = svgRasterizer.getFallbackTexture('sprite', spriteName, 64, 64)
      tex.userData.isSvg = true

      // We spoof the SpriteTexture fields to keep shaders happy
      const fakeSpriteTexture: any = tex;
      fakeSpriteTexture.rotations = 1;
      fakeSpriteTexture.frames = 1;
      fakeSpriteTexture.width = 64;
      fakeSpriteTexture.height = 64;
      fakeSpriteTexture.bottomOffset = 64;

      this.spriteCache[num] = fakeSpriteTexture
    }
    return this.spriteCache[num]
  }

  getSkyTexture(num: number): DataTexture {
    const palette = this.paletteTexture.palette
    num = this.textures.getNum(num)

    if (!this.skyTextureCache[num]) {
      const patch = this.textures[num].patch

      const rVideo = new RVideo({ logical: [1024, 512] })
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
