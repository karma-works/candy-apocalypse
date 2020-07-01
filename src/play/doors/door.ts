import { Action, Thinker } from '../../doom/think'
import { DoorType } from './door-type'
import { Doors } from '../doors'
import { FRACUNIT } from '../../misc/fixed'
import { Sector } from '../../rendering/sector'

export const DOOR_SPEED = FRACUNIT * 2
export const DOOR_WAIT = 150

export class Door extends Thinker<Doors, [Door]> {
  topHeight = 0
  speed = DOOR_SPEED

  // 1 = up, 0 = waiting at top, -1 = down
  direction: -1 | 0 | 1 | 2 = 0

  // tics to wait at the top
  topWait = DOOR_WAIT

  // (keep in case a door going down is reset)
  // when it reaches 0, start going down
  topCountDown = 0

  constructor(
    public type: DoorType,
    public sector: Sector,
    func: Action<Doors, [Door]>,
    doors: Doors,
  ) {
    super(func, doors)
  }
}
