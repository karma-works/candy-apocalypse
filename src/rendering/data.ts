import { Column } from './column'
import { FRACBITS } from '../misc/fixed'
import { Game } from '../game/game'
import { MapPatch } from './map-patch'
import { MapTexture } from './map-texture'
import { Patch } from './patch'
import { Play } from '../play/setup'
import { Post } from './post'
import { Rendering } from './rendering'
import { Sky } from './sky'
import { SpriteFrame } from './sprite-frame'
import { TexPatch } from './tex-patch'
import { Texture } from './texture'
import { Things } from './things'
import { Thinker } from '../doom/think'
import { Tick } from '../play/tick'
import { Wad } from '../wad/wad'
import { mObjThinker } from '../play/mobj'
import { tostring } from '../c'

//
// Graphics.
// DOOM graphics for walls and sprites
// is stored in vertical runs of opaque pixels (posts).
// A column is composed of zero or more posts,
// a patch or sprite is composed of zero or more columns.
//

export class Data {
  private get game(): Game {
    return this.rendering.game
  }
  private get play(): Play {
    return this.rendering.play
  }
  private get sky(): Sky {
    return this.rendering.sky
  }
  private get things(): Things {
    return this.rendering.things
  }
  private get tick(): Tick {
    return this.rendering.tick
  }
  private get wad(): Wad {
    return this.rendering.wad
  }

  constructor(private rendering: Rendering) { }


  firstFlat = 0
  private lastFlat = 0
  private numFlats = 0

  private firstPatch = 0
  private lastPatch = 0
  private numPatchs = 0

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
  private textureColumnOfs = new Array<number[]>()
  private textureComposite = new Array<ArrayBuffer>()

  // for global animation
  flatTranslation: number[] = []
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
  drawColumnInCache(patch: Column, cache: Uint8Array, originY: number, cacheHeight: number): void {
    let count: number
    let position: number

    let col: Post
    for (col of patch) {
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
        cache.set(col.bytes.slice(0, count), position)
      }
    }
  }

  //
  // R_GenerateComposite
  // Using the texture definition,
  //  the composite texture is created from the patches,
  //  and each column is cached.
  //
  async generateComposite(textNum: number): Promise<void> {

    const texture = this.textures[textNum]
    const colLump = this.textureColumnLump[textNum]
    const colOfs = this.textureColumnOfs[textNum]

    const block = new ArrayBuffer(this.textureCompositeSize[textNum])
    this.textureComposite[textNum] = block

    // Composite the columns together.
    let patch: TexPatch
    let realPatch: Patch
    let x: number
    let x1: number
    let x2: number
    let patchCol: Column
    for (let i = 0; i < texture.patchCount; ++i) {
      patch = texture.patches[i]
      realPatch = new Patch(await this.wad.cacheLumpNum(patch.patch))
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

        patchCol = realPatch.getColumn(x - x1)

        this.drawColumnInCache(
          patchCol,
          new Uint8Array(block, colOfs[x]),
          patch.originY,
          texture.height,
        )
      }
    }
  }

  //
  // R_GenerateLookup
  //
  private async generateLookup(textNum: number): Promise<void> {
    const texture = this.textures[textNum]

    // Composited texture not created yet.
    delete this.textureComposite[textNum]

    this.textureCompositeSize[textNum] = 0
    const colLump = this.textureColumnLump[textNum]
    const colOfs = this.textureColumnOfs[textNum]

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
      realPatch = new Patch(await this.wad.cacheLumpNum(patch.patch))
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
        colOfs[x] = realPatch.columnOfs[x - x1] + 3
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
        colOfs[x] = this.textureCompositeSize[textNum]

        if (this.textureCompositeSize[textNum] > 0x10000 - texture.height) {
          throw `R_GenerateLookup: texture ${textNum} is >64k`
        }

        this.textureCompositeSize[textNum] += texture.height
      }
    }
  }

  //
  // R_GetColumn
  //
  async getColumn(tex: number, col: number, withHeader = false): Promise<ArrayBuffer> {
    col &= this.textureWidthMask[tex]
    const lump = this.textureColumnLump[tex][col]
    let ofs = this.textureColumnOfs[tex][col]
    if (withHeader) {
      ofs -= 3
    }

    if (lump > 0) {
      return (await this.wad.cacheLumpNum(lump)).slice(ofs)
    }

    if (!this.textureComposite[tex] ||
      this.textureComposite[tex].byteLength === 0
    ) {
      await this.generateComposite(tex)
    }

    return this.textureComposite[tex].slice(ofs)
  }

  //
  // R_InitTextures
  // Initializes the texture list
  //  with the textures from the world map.
  //
  private async initTextures(): Promise<void> {
    // Load the patch names from pnames.lmp.

    const names = await this.wad.cacheLumpName('PNAMES')
    let int32 = new Int32Array(names, 0, 1)
    const numMapPatches = int32[0]
    const patchLoopkup = new Array<number>(numMapPatches)

    let name: string
    for (let i = 0; i < numMapPatches; ++i) {
      // uppercase for w94_1
      name = tostring(names, 4 + i * 8, 8).toUpperCase()

      patchLoopkup[i] = this.wad.checkNumForName(name)
    }

    // Load the map texture definitions from textures.lmp.
    // The data is contained in one or two lumps,
    //  TEXTURE1 for shareware, plus TEXTURE2 for commercial.
    let mapTex: ArrayBuffer, mapTex2: ArrayBuffer | null
    let maxOff: number, maxOff2: number
    mapTex = await this.wad.cacheLumpName('TEXTURE1')
    int32 = new Int32Array(mapTex, 0, 1)
    const numTextures1 = int32[0]
    let numTextures2: number
    maxOff = this.wad.lumpLength(this.wad.getNumForName('TEXTURE1'))
    let directoryPtr = 0
    let directory = new Int32Array(mapTex, 4, numTextures1)

    if (this.wad.checkNumForName('TEXTURE2') !== -1) {
      mapTex2 = await this.wad.cacheLumpName('TEXTURE2')
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
    this.textureColumnOfs = new Array(this.numTextures).fill(0)
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
      this.textureColumnOfs[i] = new Array(texture.width).fill(0)

      j = 1
      while (j * 2 <= texture.width) {
        j <<= 1
      }
      this.textureWidthMask[i] = j - 1
      this.textureHeight[i] = texture.height << FRACBITS
    }

    // Precalculate whatever possible.
    for (let i = 0; i < this.numTextures; ++i) {
      await this.generateLookup(i)
    }

    // Create translation table for global animation.
    this.textureTranslation = new Array(this.numTextures + 1).fill(0)
    for (let i = 0; i < this.numTextures; ++i) {
      this.textureTranslation[i] = i
    }
  }

  //
  // R_InitFlats
  //
  private initFlats(): void {

    this.firstFlat = this.wad.getNumForName('F_START') + 1
    this.lastFlat = this.wad.getNumForName('F_END') - 1
    this.numFlats = this.lastFlat - this.firstFlat + 1

    // Create translation table for global animation.
    this.flatTranslation = new Array(this.numFlats + 1).fill(0)

    for (let i = 0; i < this.numFlats; ++i) {
      this.flatTranslation[i] = i
    }
  }

  //
  // R_InitSpriteLumps
  // Finds the width and hoffset of all sprites in the wad,
  //  so the sprite does not need to be cached completely
  //  just for having the header info ready during rendering.
  //
  private async initSpriteLumps(): Promise<void> {

    this.firstSpriteLump = this.wad.getNumForName('S_START') + 1
    this.lastSpriteLump = this.wad.getNumForName('S_END') - 1

    this.numSpriteLumps = this.lastSpriteLump - this.firstSpriteLump + 1
    this.spriteWidth = new Array(this.numSpriteLumps).fill(0)
    this.spriteOffset = new Array(this.numSpriteLumps).fill(0)
    this.spriteTopOffset = new Array(this.numSpriteLumps).fill(0)

    let patch: Patch
    for (let i = 0; i < this.numSpriteLumps; ++i) {
      patch = new Patch(await this.wad.cacheLumpNum(this.firstSpriteLump + i))

      this.spriteWidth[i] = patch.width << FRACBITS
      this.spriteOffset[i] = patch.leftOffset << FRACBITS
      this.spriteTopOffset[i] = patch.topOffset << FRACBITS
    }
  }

  //
  // R_InitColormaps
  //
  private async initColorMaps(): Promise<void> {
    // Load in the light tables,
    //  256 byte align tables.

    const lump = this.wad.getNumForName('COLORMAP')

    // const colorMaps
    this.colorMaps = new Uint8ClampedArray(await this.wad.readLump(lump))
  }

  //
  // R_InitData
  // Locates all the lumps
  //  that will be used by all views
  // Must be called after W_Init.
  //
  async initData(): Promise<void> {
    await this.initTextures()
    console.log('InitTextures')
    this.initFlats()
    console.log('InitFlats')
    await this.initSpriteLumps()
    console.log('InitSprites')
    await this.initColorMaps()
    console.log('InitColormaps')
  }

  //
  // R_FlatNumForName
  // Retrieval, get a flat number for a flat name.
  //
  flatNumForName(name: string): number {

    const i = this.wad.checkNumForName(name)
    if (i === -1) {
      throw `R_FlatNumForName: ${name} not found`
    }
    return i - this.firstFlat
  }

  //
  // R_CheckTextureNumForName
  // Check whether texture is available.
  // Filter out NoTexture indicator.
  //
  private checkTextureNumForName(name: string): number {

    // "NoTexture" marker.
    if (name.startsWith('-')) {
      return 0
    }

    for (let i = 0; i < this.numTextures; ++i) {
      if (this.textures[i].name === name) {
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

  //
  // R_PrecacheLevel
  // Preloads all relevant graphics for the level.
  //
  private flatMemory = 0
  private textureMemory = 0
  private spriteMemory = 0

  async precacheLevel(): Promise<void> {
    if (this.game.demoPlayback) {
      return
    }
    let i: number

    // Precache flats
    const flatPresent = new Array<boolean>(this.numFlats).fill(false)
    for (i = 0; i < this.play.numSectors; ++i) {
      flatPresent[this.play.sectors[i].floorPic] = true
      flatPresent[this.play.sectors[i].ceilingPic] = true
    }

    this.flatMemory = 0
    let lump: number
    for (i = 0; i < this.numFlats; ++i) {
      if (flatPresent[i]) {
        lump = this.firstFlat + i
        this.flatMemory += this.wad.lumpInfo[lump].size
        await this.wad.cacheLumpNum(lump)
      }
    }


    // Precache textures.
    const texturePresent = new Array<boolean>(this.numTextures).fill(false)
    for (i = 0; i < this.play.numSides; ++i) {
      texturePresent[this.play.sides[i].topTexture] = true
      texturePresent[this.play.sides[i].midTexture] = true
      texturePresent[this.play.sides[i].bottomTexture] = true
    }

    // Sky texture is always present.
    // Note that F_SKY1 is the name used to
    //  indicate a sky floor/ceiling as a flat,
    //  while the sky texture is stored like
    //  a wall texture, with an episode dependend
    //  name.
    texturePresent[this.sky.skyTexture] = true

    this.textureMemory = 0
    let j: number
    let texture: Texture
    for (i = 0; i < this.numTextures; ++i) {
      if (!texturePresent[i]) {
        continue
      }

      texture = this.textures[i]

      for (j = 0; j < texture.patchCount; ++j) {
        lump = texture.patches[j].patch
        this.textureMemory += this.wad.lumpInfo[lump].size
        await this.wad.cacheLumpNum(lump)
      }
    }

    // Precache sprites.
    const spritePresent = new Array<boolean>(this.things.numSprites).fill(false)
    let th: Thinker | null
    for (th = this.tick.thinkerCap.next;
      th !== null && th !== this.tick.thinkerCap;
      th = th.next
    ) {
      if (th.func === mObjThinker) {
        debugger
        // spritepresent[((mobj_t *)th)->sprite] = 1;
      }
    }

    this.spriteMemory = 0
    let sf: SpriteFrame
    let k: number
    for (i = 0; i < this.things.numSprites; ++i) {
      if (!spritePresent[i]) {
        continue
      }

      for (j = 0; j < this.things.sprites[i].numFrames; ++j) {
        sf = this.things.sprites[i].spriteFrames[j]
        for (k = 0; k < 8; ++k) {
          lump = this.firstSpriteLump + sf.lump[k]
          this.spriteMemory += this.wad.lumpInfo[lump].size
          await this.wad.cacheLumpNum(lump)
        }
      }
    }
  }

}
