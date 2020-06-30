import { SCREENHEIGHT, SCREENWIDTH, SCREEN_MUL } from '../global/doomdef'
import { BinIcon } from './bin-icon'
import { MultiIcon } from './multi-icon'
import { NumberWidget } from './number-widget'
import { Patch } from '../rendering/patch'
import { PercentWidget } from './percent-widget'
import { StatusBar } from './stuff'
import { Video } from '../rendering/video'

//
// Background and foreground screen numbers
// Size of statusbar.
// Now sensitive for scaling.
export const ST_HEIGHT = 32 * SCREEN_MUL
export const ST_WIDTH = SCREENWIDTH
export const ST_Y = SCREENHEIGHT - ST_HEIGHT

//
export const BG = 4
export const FG = 0

export class Lib {
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
    this.minus = new Patch(this.statusBar.wad.cacheLumpName('STTMINUS'))
  }


  //
  // A fairly efficient way to draw a number
  //  based on differences from the old number.
  // Note: worth the trouble?
  //
  private drawNum(n: NumberWidget): void {
    let numDigits = n.width
    let num = n.num()

    const w = n.patches[0].width
    const h = n.patches[0].height
    let x = n.x

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
    x = n.x - numDigits * w

    if (n.y - ST_Y < 0) {
      throw 'drawNum: n->y - ST_Y < 0'
    }

    this.rVideo.copyRect(x, n.y - ST_Y, BG,
      w * numDigits, h,
      x, n.y, FG,
    )

    // if non-number, do not draw it
    if (num === 1994) {
      return
    }

    x = n.x

    // in the special case of 0, you draw 0
    if (!num) {
      this.rVideo.drawPatch(x - w, n.y, FG, n.patches[0])
    }

    // draw the new number
    while (num && numDigits--) {
      x -= w
      this.rVideo.drawPatch(x, n.y, FG, n.patches[ num % 10 ])
      num = num / 10 >> 0
    }

    // draw a minus sign if necessary
    if (neg) {
      this.rVideo.drawPatch(x - 8, n.y, FG, this.minus)
    }


  }

  updateNum(n: NumberWidget): void {
    if (n.on()) {
      this.drawNum(n)
    }
  }

  updatePercent(per: PercentWidget, refresh: boolean): void {
    if (refresh && per.on()) {
      this.rVideo.drawPatch(per.x, per.y, FG, per.patch)
    }

    this.updateNum(per)
  }

  updateMultiIcon(mi: MultiIcon, refresh: boolean): void {
    if (mi.on() &&
      (mi.oldINum !== mi.iNum() || refresh) &&
      mi.iNum() !== -1
    ) {
      if (mi.oldINum !== -1) {
        const x = mi.x - mi.patches[mi.oldINum].leftOffset
        const y = mi.y - mi.patches[mi.oldINum].topOffset
        const w = mi.patches[mi.oldINum].width
        const h = mi.patches[mi.oldINum].height

        if (y - ST_Y < 0) {
          throw 'updateMultIcon: y - ST_Y < 0'
        }

        this.rVideo.copyRect(x, y - ST_Y, BG, w, h, x, y, FG)
      }
      this.rVideo.drawPatch(mi.x, mi.y, FG, mi.patches[mi.iNum()])
      mi.oldINum = mi.iNum()
    }
  }

  updateBinIcon(bi: BinIcon, refresh: boolean): void {
    if (bi.on() &&
      (bi.oldVal !== bi.val() || refresh)
    ) {
      const x = bi.x - bi.patch.leftOffset
      const y = bi.y - bi.patch.topOffset
      const w = bi.patch.width
      const h = bi.patch.height

      if (y - ST_Y < 0) {
        throw 'updateBinIcon: y - ST_Y < 0'
      }

      if (bi.val()) {
        this.rVideo.drawPatch(bi.x, bi.y, FG, bi.patch)
      } else {
        this.rVideo.copyRect(x, y - ST_Y, BG, w, h, x, y, FG)
      }

      bi.oldVal = bi.val()
    }
  }

}
