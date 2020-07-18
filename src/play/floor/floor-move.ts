import { Action, Thinker } from '../../doom/think'
import { FRACUNIT } from '../../misc/fixed'
import { Floor } from '../floor'
import { FloorType } from './floor-type'
import { Sector } from '../../rendering/sector'

export const FLOOR_SPEED = FRACUNIT

export class FloorMove extends Thinker<Floor, [FloorMove]> {
  static sizeOf = 42

  type: FloorType

  crush = false

  sector: Sector

  direction: -1 | 0 | 1 = 0
  newSpecial = 0
  texture = 0
  floorDestHeight = 0
  speed = FLOOR_SPEED

  constructor(func: Action<Floor, [FloorMove]>, floor: Floor,
    type: FloorType, sector: Sector)
  constructor(func: Action<Floor, [FloorMove]>, floor: Floor,
    buffer: ArrayBuffer)
  constructor(
    func: Action<Floor, [FloorMove]>, floor: Floor,
    type: FloorType | ArrayBuffer,
    sector?: Sector,
  ) {
    super(func, floor)

    if (typeof type === 'number') {
      if (sector === undefined) {
        throw 'sector = undefined'
      }
      this.type = type
      this.sector = sector
    } else {
      const int32a = new Int32Array(type, 0, 8)
      const int16 = new Int32Array(type, 32, 1)
      const int32b = new Int32Array(type, 34, 2)

      this.type = int32a[3]
      this.crush = !!int32a[4]

      const sectorNum = int32a[5]
      this.sector = floor.sectors[sectorNum]
      this.sector.specialData = this

      this.direction = int32a[6] as -1 | 0 | 1
      this.newSpecial = int32a[7]

      this.texture = int16[0]

      this.floorDestHeight = int32b[0]
      this.speed = int32b[1]
    }
  }

  archive(): ArrayBuffer {
    const sector = this.handler.sectors.indexOf(this.sector)

    const buffer = new ArrayBuffer(FloorMove.sizeOf)
    const int32a = new Int32Array(buffer, 0, 8)
    const int16 = new Int32Array(buffer, 32, 1)
    const int32b = new Int32Array(buffer, 34, 2)

    int32a[0] = int32a[1] = int32a[2] = 0
    int32a[3] = this.type
    int32a[4] = this.crush ? 1 : 0
    int32a[5] = sector
    int32a[6] = this.direction
    int32a[7] = this.newSpecial

    int16[0] = this.texture

    int32b[0] = this.floorDestHeight
    int32b[1] = this.speed

    return buffer
  }
}
