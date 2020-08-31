import { Action, Thinker } from '../../doom/think'
import { DoorType } from './door-type'
import { Doors } from '../doors'
import { FRACUNIT } from '../../misc/fixed'
import { Sector } from '../../rendering/defs/sector'

export const DOOR_SPEED = FRACUNIT * 2
export const DOOR_WAIT = 150

export class Door extends Thinker<Doors, [Door]> {
  static sizeOf = 40

  type: DoorType = 0

  sector: Sector

  topHeight = 0
  speed = DOOR_SPEED

  // 1 = up, 0 = waiting at top, -1 = down
  direction: -1 | 0 | 1 | 2 = 0

  // tics to wait at the top
  topWait = DOOR_WAIT

  // (keep in case a door going down is reset)
  // when it reaches 0, start going down
  topCountDown = 0

  constructor(func: Action<Doors, [Door]>, doors: Doors,
    type: DoorType, sector: Sector)
  constructor(func: Action<Doors, [Door]>, doors: Doors,
    buffer: ArrayBuffer)
  constructor(
    func: Action<Doors, [Door]>, doors: Doors,
    type: DoorType | ArrayBuffer,
    sector?: Sector,
  ) {
    super(func, doors)

    if (typeof type === 'number') {
      if (sector === undefined) {
        throw 'sector = undefined'
      }
      this.type = type
      this.sector = sector
    } else {
      const int32 = new Int32Array(type, 0, Door.sizeOf / Int32Array.BYTES_PER_ELEMENT)
      let int32Ptr = 0
      int32Ptr += 3

      this.type = int32[int32Ptr++]

      const sectorNum = int32[int32Ptr++]
      this.sector = doors.level.sectors[sectorNum]
      this.sector.specialData = this

      this.topHeight = int32[int32Ptr++]
      this.speed = int32[int32Ptr++]
      this.direction = int32[int32Ptr++] as -1 | 0 | 1
      this.topWait = int32[int32Ptr++]
      this.topCountDown = int32[int32Ptr++]
    }
  }

  archive(): ArrayBuffer {
    const sector = this.handler.level.sectors.indexOf(this.sector)

    return new Int32Array([
      0, 0, 0,
      this.type,
      sector,
      this.topHeight,
      this.speed,
      this.direction,
      this.topWait,
      this.topCountDown,
    ]).buffer
  }
}
