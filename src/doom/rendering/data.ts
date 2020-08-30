import { Column } from './defs/column'
import { FRACBITS } from '../misc/fixed'
import { FlatArray } from '../textures/flat-array'
import { LumpReader } from '../wad/lump-reader'
import { MapPatch } from './data/map-patch'
import { MapTexture } from './data/map-texture'
import { Patch } from './defs/patch'
import { Play } from '../play/setup'
import { Post } from './defs/post'
import { Rendering } from './rendering'
import { TexPatch } from './data/tex-patch'
import { Texture } from './data/texture'
import { tostring } from '../utils/c'

//
// Graphics.
// DOOM graphics for walls and sprites
// is stored in vertical runs of opaque pixels (posts).
// A column is composed of zero or more posts,
// a patch or sprite is composed of zero or more columns.
//

export class Data {

  private get play(): Play {
    return this.rendering.play
  }

  private get wad(): LumpReader {
    return this.rendering.wad
  }

  constructor(private rendering: Rendering) { }

  flats = new FlatArray()

  firstSpriteLump = 0
  lastSpriteLump = 0
  private numSpriteLumps = 0

  private numTextures = 0
  private textures: Texture[] = []

  private textureWidthMask = new Array<number>()
  // needed for texture pegging
  textureHeight = new Array<number>()
  private textureCompositeSize = new Array<number>()
  private textureColumnLump = new Array<number[]>()
  private textureColumnCols = new Array<number[]>()
  private textureComposite = new Array<Patch>()

  // for global animation
  textureTranslation: number[] = []

  // needed for pre rendering
  spriteWidth = new Array<number>()
  spriteOffset = new Array<number>()
  spriteTopOffset = new Array<number>()

  colorMaps = new Uint8ClampedArray(0)


  //
  // MAPTEXTURE_T CACHING
  // When a texture is first needed,
  //  it counts the number of composite columns
  //  required in the texture and allocates space
  //  for a column directory and any new columns.
  // The directory will simply point inside other patches
  //  if there is only one patch in a given column,
  //  but any columns with multiple patches
  //  will have new column_ts generated.
  //

  //
  // R_DrawColumnInCache
  // Clip and draw a column
  //  from a patch into a cached post.
  //
  drawColumnInCache(patch: Column, cache: Column, originY: number, cacheHeight: number): void {
    let count: number
    let position: number

    let col: Post
    for (col of patch.posts) {
      count = col.length
      position = originY + col.topDelta

      if (position < 0) {
        count += position
        position = 0
      }

      if (position + count > cacheHeight) {
        count = cacheHeight - position
      }

      if (count > 0) {
        cache.posts[0].bytes.set(
          col.bytes.slice(0, count),
          position,
        )
      }
    }
  }

  //
  // R_GenerateComposite
  // Using the texture definition,
  //  the composite texture is created from the patches,
  //  and each column is cached.
  //
  generateComposite(textNum: number): void {

    const texture = this.textures[textNum]
    const colLump = this.textureColumnLump[textNum]

    const columns = Array.from({ length: texture.width },
      () => new Column([ new Post(texture.height) ]))
    this.textureComposite[textNum] = new Patch(columns)

    // Composite the columns together.
    let patch: TexPatch
    let realPatch: Patch
    let x: number
    let x1: number
    let x2: number
    let patchCol: Column
    for (let i = 0; i < texture.patchCount; ++i) {
      patch = texture.patches[i]
      realPatch = this.wad.cacheLumpNum(patch.patch, Patch)
      x1 = patch.originX
      x2 = x1 + realPatch.width

      if (x1 < 0) {
        x = 0
      } else {
        x = x1
      }

      if (x2 > texture.width) {
        x2 = texture.width
      }

      for (; x < x2; ++x) {
        // Column does not have multiple patches?
        if (colLump[x] >= 0) {
          continue
        }

        patchCol = realPatch.columns[x - x1]

        this.drawColumnInCache(
          patchCol,
          columns[x],
          patch.originY,
          texture.height,
        )
      }
    }
  }

  //
  // R_GenerateLookup
  //
  private generateLookup(textNum: number): void {
    const texture = this.textures[textNum]

    // Composited texture not created yet.
    delete this.textureComposite[textNum]

    this.textureCompositeSize[textNum] = 0
    const colLump = this.textureColumnLump[textNum]
    const colCol = this.textureColumnCols[textNum]

    // Now count the number of columns
    //  that are covered by more than one patch.
    // Fill in the lump / offset, so columns
    //  with only a single patch are all done.
    const patchCount = new Array<number>(texture.width).fill(0)

    let patch: TexPatch
    let realPatch: Patch
    let x: number, x1: number, x2: number
    for (let i = 0; i < texture.patchCount; ++i) {
      patch = texture.patches[i]
      realPatch = this.wad.cacheLumpNum(patch.patch, Patch)
      x1 = patch.originX
      x2 = x1 + realPatch.width

      if (x1 < 0) {
        x = 0
      } else {
        x = x1
      }

      if (x2 > texture.width) {
        x2 = texture.width
      }

      for (; x < x2; ++x) {
        patchCount[x]++
        colLump[x] = patch.patch
        colCol[x] = x - x1
      }
    }

    for (x = 0; x < texture.width; ++x) {
      if (!patchCount[x]) {
        console.log(`R_GenerateLookup: column without a patch (${texture.name})`)
        return
      }

      if (patchCount[x] > 1) {
        // Use the cached block.
        colLump[x] = -1
        colCol[x] = x

        this.textureCompositeSize[textNum] += texture.height
      }
    }
  }

  //
  // R_GetColumn
  //
  getColumn(tex: number, col: number): Column {
    col &= this.textureWidthMask[tex]
    const lump = this.textureColumnLump[tex][col]
    col = this.textureColumnCols[tex][col]

    if (lump > 0) {
      return this.wad.cacheLumpNum(lump, Patch).columns[col]
    }


    if (!this.textureComposite[tex]) {
      this.generateComposite(tex)
    }

    return this.textureComposite[tex].columns[col]
  }

  //
  // R_InitTextures
  // Initializes the texture list
  //  with the textures from the world map.
  //
  private initTextures(): void {
    // Load the patch names from pnames.lmp.

    const names = this.wad.cacheLumpName('PNAMES')
    let int32 = new Int32Array(names, 0, 1)
    const numMapPatches = int32[0]
    const patchLoopkup = new Array<number>(numMapPatches)

    let name: string
    for (let i = 0; i < numMapPatches; ++i) {
      name = tostring(names, 4 + i * 8, 8)

      patchLoopkup[i] = this.wad.checkNumForName(name)
    }

    // Load the map texture definitions from textures.lmp.
    // The data is contained in one or two lumps,
    //  TEXTURE1 for shareware, plus TEXTURE2 for commercial.
    let mapTex: ArrayBuffer, mapTex2: ArrayBuffer | null
    let maxOff: number, maxOff2: number
    mapTex = this.wad.cacheLumpName('TEXTURE1')
    int32 = new Int32Array(mapTex, 0, 1)
    const numTextures1 = int32[0]
    let numTextures2: number
    maxOff = this.wad.lumpLength(this.wad.getNumForName('TEXTURE1'))
    let directoryPtr = 0
    let directory = new Int32Array(mapTex, 4, numTextures1)

    if (this.wad.checkNumForName('TEXTURE2') !== -1) {
      mapTex2 = this.wad.cacheLumpName('TEXTURE2')
      int32 = new Int32Array(mapTex2, 0, 1)
      numTextures2 = int32[0]
      maxOff2 =this.wad.lumpLength(this.wad.getNumForName('TEXTURE2'))
    } else {
      mapTex2 = null
      numTextures2 = 0
      maxOff2 = 0
    }

    this.numTextures = numTextures1 + numTextures2

    this.textures = new Array(this.numTextures).fill(0)
    this.textureColumnLump = new Array(this.numTextures).fill(0)
    this.textureColumnCols = new Array(this.numTextures).fill(0)
    this.textureComposite = new Array(this.numTextures).fill(0)
    this.textureCompositeSize = new Array(this.numTextures).fill(0)
    this.textureWidthMask = new Array(this.numTextures).fill(0)
    this.textureHeight = new Array(this.numTextures).fill(0)

    let offset: number

    let mTexture: MapTexture
    let mPatch: MapPatch
    let texture: Texture
    let patch: TexPatch

    for (let i = 0; i < this.numTextures; ++i, ++directoryPtr) {
      if (i === numTextures1 && mapTex2 !== null) {
        // Start looking in second texture file.
        mapTex = mapTex2
        maxOff = maxOff2

        directory = new Int32Array(mapTex, 4, numTextures2)
        directoryPtr = 0
      }

      offset = directory[directoryPtr]

      if (offset > maxOff) {
        throw 'R_InitTextures: bad texture directory'
      }

      mTexture = new MapTexture(mapTex.slice(offset))

      texture = this.textures[i] = new Texture(
        mTexture.name,
        mTexture.width,
        mTexture.height,
        mTexture.patchCount,
      )
      let j = 0
      for (mPatch of mTexture.patches()) {
        patch = texture.patches[j]
        patch.originX = mPatch.originX
        patch.originY = mPatch.originY
        patch.patch = patchLoopkup[mPatch.patch]

        ++j

        if (patch.patch === -1) {
          throw `R_InitTextures: Missing patch in texture ${texture.name}`
        }
      }

      this.textureColumnLump[i] = new Array(texture.width).fill(0)
      this.textureColumnCols[i] = new Array(texture.width).fill(0)

      j = 1
      while (j * 2 <= texture.width) {
        j <<= 1
      }
      this.textureWidthMask[i] = j - 1
      this.textureHeight[i] = texture.height << FRACBITS
    }

    // Precalculate whatever possible.
    for (let i = 0; i < this.numTextures; ++i) {
      this.generateLookup(i)
    }

    // Create translation table for global animation.
    this.textureTranslation = new Array(this.numTextures + 1).fill(0)
    for (let i = 0; i < this.numTextures; ++i) {
      this.textureTranslation[i] = i
    }
  }

  //
  // R_InitSpriteLumps
  // Finds the width and hoffset of all sprites in the wad,
  //  so the sprite does not need to be cached completely
  //  just for having the header info ready during rendering.
  //
  private initSpriteLumps(): void {

    this.firstSpriteLump = this.wad.getNumForName('S_START') + 1
    this.lastSpriteLump = this.wad.getNumForName('S_END') - 1

    this.numSpriteLumps = this.lastSpriteLump - this.firstSpriteLump + 1
    this.spriteWidth = new Array(this.numSpriteLumps).fill(0)
    this.spriteOffset = new Array(this.numSpriteLumps).fill(0)
    this.spriteTopOffset = new Array(this.numSpriteLumps).fill(0)

    let patch: Patch
    for (let i = 0; i < this.numSpriteLumps; ++i) {
      patch = this.wad.cacheLumpNum(this.firstSpriteLump + i, Patch)

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

    const lump = this.wad.getNumForName('COLORMAP')

    // const colorMaps
    this.colorMaps = new Uint8ClampedArray(this.wad.readLump(lump))
  }

  //
  // R_InitData
  // Locates all the lumps
  //  that will be used by all views
  // Must be called after W_Init.
  //
  initData(): void {
    this.initTextures()
    console.log('InitTextures')
    this.flats = new FlatArray(this.wad)
    console.log('InitFlats')
    this.initSpriteLumps()
    console.log('InitSprites')
    this.initColorMaps()
    console.log('InitColormaps')
  }

  //
  // R_CheckTextureNumForName
  // Check whether texture is available.
  // Filter out NoTexture indicator.
  //
  checkTextureNumForName(name: string): number {

    // "NoTexture" marker.
    if (name.startsWith('-')) {
      return 0
    }

    for (let i = 0; i < this.numTextures; ++i) {
      if (this.textures[i].name.toUpperCase() === name.toUpperCase()) {
        return i
      }
    }

    return -1
  }

  //
  // R_TextureNumForName
  // Calls R_CheckTextureNumForName,
  //  aborts with error message.
  //
  textureNumForName(name: string): number {
    const i = this.checkTextureNumForName(name)

    if (i === -1) {
      throw `R_TextureNumForName: ${name} not found`
    }

    return i
  }
}
