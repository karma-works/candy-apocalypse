import { LumpType } from '../wad/lump'
import { TexPatch } from '../rendering/data/tex-patch'
import { Texture } from '../rendering/data/texture'
import { tostring } from '../utils/c'

export class TextureArray extends Array<MapTexture> {
  static type: LumpType = 'textures'
  static isType(_: ArrayBuffer, name: string): boolean {
    return /TEXTURE\d/.test(name)
  }
  static get [Symbol.species](): ArrayConstructor {
    return Array
  }

  constructor(buffer = new ArrayBuffer(0)) {
    const [ num ] = new Int32Array(buffer, 0, 1)
    const maxOff = buffer.byteLength

    super(num)

    const directory = new Int32Array(buffer, 4, num)
    let offset: number
    for (let i = 0, directoryPtr = 0; i < num; ++i, ++directoryPtr) {
      offset = directory[directoryPtr]

      if (offset > maxOff) {
        throw 'R_InitTextures: bad texture directory'
      }

      this[i] = new MapTexture(buffer.slice(offset))
    }
  }
}


//
// Texture definition.
// A DOOM wall texture is a list of patches
// which are to be combined in a predefined order.
//
class MapTexture {
  static sizeOf = 8 + 4 + 2 + 2 + 4 + 2;
  name: string;
  masked: boolean;
  width: number;
  height: number;
  patchCount: number;
  patches: MapPatch[]
  constructor(private buffer: ArrayBuffer) {
    this.name = tostring(buffer, 0, 8)
    const int16 = new Int16Array(buffer, 8, 7)
    this.masked = int16[0] !== 0 && int16[1] !== 0
    this.width = int16[2]
    this.height = int16[3]
    // void **columndirectory; // OBSOLETE
    this.patchCount = int16[6]
    this.patches = new Array(this.patchCount)

    for (let i = 0; i < this.patchCount; ++i) {
      this.patches[i] = new MapPatch(this.buffer.slice(MapTexture.sizeOf + i * MapPatch.sizeOf))
    }
  }

  getTexture(patchLookup: number[]): Texture {
    const t = new Texture(this.name, this.width, this.height, this.patchCount)

    t.patches = this.patches.map(p => p.getTexPatch(patchLookup))

    if (t.patches.some(({ patch }) => patch === -1)) {
      throw `R_InitTextures: Missing patch in texture ${this.name}`
    }

    return t
  }
}

//
// Texture definition.
// Each texture is composed of one or more patches,
// with patches being lumps stored in the WAD.
// The lumps are referenced by number, and patched
// into the rectangular texture space using origin
// and possibly other attributes.
//
class MapPatch {
  static sizeOf = 5 * 2;
  originX: number;
  originY: number;
  patch: number;
  stepDir: number;
  colorMap: number;
  constructor(buffer: ArrayBuffer) {
    const int16 = new Int16Array(buffer, 0, 5)
    this.originX = int16[0]
    this.originY = int16[1]
    this.patch = int16[2]
    this.stepDir = int16[3]
    this.colorMap = int16[4]
  }

  getTexPatch(patchLookup: number[]): TexPatch {
    return new TexPatch(this.originX, this.originY, patchLookup[this.patch])
  }
}
