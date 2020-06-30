import { NumberWidget } from './number-widget'
import { Patch } from '../rendering/patch'

export class PercentWidget extends NumberWidget {
  constructor(
    x: number,
    y: number,
    patches: Patch[],
    num: () => number,
    on: () => boolean,

    // percent sign graphic
    public patch: Patch,
  ) {
    super(x, y, patches, num, on, 3)
  }
}
