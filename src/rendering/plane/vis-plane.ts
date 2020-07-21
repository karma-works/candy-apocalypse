import { SCREENWIDTH } from '../../global/doomdef'
//
// Now what is a visplane, anyway?
//
export class VisPlane {
  height = 0
  picNum = 0
  lightLevel = 0
  minX = 0
  maxX = 0

  // Here lies the rub for all
  //  dynamic resize/change of resolution.
  top = new Array<number>(SCREENWIDTH).fill(0);

  // See above.
  bottom = new Array<number>(SCREENWIDTH).fill(0);

  // leave pads for [minx-1]/[maxx+1]
  constructor() {
    this.top[-1] = 0
    this.top[SCREENWIDTH] = 0
    this.bottom[-1] = 0
    this.bottom[SCREENWIDTH] = 0
  }
}
