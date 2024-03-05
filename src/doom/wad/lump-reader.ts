import { LumpCtor, LumpType, guessLumpType } from './lump'
import { LumpInfo } from './types'
import { Wad } from './wad'
import { fs } from '../system/fs'

function extractFileBase(path: string): string {
  const idx = path.lastIndexOf('/')
  const dest = path.substr(idx + 1).toUpperCase()

  // if (dest.length > 8) {
  //   throw `Filename base of ${path} >8 chars`
  // }

  const dot = dest.lastIndexOf('.')
  if (dot > 0) {
    return dest.substr(0, dot)
  }

  return dest
}

export class LumpReader {
  fileNames: string[] = []
  // Location of each lump on disk.
  lumpInfo: LumpInfo[] = []
  numLumps = 0

  private lumpCache: unknown[] = []

  //
  // W_AddFile
  // All files are optional, but at least one file must be
  //  found (PWAD, if all required lumps are present).
  // Files with a .wad extension are wadlink files
  //  with multiple lumps.
  // Other files are single lumps with the base filename
  //  for the lump name.
  //
  // If filename starts with a tilde, the file is handled
  //  specially to allow map reloads.
  // But: the reload feature is a fragile hack...
  private async addFile(fileName: string): Promise<void> {
    let lumps: LumpInfo[] = []

    // open the file and add to directory
    const handle = await fs.open(fileName)
    if (handle === undefined) {
      console.log(` couldn't open ${fileName}`)
      return
    }
    console.log(` adding ${fileName}`)
    this.fileNames.push(fileName)

    const startLump = this.numLumps

    if (fileName.substr(fileName.length - 3).toLowerCase() !== 'wad') {
      lumps[0] = {
        buffer: handle,
        size: handle.byteLength,
        name: extractFileBase(fileName),
      }
    } else {
      const wad = new Wad(handle)
      lumps = wad.lumps
    }

    this.numLumps += lumps.length
    this.lumpInfo.length = this.numLumps

    for (let i = startLump, fi = 0; i < this.numLumps; ++i, ++fi) {
      if (!this.lumpInfo[i]) {
        this.lumpInfo[i] = { name: '', size: 0, buffer: new ArrayBuffer(0) }
      }
      this.lumpInfo[i].buffer = lumps[fi].buffer
      this.lumpInfo[i].size = lumps[fi].size
      this.lumpInfo[i].name = lumps[fi].name
    }
  }

  //
  // W_InitMultipleFiles
  // Pass a null terminated list of files to use.
  // All files are optional, but at least one file
  //  must be found.
  // Files with a .wad extension are idlink files
  //  with multiple lumps.
  // Other files are single lumps with the base filename
  //  for the lump name.
  // Lump names can appear multiple times.
  // The name searcher looks backwards, so a later file
  //  does override all earlier ones.
  //
  async initMultipleFiles(fileNames: string[]): Promise<void> {
    // open all the files, load headers, and count lumps
    this.numLumps = 0
    this.lumpInfo = []

    // file order may be important !
    for (const f of fileNames) {
      await this.addFile(f)
    }

    if (!this.numLumps) {
      throw 'W_InitFiles: no files found'
    }

    this.lumpCache = new Array(this.numLumps)
  }

  //
  // W_CheckNumForName
  // Returns -1 if name not found.
  //
  checkNumForName(name: string): number {
    // case insensitive
    name = name.toUpperCase()

    // scan backwards so patch lump files take precedence
    for (let i = this.numLumps - 1; i >= 0; --i) {
      if (this.lumpInfo[i].name === name) {
        return i
      }
    }

    // TFB. Not found.
    return -1
  }

  //
  // W_GetNumForName
  // Calls W_CheckNumForName, but bombs out if not found.
  //
  getNumForName(name: string): number {
    const i = this.checkNumForName(name)

    if (i === -1) {
      throw `W_GetNumForName: ${name} not found!`
    }
    return i
  }

  //
  // W_LumpLength
  // Returns the buffer size needed to load the given lump.
  //
  lumpLength(lump: number): number {
    if (lump >= this.numLumps) {
      throw `W_LumpLength: ${lump} >= numlumps`
    }

    return this.lumpInfo[lump].size
  }

  //
  // W_ReadLump
  // Loads the lump into the given buffer,
  //  which must be >= W_LumpLength().
  //
  readLump(lump: number): ArrayBuffer {
    if (lump >= this.numLumps) {
      throw `W_ReadLump: ${lump} >= numlumps`
    }

    const l = this.lumpInfo[lump]

    return l.buffer
  }

  //
  // W_CacheLumpNum
  //
  cacheLumpNum(lump: number): ArrayBuffer
  cacheLumpNum<T>(lump: number, klass?: LumpCtor<T>, cache?: boolean): T
  cacheLumpNum<T>(lump: number, klass?: LumpCtor<T>, cache: boolean = true): T | ArrayBuffer {
    if (lump >= this.numLumps) {
      throw `W_CacheLumpNum: ${lump} >= numlumps`
    }

    const { buffer, name } = this.lumpInfo[lump]

    if (klass) {
      if (!this.lumpCache[lump] || !cache) {
        this.lumpCache[lump] = new klass(buffer, name, lump)
      }
      return this.lumpCache[lump] as T
    } else {
      return buffer
    }
  }

  //
  // W_CacheLumpName
  //
  cacheLumpName(name: string): ArrayBuffer
  cacheLumpName<T>(name: string, klass?: LumpCtor<T>, cache?: boolean): T
  cacheLumpName<T>(name: string, klass?: LumpCtor<T>, cache: boolean = true): T | ArrayBuffer {
    return this.cacheLumpNum(this.getNumForName(name), klass, cache)
  }

  listByType(t: LumpType) {
    return this.lumpInfo
      .filter(i => guessLumpType(i.buffer, i.name) === t)
  }
}
