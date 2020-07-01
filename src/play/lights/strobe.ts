import { Action, Thinker } from '../../doom/think'
import { Lights } from '../lights'
import { Sector } from '../../rendering/sector'
import { random } from '../../misc/random'

export class Strobe extends Thinker<Lights, [Strobe]> {
  count: number
  minLight: number
  maxLight: number
  darkTime: number
  brightTime: number

  constructor(
    public sector: Sector,
    func: Action<Lights, [Strobe]>,
    lights: Lights,
    darkTime: number,
    brightTime: number,
    inSync: number,
  ) {
    super(func, lights)

    this.maxLight = sector.lightLevel
    this.minLight = sector.findMinSurroundingLight()
    this.darkTime = darkTime
    this.brightTime = brightTime

    if (!inSync) {
      this.count = (random.pRandom() & 7) + 1
    } else {
      this.count = 1
    }
  }
}
