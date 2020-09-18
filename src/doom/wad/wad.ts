import { LumpInfo } from './types'
import { tostring } from '../utils/c'

export class Wad {
  identification: string

  lumps: LumpInfo[]

  constructor(handle: ArrayBuffer) {
    this.identification = tostring(handle, 0, 4)

    if (this.identification !== 'IWAD') {
      // Homebrew levels?
      if (this.identification !== 'PWAD') {
        throw 'Wad file doesn\'t have IWAD or PWAD id'
      }
    }

    const headerReader = new Int32Array(handle, 4, 2)
    const numLumps = headerReader[0]
    const infoTableOfs = headerReader[1]

    const sizeOfFileLump = 4 + 4 + 8
    const length = numLumps * sizeOfFileLump

    const lumps: LumpInfo[] = []
    this.lumps = lumps
    let fileReader: Int32Array
    let filePos: number
    let size: number
    let name: string
    let buffer: ArrayBuffer

    const toc = handle.slice(infoTableOfs, infoTableOfs + length)

    for (let filePtr = 0;
      filePtr < length;
      filePtr += sizeOfFileLump
    ) {
      fileReader = new Int32Array(toc, filePtr, 2);

      [ filePos, size ] = fileReader
      name = tostring(toc, filePtr + 8, 8)

      buffer = handle.slice(filePos, filePos + size)

      if (buffer.byteLength < size) {
        throw `W_ReadLump: only read ${buffer.byteLength} of ${size} on lump ${name}`
      }

      lumps.push({ name, size, buffer })
    }
  }
}
