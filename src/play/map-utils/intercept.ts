import { Line } from '../../rendering/line'
import { MObj } from '../mobj'

export class Intercept {
  // along trace line
  frac = 0
  isALine = false
  d: MObj | Line | null = null
}
