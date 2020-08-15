import { LumpType } from '../wad/lump'

export class ThingArray extends Array<MapThing> {
  static type: LumpType = 'things'
  static isType(_: ArrayBuffer, name: string): boolean {
    return name === 'THINGS'
  }
  static get [Symbol.species](): ArrayConstructor {
    return Array
  }

  constructor(buffer: ArrayBuffer) {
    const numThings = buffer.byteLength / MapThing.sizeOf
    if (numThings !== Math.floor(numThings)) {
      throw 'invalid length of map things'
    }

    super(numThings)

    for (let i = 0, mtPtr = 0;
      i < numThings; ++i,
      mtPtr += MapThing.sizeOf
    ) {
      this[i] = new MapThing(buffer.slice(mtPtr))
    }
  }
}

// Thing definition, position, orientation and type,
// plus skill/visibility flags and attributes.
export class MapThing {
  static sizeOf = Int16Array.BYTES_PER_ELEMENT * 5

  x = 0
  y = 0
  angle = 0
  type = 0
  options = 0

  constructor(buffer?: ArrayBuffer) {
    if (buffer) {
      this.unArchive(buffer)
    }
  }

  unArchive(buffer: ArrayBuffer): void {
    const int16 = new Int16Array(buffer, 0, 5)

    this.x = int16[0]
    this.y = int16[1]
    this.angle = int16[2]
    this.type = int16[3]
    this.options = int16[4]
  }

  archive(): ArrayBuffer {
    return new Int16Array([
      this.x,
      this.y,
      this.angle,
      this.type,
      this.options,
    ]).buffer
  }
}
