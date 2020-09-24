import { Camera, Scene, WebGLRenderer } from 'three'
import { Palette } from '../interfaces/palette'
import { VideoInterface } from '../interfaces/video-interface'

export class Video implements VideoInterface {
  gamma = 0

  screen: HTMLCanvasElement | null = null
  renderer: WebGLRenderer | null = null
  scene: Scene | null = null
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

  palette = new Palette()

  uploadNewPalette(palette: Palette = this.palette): void {
    this.palette = palette
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

    this.xWidth = 320 * 4
    this.xHeight = 200 * 4

    this.screen.width = this.xWidth
    this.screen.height = this.xHeight

    this.renderer = new WebGLRenderer({
      canvas: this.screen,
    })
  }

  quit(): void {
    if (this.screen === null || this.renderer === null) {
      return
    }

    this.renderer.dispose()
  }
}
