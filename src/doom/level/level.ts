import { LumpType } from '../wad/lump'

const levelRegExp = /^map(\d\d)|e(\d)m(\d)$/i

export class Level {
  static type: LumpType = 'level'
  static isType(buffer: ArrayBuffer, name: string): boolean {
    return buffer.byteLength === 0 &&
      levelRegExp.test(name)
  }

  episode = 1
  map = 1

  constructor(_: ArrayBuffer, name: string) {
    const matches = name.match(levelRegExp)
    if (matches === null) {
      throw 'Invalid lump name for map'
    }

    const [ , m1, e2, m2 ] = matches

    if (m1 !== undefined) {
      this.map = parseInt(m1, 10)
    } else if (e2 !== undefined && m2 !== undefined) {
      this.episode = parseInt(e2, 10)
      this.map = parseInt(m2, 10)
    }
  }
}
