import { Line } from '../../rendering/defs/line'
import { MObj } from '../mobj/mobj'

export type Intercept = {
  // along trace line
  frac: number
} & ({
  isALine: true
  d: Line
} | {
  isALine: false
  d: MObj | null
})
