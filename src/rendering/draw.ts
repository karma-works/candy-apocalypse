import { RANGE_CHECK, SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { FRACBITS } from '../misc/fixed'
import { Rendering } from './rendering'
import { Video } from './video'

// ?
export const MAX_WIDTH = 1120
export const MAX_HEIGHT = 832

// status bar height at bottom of screen
const SBAR_HEIGHT = 32

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
  private viewWindowX = 0
  private viewWindowY = 0
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

  // first pixel in a column (possibly virtual)
  dcSource = new Uint8ClampedArray(0)

  // just for profiling
  private dcCount = 0

  private get video(): Video {
    return this.rendering.video
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
      dest[destPtr] = this.dcColorMap[this.dcSource[frac >> FRACBITS & 127]]
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
    debugger
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
}
