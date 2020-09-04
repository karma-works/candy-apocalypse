import { FRACBITS } from '../misc/fixed'
import { FlatArray } from '../textures/flat-array'
import { LumpReader } from '../wad/lump-reader'
import { Patch } from './defs/patch'
import { Textures } from '../textures/textures'

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
  textures = new Textures()

  firstSpriteLump = 0
  lastSpriteLump = 0
  private numSpriteLumps = 0

  // needed for pre rendering
  spriteWidth = new Array<number>()
  spriteOffset = new Array<number>()
  spriteTopOffset = new Array<number>()

  colorMaps = new Uint8ClampedArray(0)

  //
  // R_InitSpriteLumps
  // Finds the width and hoffset of all sprites in the wad,
  //  so the sprite does not need to be cached completely
  //  just for having the header info ready during rendering.
  //
  private initSpriteLumps(): void {

    this.firstSpriteLump = this.lumpReader.getNumForName('S_START') + 1
    this.lastSpriteLump = this.lumpReader.getNumForName('S_END') - 1

    this.numSpriteLumps = this.lastSpriteLump - this.firstSpriteLump + 1
    this.spriteWidth = new Array(this.numSpriteLumps).fill(0)
    this.spriteOffset = new Array(this.numSpriteLumps).fill(0)
    this.spriteTopOffset = new Array(this.numSpriteLumps).fill(0)

    let patch: Patch
    for (let i = 0; i < this.numSpriteLumps; ++i) {
      patch = this.lumpReader.cacheLumpNum(this.firstSpriteLump + i, Patch)

      this.spriteWidth[i] = patch.width << FRACBITS
      this.spriteOffset[i] = patch.leftOffset << FRACBITS
      this.spriteTopOffset[i] = patch.topOffset << FRACBITS
    }
  }

  //
  // R_InitColormaps
  //
  private initColorMaps(): void {
    // Load in the light tables,
    //  256 byte align tables.

    const lump = this.lumpReader.getNumForName('COLORMAP')

    // const colorMaps
    this.colorMaps = new Uint8ClampedArray(this.lumpReader.readLump(lump))
  }

  //
  // R_InitData
  // Locates all the lumps
  //  that will be used by all views
  // Must be called after W_Init.
  //
  initData(): void {
    this.textures = new Textures(this.lumpReader)
    console.log('InitTextures')
    this.flats = new FlatArray(this.lumpReader)
    console.log('InitFlats')
    this.initSpriteLumps()
    console.log('InitSprites')
    this.initColorMaps()
    console.log('InitColormaps')
  }
}
