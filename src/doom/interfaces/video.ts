import { Color, Palette } from './palette'
import { Video as RVideo, Screen } from '../rendering/video'
import { VideoInterface } from './video-interface'

export class Video implements VideoInterface {
  ratio = 4 / 3

  private _useGamma = 0
  public get gamma(): number {
    return this._useGamma
  }
  public set gamma(value: number) {
    this._useGamma = value
    this.updatePalette()
  }

  screen: HTMLCanvasElement | null = null
  private xScreen: CanvasRenderingContext2D | null = null

  private image: ImageData | null = null
  private xWidth = 0
  private xHeight = 0

  // Blocky mode,
  // replace each 320x200 pixel with multiply*multiply pixels.
  // According to Dave Taylor, it still is a bonehead thing
  // to use ....
  private multiply = 1

  constructor(private rVideo: RVideo) {
    this.updatePalette()
  }

  //
  // I_FinishUpdate
  //
  finishUpdate(): void {
    if (this.xScreen === null || this.image === null) {
      return
    }

    // scales the screen size before blitting it
    if (this.multiply === 1) {
      this.drawInImageData(this.image.data)
    }

    this.xScreen.putImageData(this.image, 0, 0)
  }

  drawInImageData(oLine: Uint8ClampedArray, withAlpha = true): void {
    const iLine = new Uint8ClampedArray(this.rVideo.screens[0].buffer)
    const alpha = this.rVideo.screens[0].alpha

    let oLinePtr = 0
    let iLinePtr = 0
    let x: number
    let y = this.rVideo.height

    const reds = this.reds
    const greens = this.greens
    const blues = this.blues
    while (y--) {
      x = this.rVideo.width
      do {
        oLine[oLinePtr++] = reds[iLine[iLinePtr]]
        oLine[oLinePtr++] = greens[iLine[iLinePtr]]
        oLine[oLinePtr++] = blues[iLine[iLinePtr]]
        if (withAlpha) {
          oLine[oLinePtr++] = alpha[iLinePtr]
        }
        iLinePtr++
      // eslint-disable-next-line no-cond-assign
      } while (x -= 1)
    }
  }

  private _palette = new Palette()
  public get palette(): Palette {
    return this._palette
  }
  public set palette(p: Palette) {
    this._palette = p
    this.updatePalette()
  }
  private reds = new Uint8ClampedArray()
  private greens = new Uint8ClampedArray()
  private blues = new Uint8ClampedArray()

  private updatePalette(): void {
    this.reds = this.palette.getColors(Color.Red, this.gamma)
    this.greens = this.palette.getColors(Color.Green, this.gamma)
    this.blues = this.palette.getColors(Color.Blue, this.gamma)
  }

  private firstTime = true

  init(): void {
    if (!this.firstTime) {
      return
    }
    if (this.screen === null) {
      throw 'no screen defined'
    }
    this.firstTime = false

    this.xWidth = this.rVideo.width * this.multiply
    this.xHeight = this.rVideo.height * this.multiply

    this.ratio = this.rVideo.physicalWidth / this.rVideo.physicalHeight

    this.screen.width = this.xWidth
    this.screen.height = this.xHeight


    this.xScreen = this.screen.getContext('2d')

    if (this.xScreen === null) {
      throw 'Could not open display'
    }

    this.image = this.xScreen.createImageData(this.xWidth, this.xHeight)

    this.rVideo.screens[0] = new Screen(this.rVideo.width, this.rVideo.height)
  }

  quit(): void {
    if (this.screen === null || this.xScreen === null) {
      return
    }

    this.xScreen.clearRect(0, 0, this.rVideo.width, this.rVideo.height)

    this.xScreen = null
  }
}
