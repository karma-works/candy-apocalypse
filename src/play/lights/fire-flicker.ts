import { Action, Thinker } from '../../doom/think'
import { Lights } from '../lights'
import { Sector } from '../../rendering/sector'

export class FireFlicker extends Thinker<Lights, [FireFlicker]> {
  count: number
  maxLight: number
  minLight: number

  constructor(
    public sector: Sector,
    func: Action<Lights, [FireFlicker]>,
    lights: Lights,
  ) {
    super(func, lights)

    this.maxLight = sector.lightLevel
    this.minLight = sector.findMinSurroundingLight(sector.lightLevel) + 16
    this.count = 4
  }
}
