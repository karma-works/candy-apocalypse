import { Column } from '../rendering/defs/column'
import { FRACBITS } from '../misc/fixed'
import { LumpReader } from '../wad/lump-reader'
import { PNameArray } from './pname-array'
import { Patch } from '../rendering/defs/patch'
import { Post } from '../rendering/defs/post'
import { TexPatch } from '../rendering/data/tex-patch'
import { Texture } from '../rendering/data/texture'
import { TextureArray } from './texture-array'

interface TextureLump {
  name: string
  widthMask: number
  height: number
  patch: Patch
}

export class Textures extends Array<TextureLump> {
  static get [Symbol.species](): ArrayConstructor {
    return Array
  }

  private translation = new Array<number>()

  constructor(lumpReader?: LumpReader) {
    super()

    if (!lumpReader) {
      return
    }

    const names = lumpReader.cacheLumpName('PNAMES', PNameArray)
    const patchLookup = names.getLookup(lumpReader)

    const mapTextures = [
      ...lumpReader.cacheLumpName('TEXTURE1', TextureArray),
    ]
    if (lumpReader.checkNumForName('TEXTURE2') !== -1) {
      mapTextures.push(...lumpReader.cacheLumpName('TEXTURE2', TextureArray))
    }

    this.length = mapTextures.length

    let texture: Texture
    let j: number
    for (let i = 0; i < this.length; ++i) {
      texture = mapTextures[i].getTexture(patchLookup)
      j = 1
      while (j * 2 <= texture.width) {
        j <<= 1
      }
      this[i] = {
        name: texture.name,
        height: texture.height << FRACBITS,
        widthMask: j - 1,
        patch: this.generateComposite(texture, lumpReader),
      }
    }

    // Create translation table for global animation.
    this.translation = Array.from({ length: this.length + 1 }, (_, i) => i)
  }

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
  private generateComposite(texture: Texture, lumpReader: LumpReader): Patch {
    // this.textureCompositeSize[textNum] = 0
    const columns = Array.from({ length: texture.width },
      () => new Column([ new Post(texture.height) ]))
    const rawColumns = Array.from({ length: texture.width },
      () => new Array<Column>())

    let patch: TexPatch
    let realPatch: Patch
    let x: number, x1: number, x2: number
    let patchCol: Column
    for (let i = 0; i < texture.patchCount; ++i) {
      patch = texture.patches[i]
      realPatch = lumpReader.cacheLumpNum(patch.patch, Patch)
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
        patchCol = realPatch.columns[x - x1]

        this.drawColumnInCache(
          patchCol,
          columns[x],
          patch.originY,
          texture.height,
        )

        rawColumns[x].push(patchCol)
      }
    }

    rawColumns.forEach((cc, i) => {
      if (cc.length === 1) {
        columns[i] = cc[0]
      }
    })

    const p = new Patch(columns)
    p.width = texture.width
    p.height = texture.height

    return p
  }


  //
  // R_CheckTextureNumForName
  // Check whether texture is available.
  // Filter out NoTexture indicator.
  //
  checkNumForName(name: string): number {
    // "NoTexture" marker.
    if (name.startsWith('-')) {
      return 0
    }

    const i = this.findIndex(l =>
      l.name.toUpperCase() === name.toUpperCase())

    return i
  }

  //
  // R_TextureNumForName
  // Calls R_CheckTextureNumForName,
  //  aborts with error message.
  //
  numForName(name: string): number {
    const i = this.checkNumForName(name)

    if (i === -1) {
      throw `R_TextureNumForName: ${name} not found`
    }
    return i
  }

  getNum(num: number): number {
    return this.translation[num]
  }
  getColumn(num: number, col: number): Column {
    const texture = this[this.translation[num]]
    col &= texture.widthMask
    return texture.patch.columns[col]
  }
  getHeight(num: number): number {
    return this[this.translation[num]].height
  }
  translate(src: number, dest: number): void {
    this.translation[src] = dest
  }
}
