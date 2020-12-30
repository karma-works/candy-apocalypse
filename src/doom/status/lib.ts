import { BinIcon } from './bin-icon'
import { MultiIcon } from './multi-icon'
import { NumberWidget } from './number-widget'
import { Patch } from '../rendering/defs/patch'
import { PercentWidget } from './percent-widget'
import { SCREENWIDTH } from '../global/doomdef'
import { StatusBar } from './stuff'
import { Video } from '../rendering/video'

//
// Background and foreground screen numbers
// Size of statusbar.
// Now sensitive for scaling.
export const ST_HEIGHT = 32
export const ST_WIDTH = SCREENWIDTH

//
export const BG = 4
export const FG = 0

export class Lib {
  get x(): number {
    return (this.rVideo.width - ST_WIDTH * this.rVideo.scale) / 2
  }
  get y(): number {
    return this.rVideo.height - ST_HEIGHT * this.rVideo.scale
  }

  private get rVideo(): Video {
    return this.statusBar.rVideo
  }

  constructor(private statusBar: StatusBar) { }

  //
  // Hack display negative frags.
  //  Loads and store the stminus lump.
  //
  private minus = new Patch()
  init(): void {
    this.minus = this.statusBar.wad.cacheLumpName('STTMINUS', Patch)
  }


  //
  // A fairly efficient way to draw a number
  //  based on differences from the old number.
  // Note: worth the trouble?
  //
  private drawNum(n: NumberWidget): void {
    let numDigits = n.width
    let num = n.num()

    const scale = this.rVideo.scale

    const w = n.patches[0].width * scale
    const h = n.patches[0].height * scale
    let x = n.x * scale
    const y = n.y * scale

    n.oldNum = num

    const neg = num < 0

    if (neg) {
      if (numDigits === 2 && num < -9) {
        num = -9
      } else if (numDigits === 3 && num < -99) {
        num = -99
      }

      num = -num
    }

    // clear the area
    x = x - numDigits * w

    if (n.y < 0) {
      throw 'drawNum: n->y < 0'
    }

    this.rVideo.copyRect(x, y, BG,
      w * numDigits, h,
      x + this.x, y + this.y, FG,
    )

    // if non-number, do not draw it
    if (num === 1994) {
      return
    }

    x = n.x * scale

    // in the special case of 0, you draw 0
    if (!num) {
      this.rVideo.drawPatch(x - w + this.x, y + this.y, FG, n.patches[0])
    }

    // draw the new number
    while (num && numDigits--) {
      x -= w
      this.rVideo.drawPatch(x + this.x, y + this.y, FG, n.patches[ num % 10 ])
      num = num / 10 >> 0
    }

    // draw a minus sign if necessary
    if (neg) {
      this.rVideo.drawPatch(x - 8 * scale + this.x, y + this.y, FG, this.minus)
    }


  }

  updateNum(n: NumberWidget): void {
    if (n.on()) {
      this.drawNum(n)
    }
  }

  updatePercent(per: PercentWidget, refresh: boolean): void {
    if (refresh && per.on()) {
      const scale = this.rVideo.scale
      this.rVideo.drawPatch(per.x * scale + this.x,
        per.y * scale + this.y,
        FG, per.patch)
    }

    this.updateNum(per)
  }

  updateMultiIcon(mi: MultiIcon, refresh: boolean): void {
    if (mi.on() &&
      (mi.oldINum !== mi.iNum() || refresh) &&
      mi.iNum() !== -1
    ) {
      const scale = this.rVideo.scale

      if (mi.oldINum !== -1) {
        const x = (mi.x - mi.patches[mi.oldINum].leftOffset) * scale
        const y = (mi.y - mi.patches[mi.oldINum].topOffset) * scale
        const w = mi.patches[mi.oldINum].width * scale
        const h = mi.patches[mi.oldINum].height * scale

        if (y < 0) {
          throw 'updateMultIcon: y < 0'
        }

        this.rVideo.copyRect(x, y, BG, w, h, x + this.x, y + this.y, FG)
      }
      this.rVideo.drawPatch(mi.x * scale + this.x,
        mi.y * scale + this.y,
        FG, mi.patches[mi.iNum()])
      mi.oldINum = mi.iNum()
    }
  }

  updateBinIcon(bi: BinIcon, refresh: boolean): void {
    if (bi.on() &&
      (bi.oldVal !== bi.val() || refresh)
    ) {
      const scale = this.rVideo.scale
      const x = (bi.x - bi.patch.leftOffset) * scale
      const y = (bi.y - bi.patch.topOffset) * scale
      const w = bi.patch.width * scale
      const h = bi.patch.height * scale

      if (y < 0) {
        throw 'updateBinIcon: y < 0'
      }

      if (bi.val()) {
        this.rVideo.drawPatch(bi.x * scale + this.x,
          bi.y * scale + this.y,
          FG, bi.patch)
      } else {
        this.rVideo.copyRect(x, y, BG, w, h, x + this.x, y + this.y, FG)
      }

      bi.oldVal = bi.val()
    }
  }

}
