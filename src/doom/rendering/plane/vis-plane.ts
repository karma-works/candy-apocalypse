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
  top: number[]

  // See above.
  bottom: number[]

  // leave pads for [minx-1]/[maxx+1]
  constructor(width: number) {
    this.top = new Array<number>(width).fill(0)
    this.bottom = new Array<number>(width).fill(0)
    this.top[-1] = 0
    this.top[width] = 0
    this.bottom[-1] = 0
    this.bottom[width] = 0

  }
}
