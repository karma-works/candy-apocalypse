import { Action, Thinker } from '../../doom/think'
import { Lights } from '../lights'
import { Sector } from '../../rendering/sector'
import { random } from '../../misc/random'

export class LightFlash extends Thinker<Lights, [LightFlash]> {
  count: number
  maxLight: number
  minLight: number
  maxTime: number
  minTime: number

  constructor(
    public sector: Sector,
    func: Action<Lights, [LightFlash]>,
    lights: Lights,
  ) {
    super(func, lights)

    this.maxLight = sector.lightLevel
    this.minLight = sector.findMinSurroundingLight()
    this.maxTime = 64
    this.minTime = 7
    this.count = (random.pRandom() & this.maxTime) + 1
  }
}
