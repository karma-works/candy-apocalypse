import { FileLump, LumpInfo, WadInfo } from './types'
import { fs } from '../system/fs'
import { tostring } from '../utils/c'

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

export class Wad {
  // Location of each lump on disk.
  lumpInfo: LumpInfo[] = []
  numLumps = 0

  private lumpRaw: ArrayBuffer[] = []
  private lumpCache: unknown[] = []

  private reloadName = ''

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
    const header: WadInfo = { identification: '', numLumps: 0, infoTableOfs: 0 }
    let fileInfo: FileLump[] = []
    const singleInfo: FileLump = { filePos: 0, size: 0, name: '' }

    // open the file and add to directory

    // handle reload indicator.
    if (fileName[0] === '~') {
      fileName = fileName.substr(1)
      this.reloadName = fileName
    }

    const handle = await fs.open(fileName)
    if (handle === undefined) {
      console.log(` couldn't open ${fileName}`)
      return
    }
    console.log(` adding ${fileName}`)

    const startLump = this.numLumps

    if (fileName.substr(fileName.length - 3).toLowerCase() !== 'wad') {
      fileInfo = [ singleInfo ]
      singleInfo.filePos = 0
      singleInfo.size = handle.byteLength
      singleInfo.name = extractFileBase(fileName)
      this.numLumps++
    } else {
      // WAD file
      header.identification =
          String.fromCharCode(...new Int8Array(handle, 0, 4))

      if (header.identification !== 'IWAD') {
        // Homebrew levels?
        if (header.identification !== 'PWAD') {
          throw `Wad file ${fileName} doesn't have IWAD or PWAD id`
        }
      }

      const headerReader = new Int32Array(handle, 4, 2)
      header.numLumps = headerReader[0]
      header.infoTableOfs = headerReader[1]

      const sizeOfFileLump = 4 + 4 + 8
      const length = header.numLumps * sizeOfFileLump

      let fileReader: Int32Array
      let name: string
      for (let filePtr = header.infoTableOfs;
        filePtr < header.infoTableOfs + length;
        filePtr += sizeOfFileLump
      ) {
        fileReader = new Int32Array(handle, filePtr, 2)

        name = tostring(handle, filePtr + 8, 8)

        fileInfo.push({
          filePos: fileReader[0],
          size: fileReader[1],
          name,
        })
      }

      this.numLumps += header.numLumps
    }

    this.lumpInfo.length = this.numLumps

    const storeHandle = this.reloadName ? null : handle

    for (let i = startLump, fi = 0; i < this.numLumps; ++i, ++fi) {
      if (!this.lumpInfo[i]) {
        this.lumpInfo[i] = { name: '', handle: null, position: 0, size: 0 }
      }
      this.lumpInfo[i].handle = storeHandle
      this.lumpInfo[i].position = fileInfo[fi].filePos
      this.lumpInfo[i].size = fileInfo[fi].size
      this.lumpInfo[i].name = fileInfo[fi].name
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
    await Promise.all(fileNames.map(f => this.addFile(f)))

    if (!this.numLumps) {
      throw 'W_InitFiles: no files found'
    }

    this.lumpRaw = new Array(this.numLumps)
    this.lumpCache = new Array(this.numLumps)
  }

  //
  // W_InitFile
  // Just initialize from a single file.
  //
  async initFile(fileName: string): Promise<void> {
    return this.initMultipleFiles([ fileName ])
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

    let handle: ArrayBuffer
    if (l.handle === null) {
      throw `${this.reloadName} not loaded`
    } else {
      handle = l.handle
    }

    const c = handle.slice(l.position, l.position + l.size)

    if (c.byteLength < l.size) {
      throw `W_ReadLump: only read ${c.byteLength} of ${l.size} on lump ${lump}`
    }

    return c
  }

  //
  // W_CacheLumpNum
  //
  cacheLumpNum(lump: number): ArrayBuffer
  cacheLumpNum<T>(lump: number, klass?: { new(b: ArrayBuffer): T; }): T
  cacheLumpNum<T>(lump: number, klass?: { new(b: ArrayBuffer): T; }): T | ArrayBuffer {
    if (lump >= this.numLumps) {
      throw `W_CacheLumpNum: ${lump} >= numlumps`
    }
    if (!this.lumpRaw[lump]) {
      // read the lump in
      this.lumpRaw[lump] = this.readLump(lump)
    }

    if (klass) {
      if (!this.lumpCache[lump]) {
        this.lumpCache[lump] = new klass(this.readLump(lump))
      }
      return this.lumpCache[lump] as T
    } else {
      return this.lumpRaw[lump]
    }
  }

  //
  // W_CacheLumpName
  //
  cacheLumpName(name: string): ArrayBuffer
  cacheLumpName<T>(name: string, klass?: { new(b: ArrayBuffer): T; }): T
  cacheLumpName<T>(name: string, klass?: { new(b: ArrayBuffer): T; }): T | ArrayBuffer {
    return this.cacheLumpNum(this.getNumForName(name), klass)
  }
}
