import { RANGE_CHECK, SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { Data } from './data'
import { Doom } from '../doom'
import { FRACBITS } from '../misc/fixed'
import { GameMode } from '../doom/mode'
import { LumpReader } from '../wad/lump-reader'
import { Patch } from './defs/patch'
import { Post } from './defs/post'
import { Rendering } from './rendering'
import { Video } from './video'

// ?
export const MAX_WIDTH = 1120
export const MAX_HEIGHT = 832

// status bar height at bottom of screen
const SBAR_HEIGHT = 32

//
// Spectre/Invisibility.
//
const FUZZ_TABLE = 50
const FUZZ_OFF = SCREENWIDTH

const fuzzOffset = [
  FUZZ_OFF,-FUZZ_OFF,FUZZ_OFF,-FUZZ_OFF,FUZZ_OFF,FUZZ_OFF,-FUZZ_OFF,
  FUZZ_OFF,FUZZ_OFF,-FUZZ_OFF,FUZZ_OFF,FUZZ_OFF,FUZZ_OFF,-FUZZ_OFF,
  FUZZ_OFF,FUZZ_OFF,FUZZ_OFF,-FUZZ_OFF,-FUZZ_OFF,-FUZZ_OFF,-FUZZ_OFF,
  FUZZ_OFF,-FUZZ_OFF,-FUZZ_OFF,FUZZ_OFF,FUZZ_OFF,FUZZ_OFF,FUZZ_OFF,-FUZZ_OFF,
  FUZZ_OFF,-FUZZ_OFF,FUZZ_OFF,FUZZ_OFF,-FUZZ_OFF,-FUZZ_OFF,FUZZ_OFF,
  FUZZ_OFF,-FUZZ_OFF,-FUZZ_OFF,-FUZZ_OFF,-FUZZ_OFF,FUZZ_OFF,FUZZ_OFF,
  FUZZ_OFF,FUZZ_OFF,-FUZZ_OFF,FUZZ_OFF,FUZZ_OFF,-FUZZ_OFF,FUZZ_OFF,
]

export class Draw {
  //
  // All drawing to the view buffer is accomplished in this file.
  // The other refresh files only know about ccordinates,
  //  not the architecture of the frame buffer.
  // Conveniently, the frame buffer is a linear one,
  //  and we need only the base address,
  //  and the total size == width*height*depth/8.,
  //

  private viewImage = new Array<number>()
  viewWidth = 0
  scaledViewWidth = 0
  viewHeight = 0
  viewWindowX = 0
  viewWindowY = 0
  private yLookupPtr = new Array<number>(MAX_HEIGHT).fill(0)
  private columnOfs = new Array<number>(MAX_WIDTH).fill(0)

  // Color tables for different players,
  //  translate a limited part to another
  //  (color ramps used for  suit colors).
  //
  private translations = Array.from({ length: 3 }, () => new Array<number>(256).fill(0))

  //
  // R_DrawColumn
  // Source is the top of the column to scale.
  //
  dcColorMap: Uint8ClampedArray | null = null
  dcX = 0
  dcYl = 0
  dcYh = 0
  dcIScale = 0
  dcTextureMid = 0

  dcSource = new Post()

  private get data(): Data {
    return this.rendering.data
  }
  private get doom(): Doom {
    return this.rendering.doom
  }
  private get video(): Video {
    return this.rendering.video
  }
  private get wad(): LumpReader {
    return this.rendering.wad
  }

  constructor(private rendering: Rendering) { }

  //
  // A column is a vertical slice/span from a wall texture that,
  //  given the DOOM style restrictions on the view orientation,
  //  will always have constant z depth.
  // Thus a special case loop for very fast rendering can
  //  be used. It has also been used with Wolfenstein 3D.
  //
  drawColumn(): void {
    let count = this.dcYh - this.dcYl

    // Zero length, column does not exceed a pixel.
    if (count < 0) {
      return
    }

    if (RANGE_CHECK) {
      if (this.dcX >>> 0 >= SCREENWIDTH ||
          this.dcYl < 0 ||
          this.dcYh >= SCREENHEIGHT
      ) {
        throw `R_DrawColumn: ${this.dcYl} to ${this.dcYh} at ${this.dcX}`
      }
    }

    // Framebuffer destination address.
    // Use ylookup LUT to avoid multiply with ScreenWidth.
    // Use columnofs LUT for subwindows?
    let destPtr = this.yLookupPtr[this.dcYl] +
        this.columnOfs[this.dcX]
    const dest = this.video.screens[0]

    // Determine scaling,
    //  which is the only mapping to be done.
    const fracStep = this.dcIScale
    let frac = this.dcTextureMid +
        (this.dcYl - this.rendering.centerY) * fracStep

    if (this.dcColorMap === null) {
      throw 'this.dcColorMap = null'
    }

    // Inner loop that does the actual texture mapping,
    //  e.g. a DDA-lile scaling.
    // This is as fast as it gets.
    do {
      // Re-map color indices from wall texture column
      //  using a lighting/special effects LUT.
      dest[destPtr] = this.dcColorMap[
        this.dcSource.bytes[frac >> FRACBITS & 127]
      ]
      destPtr += SCREENWIDTH
      frac += fracStep
    } while (count--)
  }
  drawColumnLow(): void {
    debugger
  }

  fuzzPos = 0

  //
  // Framebuffer postprocessing.
  // Creates a fuzzy image by copying pixels
  //  from adjacent ones to left and right.
  // Used with an all black colormap, this
  //  could create the SHADOW effect,
  //  i.e. spectres and invisible players.
  //
  drawFuzzColumn(): void {
    // Adjust borders. Low...
    if (!this.dcYl) {
      this.dcYl = 1
    }

    // .. and high.
    if (this.dcYh === this.viewHeight - 1) {
      this.dcYh = this.viewHeight - 2
    }

    let count = this.dcYh - this.dcYl

    // Zero length.
    if (count < 0) {
      return
    }

    if (RANGE_CHECK) {
      if (this.dcX >>> 0 >= SCREENWIDTH ||
        this.dcYl < 0 || this.dcYh >= SCREENHEIGHT
      ) {
        throw `R_DrawFuzzColumn: ${this.dcYl} to ${this.dcYh} at ${this.dcX}`
      }
    }

    // Does not work with blocky mode.
    let destPtr = this.yLookupPtr[this.dcYl] +
      this.columnOfs[this.dcX]
    const dest = this.video.screens[0]

    // Looks like an attempt at dithering,
    //  using the colormap #6 (of 0-31, a bit
    //  brighter than average).
    do {
      // Lookup framebuffer, and retrieve
      //  a pixel that is either one column
      //  left or right of the current one.
      // Add index from colormap to index.
      dest[destPtr] = this.data.colorMaps[6 * 256 +
        dest[destPtr + fuzzOffset[this.fuzzPos]]
      ]

      // Clamp table lookup index.
      if (++this.fuzzPos === FUZZ_TABLE) {
        this.fuzzPos = 0
      }

      destPtr += SCREENWIDTH
    } while (count--)
  }


  //
  // R_DrawTranslatedColumn
  // Used to draw player sprites
  //  with the green colorramp mapped to others.
  // Could be used with different translation
  //  tables, e.g. the lighter colored version
  //  of the BaronOfHell, the HellKnight, uses
  //  identical sprites, kinda brightened up.
  //
  dcTranslation = new ArrayBuffer(0)
  translationTables = new ArrayBuffer(0)

  drawTranslatedColumn(): void {
    debugger
  }

  //
  // R_InitTranslationTables
  // Creates the translation tables to map
  //  the green color ramp to gray, brown, red.
  // Assumes a given structure of the PLAYPAL.
  // Could be read from a lump instead.
  //
  initTranslationTables(): void {
    this.translationTables = new Uint8Array(256 * 3 + 255)
    const tt = new Uint8Array(this.translationTables)

    // translate just the 16 green colors
    for (let i = 0; i < 256; ++i) {
      if (i >= 0x70 && i <= 0x7f) {
        // map green ramp to gray, brown, red
        tt[i] = 0x60 + (i & 0xf)
        tt[i + 256] = 0x40 + (i & 0xf)
        tt[i + 512] = 0x20 + (i & 0xf)
      } else {
        // Keep all other colors as is.
        tt[i] = tt[i + 256] = tt[i + 512] = i
      }
    }
  }


  //
  // R_DrawSpan
  // With DOOM style restrictions on view orientation,
  //  the floors and ceilings consist of horizontal slices
  //  or spans with constant z depth.
  // However, rotation around the world z axis is possible,
  //  thus this mapping, while simpler and faster than
  //  perspective correct texture mapping, has to traverse
  //  the texture at an angle in all but a few cases.
  // In consequence, flats are not stored by column (like walls),
  //  and the inner loop has to step in texture space u and v.
  //
  dsY = 0
  dsX1 = 0
  dsX2 = 0

  dsColorMap = new Uint8ClampedArray(0)

  dsXFrac = 0
  dsYFrac = 0
  dsXStep = 0
  dsYStep = 0

  // start of a 64*64 tile image
  dsSource = new Uint8ClampedArray(8)

  // just for profiling
  private dsCount = 0

  //
  // Draws the actual span.
  drawSpan(): void {
    if (RANGE_CHECK) {
      if (this.dsX2 < this.dsX1 ||
          this.dsX1 < 0 ||
          this.dsX2 >= SCREENWIDTH ||
          this.dsY >>> 0 > SCREENHEIGHT
      ) {
        throw `R_DrawSpan: ${this.dsX1} to ${this.dsX2} at ${this.dsY}`
      }
    }

    let xFrac = this.dsXFrac
    let yFrac = this.dsYFrac

    let destPtr = this.yLookupPtr[this.dsY] +
        this.columnOfs[this.dsX1]
    const dest = this.video.screens[0]

    // We do not check for zero spans here?
    let count = this.dsX2 - this.dsX1


    let spot: number
    do {
      // Current texture index in u,v.
      spot = (yFrac >> 16 - 6 & 63 * 64) + (xFrac >> 16 & 63)

      // Lookup pixel from flat texture tile,
      //  re-index using light/colormap.
      dest[destPtr++] = this.dsColorMap[this.dsSource[spot]]

      // Next step in u,v.
      xFrac += this.dsXStep
      yFrac += this.dsYStep
    } while (count--)
  }

  //
  // Again..
  //
  drawSpanLow(): void {
    debugger
  }

  //
  // R_InitBuffer
  // Creats lookup tables that avoid
  //  multiplies and other hazzles
  //  for getting the framebuffer address
  //  of a pixel to draw.
  //
  initBuffer(width: number, height: number): void {
    // Handle resize,
    //  e.g. smaller view windows
    //  with border and/or status bar.
    this.viewWindowX = SCREENWIDTH - width >> 1

    // Column offset. For windows.
    for (let i = 0; i < width; ++i) {
      this.columnOfs[i] = this.viewWindowX + i
    }

    // Samw with base row offset.
    if (width === SCREENWIDTH) {
      this.viewWindowY = 0
    } else {
      this.viewWindowY = SCREENHEIGHT - SBAR_HEIGHT - height >> 1
    }

    // Preclaculate all row offsets.
    for (let i = 0; i < height; ++i) {
      this.yLookupPtr[i] = (i + this.viewWindowY) * SCREENWIDTH
    }
  }

  //
  // R_FillBackScreen
  // Fills the back screen with a pattern
  //  for variable screen sizes
  // Also draws a beveled edge.
  //
  fillBackScreen(): void {
    // DOOM border patch.
    const name1 = 'FLOOR7_2'

    // DOOM II border patch.
    const name2 = 'GRNROCK'

    if (this.scaledViewWidth === SCREENWIDTH) {
      return
    }

    let name: string
    if (this.doom.gameMode === GameMode.Commercial) {
      name = name2
    } else {
      name = name1
    }

    const src = new Uint8Array(this.wad.cacheLumpName(name))
    const dest = this.video.screens[1]
    let destOffset = 0

    for (let y = 0; y < SCREENHEIGHT - SBAR_HEIGHT; ++y) {
      for (let x = 0; x < SCREENWIDTH / 64; ++x) {
        dest.set(
          src.slice((y & 63) << 6, ((y & 63) << 6) + 64),
          destOffset,
        )
        destOffset += 64
      }

      if (SCREENWIDTH & 63) {
        dest.set(
          src.slice((y & 63) << 6, ((y & 63) << 6) + (SCREENWIDTH & 63)),
          destOffset,
        )
        destOffset += SCREENWIDTH & 63
      }
    }

    let patch = this.wad.cacheLumpName('brdr_t', Patch)
    for (let x = 0; x < this.scaledViewWidth; x += 8) {
      this.video.drawPatch(this.viewWindowX + x, this.viewWindowY - 8, 1, patch)
    }

    patch = this.wad.cacheLumpName('brdr_b', Patch)
    for (let x = 0; x < this.scaledViewWidth; x += 8) {
      this.video.drawPatch(this.viewWindowX + x, this.viewWindowY + this.viewHeight, 1, patch)
    }

    patch = this.wad.cacheLumpName('brdr_l', Patch)
    for (let y = 0; y < this.viewHeight; y += 8) {
      this.video.drawPatch(this.viewWindowX - 8, this.viewWindowY + y, 1, patch)
    }

    patch = this.wad.cacheLumpName('brdr_r', Patch)
    for (let y = 0; y < this.viewHeight; y += 8) {
      this.video.drawPatch(this.viewWindowX + this.scaledViewWidth, this.viewWindowY + y, 1, patch)
    }

    // Draw beveled edge.
    this.video.drawPatch(this.viewWindowX - 8,
      this.viewWindowY - 8,
      1,
      this.wad.cacheLumpName('brdr_tl', Patch))

    this.video.drawPatch(this.viewWindowX + this.scaledViewWidth,
      this.viewWindowY - 8,
      1,
      this.wad.cacheLumpName('brdr_tr', Patch))

    this.video.drawPatch(this.viewWindowX - 8,
      this.viewWindowY + this.viewHeight,
      1,
      this.wad.cacheLumpName('brdr_bl', Patch))

    this.video.drawPatch(this.viewWindowX + this.scaledViewWidth,
      this.viewWindowY + this.viewHeight,
      1,
      this.wad.cacheLumpName('brdr_br', Patch))

  }

  //
  // Copy a screen buffer.
  //
  videoErase(ofs: number, count: number): void {
    this.video.screens[0].set(
      this.video.screens[1].slice(ofs, ofs + count),
      ofs,
    )
  }

  //
  // R_DrawViewBorder
  // Draws the border around the view
  //  for different size windows?
  //
  drawViewBorder(): void {
    if (this.scaledViewWidth === SCREENWIDTH) {
      return
    }

    const top = (SCREENHEIGHT - SBAR_HEIGHT - this.viewHeight) / 2 >> 0
    let side = (SCREENWIDTH - this.scaledViewWidth) / 2 >> 0

    // copy top and one line of left side
    this.videoErase(0, top * SCREENWIDTH + side)

    // copy one line of right side and bottom
    let ofs = (this.viewHeight + top) * SCREENWIDTH - side
    this.videoErase(ofs, top * SCREENWIDTH + side)

    // copy sides using wraparound
    ofs = top * SCREENWIDTH + SCREENWIDTH - side
    side <<= 1

    for (let i = 1; i < this.viewHeight; ++i) {
      this.videoErase(ofs, side)
      ofs += SCREENWIDTH
    }
  }

}
