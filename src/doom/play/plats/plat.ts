import { Action, Thinker } from '../../doom/think'
import { FRACUNIT } from '../../misc/fixed'
import { PlatStatus } from './plat-status'
import { PlatType } from './plat-type'
import { Plats } from '../plats'
import { Sector } from '../../rendering/defs/sector'

export const PLAT_WAIT = 3
export const PLAT_SPEED = FRACUNIT

export class Plat extends Thinker<Plats, [Plat]> {
  static sizeOf = 56

  sector: Sector

  speed = PLAT_SPEED
  low = 0
  high = 0
  wait = PLAT_WAIT
  count = 0
  status: PlatStatus = 0
  oldStatus: PlatStatus = 0
  crush = false
  tag = 0

  type: PlatType = 0

  constructor(func: Action<Plats, [Plat]>, plats: Plats,
    type: PlatType, sector: Sector)
  constructor(func: Action<Plats, [Plat]>, plats: Plats,
    buffer: ArrayBuffer)
  constructor(
    func: Action<Plats, [Plat]>, plats: Plats,
    type: PlatType | ArrayBuffer,
    sector?: Sector,
  ) {
    super(func, plats)

    if (typeof type === 'number') {
      if (sector === undefined) {
        throw 'sector = undefined'
      }
      this.type = type
      this.sector = sector
    } else {
      const int32 = new Int32Array(type, 0, Plat.sizeOf / Int32Array.BYTES_PER_ELEMENT)
      let int32Ptr = 0
      int32Ptr += 3

      const sector = int32[int32Ptr++]
      this.sector = plats.level.sectors[sector]
      this.sector.specialData = this

      this.speed = int32[int32Ptr++]
      this.low = int32[int32Ptr++]
      this.high = int32[int32Ptr++]
      this.wait = int32[int32Ptr++]
      this.count = int32[int32Ptr++]
      this.status = int32[int32Ptr++]
      this.oldStatus = int32[int32Ptr++]
      this.crush = !!int32[int32Ptr++]
      this.tag = int32[int32Ptr++]
      this.type = int32[int32Ptr++]
    }
  }

  archive(): ArrayBuffer {
    const sector = this.handler.level.sectors.indexOf(this.sector)

    return new Int32Array([
      0, 0, 0,
      sector,
      this.speed,
      this.low,
      this.high,
      this.wait,
      this.count,
      this.status,
      this.oldStatus,
      this.crush ? 1 : 0,
      this.tag,
      this.type,
    ]).buffer
  }
}
