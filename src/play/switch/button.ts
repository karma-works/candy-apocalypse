import { Line } from '../../rendering/line'
import { MObj } from '../mobj/mobj'

export const enum Where {
  Top,
  Middle,
  Bottom,
}

export class Button {
  line: Line | null = null
  where: Where = 0
  bTexture = 0
  bTimer = 0
  soundOrg: MObj | null = null

  reset(): void{
    this.line = null
    this.where = 0
    this.bTexture = 0
    this.bTimer = 0
    this.soundOrg = null
  }

}

// 4 players, 4 buttons each at once, max.
export const MAX_BUTTONS = 16

// 1 second, in ticks.
export const BUTTON_TIME = 35
