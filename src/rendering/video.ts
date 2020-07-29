import { FRACBITS, FRACUNIT, div, mul } from '../misc/fixed'
import { RANGE_CHECK, SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { Column } from './defs/column'
import { Patch } from './defs/patch'
import { Post } from './defs/post'

export class Video {
  // Each screen is [SCREENWIDTH*SCREENHEIGHT];
  screens = new Array<Uint8ClampedArray>(5)

  //
  // V_CopyRect
  //
  copyRect(srcX: number, srcY: number, srcScreen: number,
    width: number, height: number,
    destX: number, destY: number, destScreen: number,
  ): void {
    if (RANGE_CHECK) {
      if (srcX < 0 ||
        srcX + width > SCREENWIDTH ||
        srcY < 0 ||
        srcY + height > SCREENHEIGHT ||
        destX < 0 ||
        destX + width > SCREENWIDTH ||
        destY < 0 ||
        destY + height > SCREENHEIGHT ||
        srcScreen > 4 ||
        destScreen > 4
      ) {
        throw 'Bad V_CopyRect'
      }
    }

    let srcPtr = SCREENWIDTH * srcY + srcX
    let destPtr = SCREENWIDTH * destY + destX

    for (; height > 0; --height) {
      this.screens[destScreen].set(
        this.screens[srcScreen].slice(srcPtr, srcPtr + width), destPtr,
      )
      srcPtr += SCREENWIDTH
      destPtr += SCREENWIDTH
    }
  }

  //
  // V_DrawPatch
  // Masks a column based masked pic to the screen.
  //
  drawPatch(x: number, y: number, scrn: number, patch: Patch,
    width = patch.width, height = patch.height): void {

    const srcWidth = patch.width << FRACBITS
    const srcHeight = patch.height << FRACBITS
    const destWidth = width << FRACBITS
    const destHeight = height << FRACBITS
    const xScale = div(destWidth, srcWidth)
    const yScale = div(destHeight, srcHeight)

    y -= patch.topOffset
    x -= patch.leftOffset

    if (RANGE_CHECK) {
      if (x < 0 ||
        x + width > SCREENWIDTH ||
        y < 0 ||
        y + height > SCREENHEIGHT ||
        scrn > 4
      ) {
        console.error(`Patch at ${x},${y} exceeds LFB`)
        console.error('V_DrawPatch: bad patch (ignored)')
        return
      }
    }

    const screen = this.screens[scrn]
    let destTopPtr = y * SCREENWIDTH + x

    let column: Column
    let post: Post
    let destPtr: number
    let count: number

    let xFrac = 0
    const xStep = div(FRACUNIT, xScale)
    let yFrac: number
    let yStep: number
    for (; xFrac < srcWidth; ++x, ++destTopPtr) {
      column = patch.columns[xFrac >> FRACBITS]
      xFrac += xStep

      // step through the posts in a column
      for (post of column.posts) {
        destPtr = destTopPtr +
          (mul(post.topDelta << FRACBITS, yScale) >> FRACBITS) *
          SCREENWIDTH
        count = mul(post.length << FRACBITS, yScale) >> FRACBITS

        yFrac = 0
        yStep = div(FRACUNIT, yScale)

        while (count--) {
          screen[destPtr] = post.bytes[yFrac >> FRACBITS]

          destPtr += SCREENWIDTH
          yFrac += yStep
        }
      }
    }

  }

  //
  // V_DrawBlock
  // Draw a linear block of pixels into the view buffer.
  //
  drawBlock(x: number, y: number, scrn: number, width: number, height: number, src: Uint8ClampedArray): void {

    if (RANGE_CHECK) {
      if (x < 0 ||
        x + width > SCREENWIDTH ||
        y < 0 ||
        y + height > SCREENHEIGHT ||
        scrn > 4
      ) {
        throw 'Bad V_DrawBlock'
      }
    }

    let srcPtr = 0
    let destPtr = y * SCREENWIDTH + x

    while (height--) {
      this.screens[scrn].set(
        src.slice(srcPtr, srcPtr + width), destPtr,
      )

      srcPtr += width
      destPtr += SCREENWIDTH
    }
  }

  //
  // V_Init
  //
  init(): void {
    for (let i = 0; i < 4; ++i) {
      this.screens[i] = new Uint8ClampedArray(SCREENWIDTH * SCREENHEIGHT)
    }
  }
}
