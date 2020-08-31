import { Action, Thinker } from '../../doom/think'
import { CeilingType } from './ceiling-type'
import { Ceilings } from '../ceilings'
import { FRACUNIT } from '../../misc/fixed'
import { Sector } from '../../rendering/defs/sector'

export const CEIL_SPEED = FRACUNIT
export const MAX_CEILINGS = 30

export class Ceiling extends Thinker<Ceilings, [Ceiling]> {
  static sizeOf = 48

  type: CeilingType = 0

  sector: Sector

  bottomHeight = 0
  topHeight = 0
  speed = CEIL_SPEED
  crush = false

  // 1 = up, 0 = waiting, -1 = down
  direction: -1 | 0 | 1 = 0

  // ID
  tag = 0
  oldDirection: -1 | 0 | 1 = 0

  constructor(func: Action<Ceilings, [Ceiling]>, ceilings: Ceilings,
    type: CeilingType, sector: Sector)
  constructor(func: Action<Ceilings, [Ceiling]>, ceilings: Ceilings,
    buffer: ArrayBuffer)
  constructor(
    func: Action<Ceilings, [Ceiling]>, ceilings: Ceilings,
    type: CeilingType | ArrayBuffer,
    sector?: Sector,
  ) {
    super(func, ceilings)

    if (typeof type === 'number') {
      if (sector === undefined) {
        throw 'sector = undefined'
      }
      this.type = type
      this.sector = sector
    } else {
      const int32 = new Int32Array(type, 0, Ceiling.sizeOf / Int32Array.BYTES_PER_ELEMENT)
      let int32Ptr = 0
      int32Ptr += 3

      this.type = int32[int32Ptr++]
      const sector = int32[int32Ptr++]
      this.sector = ceilings.level.sectors[sector]
      this.sector.specialData = this
      this.bottomHeight = int32[int32Ptr++]
      this.topHeight = int32[int32Ptr++]
      this.speed = int32[int32Ptr++]
      this.crush = !!int32[int32Ptr++]
      this.direction = int32[int32Ptr++] as -1 | 0 | 1
      this.tag = int32[int32Ptr++]
      this.oldDirection = int32[int32Ptr++] as -1 | 0 | 1
    }
  }

  archive(): ArrayBuffer {
    const sector = this.handler.level.sectors.indexOf(this.sector)

    return new Int32Array([
      0, 0, 0,
      this.type,
      sector,
      this.bottomHeight,
      this.topHeight,
      this.speed,
      this.crush ? 1 : 0,
      this.direction,
      this.tag,
      this.oldDirection,
    ]).buffer
  }
}
