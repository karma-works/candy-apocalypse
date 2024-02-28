import { ColorMaps } from '../interfaces/colormap'
import { FlatArray } from '../textures/flat-array'
import { LumpReader } from '../wad/lump-reader'
import { SpriteArray } from '../sprites/sprite-array'
import { SpriteDefsArray } from '../sprites/sprite-defs-array'
import { TextureArray } from '../textures/texture-array'

//
// Graphics.
// DOOM graphics for walls and sprites
// is stored in vertical runs of opaque pixels (posts).
// A column is composed of zero or more posts,
// a patch or sprite is composed of zero or more columns.
//

export class Data {
  constructor(private lumpReader: LumpReader) { }

  flats = new FlatArray()
  textures = new TextureArray()
  sprites = new SpriteArray()
  spriteDefs = new SpriteDefsArray()

  colorMaps = new ColorMaps()

  //
  // R_InitColormaps
  //
  private initColorMaps(): void {
    // Load in the light tables,
    //  256 byte align tables.
    this.colorMaps = this.lumpReader.cacheLumpName(ColorMaps.DEFAULT_LUMP, ColorMaps)
  }

  //
  // R_InitData
  // Locates all the lumps
  //  that will be used by all views
  // Must be called after W_Init.
  //
  initData(): void {
    this.textures = new TextureArray(this.lumpReader)
    console.log('InitTextures')
    this.flats = new FlatArray(this.lumpReader)
    console.log('InitFlats')
    this.sprites = new SpriteArray(this.lumpReader)
    this.spriteDefs = new SpriteDefsArray(this.sprites)
    console.log('InitSprites')
    this.initColorMaps()
    console.log('InitColormaps')
  }
}
