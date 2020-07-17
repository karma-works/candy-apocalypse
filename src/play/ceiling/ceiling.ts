import { Action, Thinker } from '../../doom/think'
import { CeilingType } from './ceiling-type'
import { Ceilings } from '../ceilings'
import { FRACUNIT } from '../../misc/fixed'
import { Sector } from '../../rendering/sector'

export const CEIL_SPEED = FRACUNIT
export const MAX_CEILINGS = 30

export class Ceiling extends Thinker<Ceilings, [Ceiling]> {
  bottomHeight = 0
  topHeight = 0
  speed = CEIL_SPEED
  crush = false

  // 1 = up, 0 = waiting, -1 = down
  direction: -1 | 0 | 1 = 0

  // ID
  tag = 0
  oldDirection: -1 | 0 | 1 = 0

  constructor(
    public type: CeilingType,
    public sector: Sector,
    func: Action<Ceilings, [Ceiling]>,
    ceilings: Ceilings,
  ) {
    super(func, ceilings)
  }
}
