import { Action, Thinker } from '../../doom/think'
import { Sector, isSector } from '../../rendering/sector'
import { Lights } from '../lights'

export class Glow extends Thinker<Lights, [Glow]> {
  static sizeOf = 28

  sector: Sector

  minLight = 0
  maxLight = 0
  direction = 0

  constructor(func: Action<Lights, [Glow]>, lights: Lights,
    sector: Sector)
  constructor(func: Action<Lights, [Glow]>, lights: Lights,
    buffer: ArrayBuffer)
  constructor(
    func: Action<Lights, [Glow]>, lights: Lights,
    sector: Sector | ArrayBuffer,
  ) {
    super(func, lights)

    if (isSector(sector)) {
      this.sector = sector
      this.minLight = sector.findMinSurroundingLight()
      this.maxLight = sector.lightLevel
      this.direction = -1
    } else {
      const int32 = new Int32Array(sector, 0, Glow.sizeOf / Int32Array.BYTES_PER_ELEMENT)
      let int32Ptr = 0
      int32Ptr += 3

      const sectorNum = int32[int32Ptr++]
      this.sector = lights.sectors[sectorNum]
      this.minLight = int32[int32Ptr++]
      this.maxLight = int32[int32Ptr++]
      this.direction = int32[int32Ptr++]
    }
  }

  archive(): ArrayBuffer {
    const sector = this.handler.sectors.indexOf(this.sector)

    return new Int32Array([
      0, 0, 0,
      sector,
      this.minLight,
      this.maxLight,
      this.direction,
    ]).buffer
  }
}
