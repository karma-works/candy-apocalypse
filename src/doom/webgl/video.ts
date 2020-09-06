import { Camera, Object3D, WebGLRenderer } from 'three'
import { Color, Palette } from '../interfaces/palette'
import { VideoInterface } from '../interfaces/video-interface'

export class Video implements VideoInterface {
  useGamma = 0

  screen: HTMLCanvasElement | null = null
  private renderer: WebGLRenderer | null = null
  scene: Object3D | null = null
  camera: Camera | null = null

  xWidth = 320
  xHeight = 200

  constructor() {
    this.uploadNewPalette()
  }

  //
  // I_FinishUpdate
  //
  finishUpdate(): void {
    if (this.renderer === null ||
      this.scene === null ||
      this.camera === null) {
      return
    }
    this.renderer.render(this.scene, this.camera)
  }

  private palette = new Palette()
  private reds = new Uint8ClampedArray()
  private greens = new Uint8ClampedArray()
  private blues = new Uint8ClampedArray()

  uploadNewPalette(palette: Palette = this.palette): void {
    this.reds = palette.getColors(Color.Red, this.useGamma)
    this.greens = palette.getColors(Color.Green, this.useGamma)
    this.blues = palette.getColors(Color.Blue, this.useGamma)
    this.palette = palette
  }

  private firstTime = true

  init(screen: HTMLCanvasElement): void {
    if (!this.firstTime) {
      return
    }
    this.firstTime = false

    this.xWidth = 320 * 4
    this.xHeight = 200 * 4

    this.screen = screen

    this.screen.width = this.xWidth
    this.screen.height = this.xHeight

    this.renderer = new WebGLRenderer({
      canvas: this.screen,
    })
  }

  quit(): void {
    // TODO
  }
}
