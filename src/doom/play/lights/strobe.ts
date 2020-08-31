import { Action, Thinker } from '../../doom/think'
import { Sector, isSector } from '../../rendering/defs/sector'
import { Lights } from '../lights'
import { random } from '../../misc/random'

export class Strobe extends Thinker<Lights, [Strobe]> {
  static sizeOf = 36

  sector: Sector

  count = 0
  minLight = 0
  maxLight = 0
  darkTime = 0
  brightTime = 0

  constructor(func: Action<Lights, [Strobe]>, lights: Lights,
    sector: Sector,
    darkTime: number, brightTime: number, inSync: number)
  constructor(func: Action<Lights, [Strobe]>, lights: Lights,
    buffer: ArrayBuffer)
  constructor(
    func: Action<Lights, [Strobe]>, lights: Lights,
    sector: Sector | ArrayBuffer,
    darkTime = 0,
    brightTime = 0,
    inSync = 0,
  ) {
    super(func, lights)

    if (isSector(sector)) {
      this.sector = sector

      this.maxLight = sector.lightLevel
      this.minLight = sector.findMinSurroundingLight()
      this.darkTime = darkTime
      this.brightTime = brightTime

      if (!inSync) {
        this.count = (random.pRandom() & 7) + 1
      } else {
        this.count = 1
      }
    } else {
      const int32 = new Int32Array(sector, 0, Strobe.sizeOf / Int32Array.BYTES_PER_ELEMENT)
      let int32Ptr = 0
      int32Ptr += 3

      const sectorNum = int32[int32Ptr++]
      this.sector = lights.level.sectors[sectorNum]
      this.count = int32[int32Ptr++]
      this.minLight = int32[int32Ptr++]
      this.maxLight = int32[int32Ptr++]
      this.darkTime = int32[int32Ptr++]
      this.brightTime = int32[int32Ptr++]
    }
  }

  archive(): ArrayBuffer {
    const sector = this.handler.level.sectors.indexOf(this.sector)

    return new Int32Array([
      0, 0, 0,
      sector,
      this.count,
      this.minLight,
      this.maxLight,
      this.darkTime,
      this.brightTime,
    ]).buffer
  }
}
