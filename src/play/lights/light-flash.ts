import { Action, Thinker } from '../../doom/think'
import { Sector, isSector } from '../../rendering/sector'
import { Lights } from '../lights'
import { random } from '../../misc/random'

export class LightFlash extends Thinker<Lights, [LightFlash]> {
  static sizeOf = 36

  sector: Sector

  count = 0
  maxLight = 0
  minLight = 0
  maxTime = 0
  minTime = 0

  constructor(func: Action<Lights, [LightFlash]>, lights: Lights,
    sector: Sector)
  constructor(func: Action<Lights, [LightFlash]>, lights: Lights,
    buffer: ArrayBuffer)
  constructor(
    func: Action<Lights, [LightFlash]>,
    lights: Lights,
    sector: Sector | ArrayBuffer,
  ) {
    super(func, lights)

    if (isSector(sector)) {
      this.sector = sector

      this.maxLight = sector.lightLevel
      this.minLight = sector.findMinSurroundingLight()
      this.maxTime = 64
      this.minTime = 7
      this.count = (random.pRandom() & this.maxTime) + 1
    } else {
      const int32 = new Int32Array(sector, 0, LightFlash.sizeOf / Int32Array.BYTES_PER_ELEMENT)
      let int32Ptr = 0
      int32Ptr += 3

      const sectorNum = int32[int32Ptr++]
      this.sector = lights.sectors[sectorNum]
      this.count = int32[int32Ptr++]
      this.maxLight = int32[int32Ptr++]
      this.minLight = int32[int32Ptr++]
      this.maxTime = int32[int32Ptr++]
      this.minTime = int32[int32Ptr++]
    }
  }

  archive(): ArrayBuffer {
    const sector = this.handler.sectors.indexOf(this.sector)

    return new Int32Array([
      0, 0, 0,
      sector,
      this.count,
      this.maxLight,
      this.minLight,
      this.maxTime,
      this.minTime,
    ]).buffer
  }
}
