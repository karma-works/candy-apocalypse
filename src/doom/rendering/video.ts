import { FRACBITS, FRACUNIT, div, mul } from "../misc/fixed";
import { RANGE_CHECK, STRETCH } from "../global/doomdef";
import { Column } from "./defs/column";
import { Flat } from "../textures/flat";
import { Patch } from "./defs/patch";
import { Post } from "./defs/post";
import { Color, Palette } from "../interfaces/palette";

interface DrawPatchOptions {
  flipped?: boolean;
  scale?: number;
}

type LogicalSize = { logical: [number, number] };
type PhysicalSize = { physical: [number, number] };

export class Screen extends Uint8ClampedArray {
  static get [Symbol.species](): Uint8ClampedArrayConstructor {
    return Uint8ClampedArray;
  }

  alpha: Uint8ClampedArray;

  constructor(
    public width: number,
    public height: number,
  ) {
    super(width * height);
    this.alpha = new Uint8ClampedArray(width * height);
  }
}

export function drawInImageData(
  screen: Screen,
  output: Uint8ClampedArray,
  palette: Palette,
  gamma: number = 0,
  withAlpha: boolean = true,
): void {
  const reds = palette.getColors(Color.Red, gamma);
  const greens = palette.getColors(Color.Green, gamma);
  const blues = palette.getColors(Color.Blue, gamma);

  let oLinePtr = 0;
  let iLinePtr = 0;
  let x: number;
  let y = screen.height;

  while (y--) {
    x = screen.width;
    do {
      output[oLinePtr++] = reds[screen[iLinePtr]];
      output[oLinePtr++] = greens[screen[iLinePtr]];
      output[oLinePtr++] = blues[screen[iLinePtr]];
      if (withAlpha) {
        output[oLinePtr++] = screen.alpha[iLinePtr];
      }
      iLinePtr++;
    } while ((x -= 1));
  }
}

export class Video {
  // Each screen is [SCREENWIDTH*SCREENHEIGHT];
  screens = new Array<Screen>(5);

  width = 0;
  height = 0;
  public get physicalWidth(): number {
    return this.width;
  }
  public set physicalWidth(value: number) {
    this.width = value;
  }
  public get physicalHeight(): number {
    return this.height * STRETCH;
  }
  public set physicalHeight(value: number) {
    this.height = value / STRETCH;
  }
  scale = 1;

  constructor(p: LogicalSize | PhysicalSize) {
    if ((<LogicalSize>p).logical) {
      [this.width, this.height] = (<LogicalSize>p).logical;
    } else {
      [this.physicalWidth, this.physicalHeight] = (<PhysicalSize>p).physical;
    }
  }

  //
  // V_CopyRect
  //
  copyRect(
    srcX: number,
    srcY: number,
    srcScreen: number,
    width: number,
    height: number,
    destX: number,
    destY: number,
    destScreen: number,
  ): void {
    const source = this.screens[srcScreen];
    const dest = this.screens[destScreen];
    const destAlpha = dest.alpha;

    srcX >>= 0;
    srcY >>= 0;
    destX >>= 0;
    destY >>= 0;

    if (RANGE_CHECK) {
      if (
        srcX < 0 ||
        srcX + width > source.width ||
        srcY < 0 ||
        srcY + height > source.height ||
        destX < 0 ||
        destX + width > dest.width ||
        destY < 0 ||
        destY + height > dest.height ||
        srcScreen > 4 ||
        destScreen > 4
      ) {
        throw "Bad V_CopyRect";
      }
    }

    let srcPtr = source.width * srcY + srcX;
    let destPtr = dest.width * destY + destX;

    for (; height > 0; --height) {
      dest.set(source.slice(srcPtr, srcPtr + width), destPtr);
      destAlpha.fill(255, destPtr, destPtr + width);
      srcPtr += source.width;
      destPtr += dest.width;
    }
  }

  //
  // V_DrawPatch
  // Masks a column based masked pic to the screen.
  //
  drawPatch(
    x: number,
    y: number,
    scrn: number,
    patch: Patch,
    { flipped = false, scale = this.scale }: DrawPatchOptions = {},
  ): void {
    const screen = this.screens[scrn];
    const alpha = screen.alpha;

    const w = patch.width;
    const srcWidth = patch.width << FRACBITS;

    y -= patch.topOffset * scale;
    x -= patch.leftOffset * scale;

    x >>= 0;
    y >>= 0;

    scale <<= FRACBITS;

    let destTopPtr = y * screen.width + x;

    let column: Column;
    let post: Post;
    let destPtr: number;
    let count: number;

    let xFrac = 0;
    const step = div(FRACUNIT, scale);
    let yFrac: number;
    columns: for (; xFrac < srcWidth; ++x, ++destTopPtr) {
      column =
        patch.columns[
          flipped ? w - 1 - (xFrac >> FRACBITS) : xFrac >> FRACBITS
        ];
      xFrac += step;

      if (x < 0 || x > screen.width) {
        continue columns;
      }

      // step through the posts in a column
      for (post of column.posts) {
        destPtr =
          destTopPtr +
          (mul(post.topDelta << FRACBITS, scale) >> FRACBITS) * this.width;
        count = mul(post.length << FRACBITS, scale) >> FRACBITS;

        yFrac = 0;
        while (count--) {
          if (destPtr >= 0) {
            screen[destPtr] = post.bytes[yFrac >> FRACBITS];
            alpha[destPtr] = 255;
          }

          destPtr += screen.width;
          yFrac += step;

          if (destPtr > screen.length) {
            continue columns;
          }
        }
      }
    }
  }

  drawFlat(x: number, y: number, scrn: number, flat: Flat): void {
    const dest = this.screens[scrn];
    let destPtr = y * dest.width + x;

    const maxY = Math.min(64, dest.height - y);
    const maxX = Math.min(64, dest.width - x);

    for (let yy = 0; yy < maxY; ++yy) {
      dest.set(flat.slice(yy * 64, yy * 64 + maxX), destPtr);
      dest.alpha.fill(255, destPtr, destPtr + maxX);
      destPtr += dest.width;
    }
  }

  //
  // V_DrawBlock
  // Draw a linear block of pixels into the view buffer.
  //
  drawBlock(
    x: number,
    y: number,
    scrn: number,
    width: number,
    height: number,
    src: Uint8ClampedArray,
  ): void {
    const dest = this.screens[scrn];
    const alpha = dest.alpha;

    if (RANGE_CHECK) {
      if (
        x < 0 ||
        x + width > this.width ||
        y < 0 ||
        y + height > this.height ||
        scrn > 4
      ) {
        throw "Bad V_DrawBlock";
      }
    }

    let srcPtr = 0;
    let destPtr = y * this.width + x;

    while (height--) {
      dest.set(src.slice(srcPtr, srcPtr + width), destPtr);
      alpha.fill(255, destPtr, destPtr + width);

      srcPtr += width;
      destPtr += this.width;
    }
  }

  //
  // Copy a screen buffer.
  //
  erase(ofs: number, count: number): void {
    this.screens[0].set(this.screens[1].slice(ofs, ofs + count), ofs);
    this.screens[0].alpha.set(
      this.screens[1].alpha.slice(ofs, ofs + count),
      ofs,
    );
  }

  //
  // V_Init
  //
  init(screenCount = 4): void {
    for (let i = 0; i < screenCount; ++i) {
      this.screens[i] = new Screen(this.width, this.height);
    }
  }
}
