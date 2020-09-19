import { FRACBITS, FRACUNIT, div, mul } from '../misc/fixed'
import { RANGE_CHECK, SCREENHEIGHT, SCREENWIDTH, SCREEN_MUL } from '../global/doomdef'
import { Column } from './defs/column'
import { Flat } from '../textures/flat'
import { Patch } from './defs/patch'
import { Post } from './defs/post'

interface DrawPatchOptions {
  flipped?: boolean
  scale?: number
}

export class Video {
  // Each screen is [SCREENWIDTH*SCREENHEIGHT];
  screens = new Array<Uint8ClampedArray>(5)
  alpha = new Uint8ClampedArray()

  constructor(
    public width = SCREENWIDTH,
    public height = SCREENHEIGHT,
  ) { }

  //
  // V_CopyRect
  //
  copyRect(srcX: number, srcY: number, srcScreen: number,
    width: number, height: number,
    destX: number, destY: number, destScreen: number,
  ): void {
    if (RANGE_CHECK) {
      if (srcX < 0 ||
        srcX + width > this.width ||
        srcY < 0 ||
        srcY + height > this.height ||
        destX < 0 ||
        destX + width > this.width ||
        destY < 0 ||
        destY + height > this.height ||
        srcScreen > 4 ||
        destScreen > 4
      ) {
        throw 'Bad V_CopyRect'
      }
    }

    let srcPtr = this.width * srcY + srcX
    let destPtr = this.width * destY + destX

    for (; height > 0; --height) {
      this.screens[destScreen].set(
        this.screens[srcScreen].slice(srcPtr, srcPtr + width), destPtr,
      )
      this.alpha.fill(255, destPtr, destPtr + width)
      srcPtr += this.width
      destPtr += this.width
    }
  }

  //
  // V_DrawPatch
  // Masks a column based masked pic to the screen.
  //
  drawPatch(x: number, y: number, scrn: number, patch: Patch,
    { flipped = false, scale = SCREEN_MUL }: DrawPatchOptions = {},
  ): void {
    scale <<= FRACBITS

    const w = patch.width
    const srcWidth = patch.width << FRACBITS
    const srcHeight = patch.height << FRACBITS
    const destWidth = mul(scale, srcWidth)
    const destHeight = mul(scale, srcHeight)

    y -= patch.topOffset
    x -= patch.leftOffset

    if (RANGE_CHECK) {
      if (x < 0 ||
        x + (destWidth >> FRACBITS) > this.width ||
        y < 0 ||
        y + (destHeight >> FRACBITS) > this.height ||
        scrn > 4
      ) {
        console.error(`Patch at ${x},${y} exceeds LFB`)
        console.error('V_DrawPatch: bad patch (ignored)')
        return
      }
    }

    const screen = this.screens[scrn]
    let destTopPtr = y * this.width + x

    let column: Column
    let post: Post
    let destPtr: number
    let count: number

    let xFrac = 0
    const step = div(FRACUNIT, scale)
    let yFrac: number
    for (; xFrac < srcWidth; ++x, ++destTopPtr) {
      column = patch.columns[
        flipped ?
          w - 1 - (xFrac >> FRACBITS) :
          xFrac >> FRACBITS
      ]
      xFrac += step

      // step through the posts in a column
      for (post of column.posts) {
        destPtr = destTopPtr +
          (mul(post.topDelta << FRACBITS, scale) >> FRACBITS) *
          this.width
        count = mul(post.length << FRACBITS, scale) >> FRACBITS

        yFrac = 0
        while (count--) {
          screen[destPtr] = post.bytes[yFrac >> FRACBITS]
          this.alpha[destPtr] = 255

          destPtr += this.width
          yFrac += step
        }
      }
    }

  }

  drawFlat(x: number, y: number, scrn: number, flat: Flat): void {
    const dest = this.screens[scrn]
    let destPtr = y * this.width + x
    for (let yy = 0; yy < 64; ++yy) {
      dest.set(flat.slice(yy * 64, yy * 64 + 64), destPtr)
      destPtr += this.width
    }
  }

  //
  // V_DrawBlock
  // Draw a linear block of pixels into the view buffer.
  //
  drawBlock(x: number, y: number, scrn: number, width: number, height: number, src: Uint8ClampedArray): void {

    if (RANGE_CHECK) {
      if (x < 0 ||
        x + width > this.width ||
        y < 0 ||
        y + height > this.height ||
        scrn > 4
      ) {
        throw 'Bad V_DrawBlock'
      }
    }

    let srcPtr = 0
    let destPtr = y * this.width + x

    while (height--) {
      this.screens[scrn].set(
        src.slice(srcPtr, srcPtr + width), destPtr,
      )
      this.alpha.fill(255, destPtr, destPtr + width)

      srcPtr += width
      destPtr += this.width
    }
  }

  //
  // Copy a screen buffer.
  //
  erase(ofs: number, count: number): void {
    this.screens[0].set(
      this.screens[1].slice(ofs, ofs + count),
      ofs,
    )
    this.alpha.fill(0, ofs, ofs + count)
  }

  //
  // V_Init
  //
  init(screenCount = 4): void {
    for (let i = 0; i < screenCount; ++i) {
      this.screens[i] = new Uint8ClampedArray(this.width * this.height)
    }
    this.alpha = new Uint8ClampedArray(this.width * this.height)
  }
}
