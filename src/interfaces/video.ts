import { SCREENHEIGHT, SCREENWIDTH } from '../global/doomdef'
import { XColor, XColorFlags } from './x'
import { Video as RVideo } from '../rendering/video'
import { gammaTable } from './gamma'

export class Video {
  useGamma = 0

  private xDisplay: HTMLCanvasElement | null = null
  private xScreen: CanvasRenderingContext2D | null = null

  private image: ImageData | null = null
  private xWidth = 0
  private yWidth = 0

  // Blocky mode,
  // replace each 320x200 pixel with multiply*multiply pixels.
  // According to Dave Taylor, it still is a bonehead thing
  // to use ....
  private multiply = 1

  constructor(private rVideo: RVideo) { }

  //
  // I_FinishUpdate
  //
  finishUpdate(): void {
    if (this.xScreen === null || this.image === null) {
      return
    }

    // scales the screen size before blitting it
    if (this.multiply === 1) {
      const oLine = this.image.data
      const iLine = new Uint8ClampedArray(this.rVideo.screens[0].buffer)

      let oLinePtr = 0
      let iLinePtr = 0
      let x: number
      let y = SCREENHEIGHT
      let color: XColor
      while (y--) {
        x = SCREENWIDTH
        do {
          color = this.colors[iLine[iLinePtr++]]
          oLine[oLinePtr++] = color.red / 65535 * 255
          oLine[oLinePtr++] = color.green / 65535 * 255
          oLine[oLinePtr++] = color.blue / 65535 * 255
          oLine[oLinePtr++] = 255
        // eslint-disable-next-line no-cond-assign
        } while (x -= 1)
      }
    }

    this.xScreen.putImageData(this.image, 0, 0)
  }

  private colors = new Array<XColor>(256)
  private firstCall = true
  private uploadNewPalette(palette: ArrayBuffer): void {
    // initialize the colormap
    if (this.firstCall) {
      this.firstCall = false

      for (let i = 0; i < 256; ++i) {
        this.colors[i] = {
          pixel: i,
          flags: XColorFlags.DoRed | XColorFlags.DoGreen | XColorFlags.DoBlue,
          red: 0, green: 0, blue: 0, pad: 0,
        }
      }
    }

    // set the X colormap entries
    let c = 0
    const paletteReader = new Uint8Array(palette)
    let palettePtr = 0
    for (let i = 0; i < 256; ++i) {
      c = gammaTable[this.useGamma][paletteReader[palettePtr++]]
      this.colors[i].red = (c << 8) + c
      c = gammaTable[this.useGamma][paletteReader[palettePtr++]]
      this.colors[i].green = (c << 8) + c
      c = gammaTable[this.useGamma][paletteReader[palettePtr++]]
      this.colors[i].blue = (c << 8) + c
    }
  }

  setPalette(palette: ArrayBuffer): void {
    this.uploadNewPalette(palette)
  }


  private firstTime = 1

  initGraphics(): void {
    if (!this.firstTime) {
      return
    }
    this.firstTime = 0

    this.xWidth = SCREENWIDTH * this.multiply
    this.yWidth = SCREENHEIGHT * this.multiply

    const displayName = 'screen'
    this.xDisplay = document.getElementById(displayName) as HTMLCanvasElement

    this.xDisplay.width = this.xWidth
    this.xDisplay.height = this.yWidth

    if (this.xDisplay === null || this.xDisplay.getContext('2d') === null) {
      throw `Could not open display [${displayName}]`
    }

    this.xScreen = this.xDisplay.getContext('2d')

    if (this.xScreen === null) {
      throw `Could not open display [${displayName}]`
    }

    this.image = this.xScreen.createImageData(this.xWidth, this.yWidth)

    this.rVideo.screens[0] = new Uint8ClampedArray(SCREENWIDTH * SCREENHEIGHT)
  }
}
