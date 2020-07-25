import { RANGE_CHECK, SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { BBox } from '../misc/bbox'
import { Column } from './defs/column'
import { Patch } from './defs/patch'
import { Post } from './defs/post'

export class Video {
  // Each screen is [SCREENWIDTH*SCREENHEIGHT];
  screens = new Array<Uint8ClampedArray>(5)
  private dirtybox = new BBox()

  //
  // V_MarkRect
  //
  markRect(x: number, y: number, width: number, height: number): void {
    this.dirtybox.add(x, y)
    this.dirtybox.add(x + width - 1, y + height - 1)
  }

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

    this.markRect(destX, destY, width, height)

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
  drawPatch(x: number, y: number, scrn: number, patch: Patch | ArrayBuffer): void {
    if (patch instanceof ArrayBuffer) {
      patch = new Patch(patch)
    }

    y -= patch.topOffset
    x -= patch.leftOffset

    if (RANGE_CHECK) {
      if (x < 0 ||
        x + patch.width > SCREENWIDTH ||
        y < 0 ||
        y + patch.height > SCREENHEIGHT ||
        scrn > 4
      ) {
        console.error(`Patch at ${x},${y} exceeds LFB`)
        console.error('V_DrawPatch: bad patch (ignored)')
        return
      }
    }

    if (!scrn) {
      this.markRect(x, y, patch.width, patch.height)
    }

    let col = 0
    const screen = this.screens[scrn]
    let destTopPtr = y * SCREENWIDTH + x

    const w = patch.width

    let column: Column
    let post: Post
    let destPtr: number
    let sourcePtr: number
    let count: number
    for (; col < w; ++x, ++col, ++destTopPtr) {
      column = patch.columns[col]

      // step through the posts in a column
      for (post of column.posts) {
        sourcePtr = 0
        destPtr = destTopPtr + post.topDelta * SCREENWIDTH
        count = post.length

        while (count--) {
          screen[destPtr] = post.bytes[sourcePtr++]
          destPtr += SCREENWIDTH
        }
      }
    }

  }

  //
  // V_DrawPatchDirect
  // Draws directly to the screen on the pc.
  //
  drawPatchDirect(x: number, y: number, scrn: number, patch: Patch | ArrayBuffer): void {
    this.drawPatch(x, y, scrn, patch)
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

    this.markRect(x, y, width, height)

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
