import { Action, Thinker } from '../../doom/think'
import { Lights } from '../lights'
import { Sector } from '../../rendering/sector'

export class Glow extends Thinker<Lights, Glow> {
  minLight: number
  maxLight: number
  direction: number

  constructor(
    public sector: Sector,
    func: Action<Lights, Glow>,
    lights: Lights,
  ) {
    super(func, lights)

    this.minLight = sector.findMinSurroundingLight()
    this.maxLight = sector.lightLevel
    this.direction = -1
  }
}
