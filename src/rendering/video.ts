import { Column, Patch, Post } from './defs'
import { SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { BBox } from '../misc/bbox'

export class Video {
  // Each screen is [SCREENWIDTH*SCREENHEIGHT];
  screens = new Array<Uint8ClampedArray>(5)
  private dirtybox = new BBox()

  //
  // V_MarkRect
  //
  private markRect(x: number, y: number, width: number, height: number): void {
    this.dirtybox.add(x, y)
    this.dirtybox.add(x + width - 1, y + height - 1)
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
      column = patch.getColumn(col)

      // step through the posts in a column
      for (post of column) {
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
  // V_Init
  //
  init(): void {
    for (let i = 0; i < 4; ++i) {
      this.screens[i] = new Uint8ClampedArray(SCREENWIDTH * SCREENHEIGHT)
    }
  }
}
