import { Patch } from './defs'
import { Wad } from '../wad/wad'
import { tostring } from '../c'

//
// Graphics.
// DOOM graphics for walls and sprites
// is stored in vertical runs of opaque pixels (posts).
// A column is composed of zero or more posts,
// a patch or sprite is composed of zero or more columns.
//


//
// Texture definition.
// Each texture is composed of one or more patches,
// with patches being lumps stored in the WAD.
// The lumps are referenced by number, and patched
// into the rectangular texture space using origin
// and possibly other attributes.
//
class MapPatch {
  static sizeOf = 5 * 2

  originX: number
  originY: number
  patch: number
  stepDir: number
  colorMap: number

  constructor(buffer: ArrayBuffer) {
    const int16 = new Int16Array(buffer, 0, 5)
    this.originX = int16[0]
    this.originY = int16[1]
    this.patch = int16[2]
    this.stepDir = int16[3]
    this.colorMap = int16[4]
  }
}

//
// Texture definition.
// A DOOM wall texture is a list of patches
// which are to be combined in a predefined order.
//
class MapTexture {
  static sizeOf = 8 + 4 + 2 + 2 + 4 + 2

  name: string
  masked: boolean
  width: number
  height: number
  patchCount: number

  constructor(private buffer: ArrayBuffer) {
    this.name = tostring(buffer, 0, 8)
    const int16 = new Int16Array(buffer, 8, 7)
    this.masked = int16[0] !== 0 && int16[1] !== 0
    this.width = int16[2]
    this.height = int16[3]
    // void **columndirectory; // OBSOLETE
    this.patchCount = int16[6]
  }

  *patches(): Generator<MapPatch, void> {
    for (let i = 0; i < this.patchCount; ++i) {
      yield new MapPatch(
        this.buffer.slice(MapTexture.sizeOf + i * MapPatch.sizeOf),
      )
    }
  }

}

// A single patch from a texture definition,
//  basically a rectangular area within
//  the texture rectangle.
interface TexPatch {
  // Block origin (allways UL),
  // which has allready accounted
  // for the internal origin of the patch.
  originX: number
  originY: number
  patch: number
}

// A maptexturedef_t describes a rectangular texture,
//  which is composed of one or more mappatch_t structures
//  that arrange graphic patches.
interface Texture {
  // Keep name for switch changing, etc.
  name: string
  width: number
  height: number

  // All the patches[patchcount]
  //  are drawn back to front into the cached texture.
  patchCount: number
  patches: TexPatch[]
}

export class Data {
  private firstFlat = 0
  private lastFlat = 0
  private numFlats = 0

  private firstPatch = 0
  private lastPatch = 0
  private numPatchs = 0

  private firstSpriteLump = 0
  private lastSpriteLump = 0
  private numSpriteLumps = 0

  private numTextures = 0
  private textures: Texture[] = []

  private textureWidthMask = new Array<number>()
  // needed for texture pegging
  private textureHeight = new Array<number>()
  private textureCompositeSize = new Array<number>()
  private textureColumnLump = new Array<number[]>()
  private textureColumnOfs = new Array<number[]>()
  private textureComposite = new Array<number[]>()

  // for global animation
  private flatTranslation: number[] = []
  private textureTranslation: number[] = []

  // needed for pre rendering
  private spriteWidth = new Array<number>()
  private spriteOffset = new Array<number>()
  private spriteTopOffset = new Array<number>()

  private colorMaps: ArrayBuffer | null = null

  constructor(private wad: Wad) { }

  //
  // R_GenerateLookup
  //
  private async regenerateLookup(textNum: number): Promise<void> {
    const texture = this.textures[textNum]

    // Composited texture not created yet.
    this.textureComposite[textNum] = []

    this.textureCompositeSize[textNum] = 0
    const colLump: number[] = []
    this.textureColumnLump[textNum] = colLump
    const colOfs: number[] = []
    this.textureColumnOfs[textNum] = colOfs

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
        colLump[x] - 1
        colOfs[x] = this.textureCompositeSize[textNum]

        if (this.textureCompositeSize[textNum] > 0x10000 - texture.height) {
          throw `R_GenerateLookup: texture ${textNum} is >64k`
        }

        this.textureCompositeSize[textNum] += texture.height
      }
    }
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
      maxOff2 = 0
      numTextures2 = 0
    }

    this.numTextures = numTextures1 + numTextures2

    this.textures = new Array(this.numTextures)
    this.textureColumnLump = new Array(this.numTextures)
    this.textureColumnOfs = new Array(this.numTextures)
    this.textureComposite = new Array(this.numTextures)
    this.textureCompositeSize = new Array(this.numTextures)
    this.textureWidthMask = new Array(this.numTextures)
    this.textureHeight = new Array(this.numTextures)

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

      texture = {
        width: mTexture.width,
        height: mTexture.height,
        patchCount: mTexture.patchCount,
        name: mTexture.name,
        patches: [],
      }
      this.textures[i] = texture

      for (mPatch of mTexture.patches()) {
        patch = {
          originX: mPatch.originX,
          originY: mPatch.originY,
          patch: patchLoopkup[mPatch.patch],
        }
        texture.patches.push(patch)

        if (patch.patch === -1) {
          throw `R_InitTextures: Missing patch in texture ${texture.name}`
        }
      }

      let j = 1
      while (j * 2 <= texture.width) {
        j <<= 1
      }
      this.textureWidthMask[i] = j - 1
      this.textureHeight[i] = texture.height << 16
    }

    // Precalculate whatever possible.
    for (let i = 0; i < this.numTextures; ++i) {
      await this.regenerateLookup(i)
    }

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
    this.flatTranslation = new Array(this.numFlats + 1)

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

    this.spriteWidth = new Array(this.numSpriteLumps)
    this.spriteOffset = new Array(this.numSpriteLumps)
    this.spriteTopOffset = new Array(this.numSpriteLumps)

    let patch: Patch
    for (let i = 0; i < this.numSpriteLumps; ++i) {
      patch = new Patch(await this.wad.cacheLumpNum(this.firstSpriteLump + i))

      this.spriteWidth[i] = patch.width << 16
      this.spriteOffset[i] = patch.leftOffset << 16
      this.spriteTopOffset[i] = patch.topOffset << 16
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
    this.colorMaps = await this.wad.readLump(lump)
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

}
