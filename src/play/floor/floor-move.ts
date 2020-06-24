import { Action, Thinker } from '../../doom/think'
import { FRACUNIT } from '../../misc/fixed'
import { Floor } from '../floor'
import { FloorType } from './floor-type'
import { Sector } from '../../rendering/sector'

export const FLOOR_SPEED = FRACUNIT

export class FloorMove extends Thinker<Floor, FloorMove> {
  crush = false
  direction: -1 | 0 | 1 = 0
  newSpecial = 0
  texture = 0
  floorDestHeight = 0
  speed = FLOOR_SPEED

  constructor(
    public type: FloorType,
    public sector: Sector,
    func: Action<Floor, FloorMove>,
    floor: Floor,
  ) {
    super(func, floor)
  }
}
