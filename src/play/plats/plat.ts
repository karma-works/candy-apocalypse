import { Action, Thinker } from '../../doom/think'
import { FRACUNIT } from '../../misc/fixed'
import { PlatStatus } from './plat-status'
import { PlatType } from './plat-type'
import { Plats } from '../plats'
import { Sector } from '../../rendering/sector'

export const PLAT_WAIT = 3
export const PLAT_SPEED = FRACUNIT

export class Plat extends Thinker<Plats, Plat> {
  speed = PLAT_SPEED
  low = 0
  high = 0
  wait = PLAT_WAIT
  count = 0
  status: PlatStatus = 0
  oldStatus: PlatStatus = 0
  crush = false
  tag = 0

  constructor(
    public type: PlatType,
    public sector: Sector,
    func: Action<Plats, Plat>,
    plats: Plats,
  ) {
    super(func, plats)
  }
}
