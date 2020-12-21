import { Camera, DataTexture, LuminanceFormat, OrthographicCamera, Scene, Sprite, WebGLRenderer } from 'three'
import { Palette } from '../interfaces/palette'
import { Video as RVideo } from '../rendering/video'
import { SpritePaletteMaterial } from './sprite-palette-material'
import { VideoInterface } from '../interfaces/video-interface'

export class Video implements VideoInterface {
  ratio = 4 / 3

  gamma = 0

  screen: HTMLCanvasElement | null = null
  renderer: WebGLRenderer | null = null
  scene: Scene | null = null
  camera: Camera | null = null

  xWidth = 320
  xHeight = 200

  overlayScene = new Scene()
  overlayCamera = new OrthographicCamera(-1, 1, 1, -1, 1, 10)
  overlayScreenMap: DataTexture | null = null
  overlayAlphaMap: DataTexture | null = null
  overlayMaterial: SpritePaletteMaterial | null = null

  constructor(private rVideo: RVideo) {
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
    this.renderer.clear()
    this.renderer.render(this.scene, this.camera)

    if (this.overlayScreenMap === null ||
      this.overlayAlphaMap === null) {
      return
    }
    this.overlayScreenMap.needsUpdate = true
    this.overlayAlphaMap.needsUpdate = true
    this.renderer.clearDepth()
    this.renderer.render(this.overlayScene, this.overlayCamera)
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

    this.xWidth = this.rVideo.width
    this.xHeight = this.rVideo.height

    this.ratio = this.rVideo.physicalWidth / this.rVideo.physicalHeight

    this.screen.width = this.xWidth
    this.screen.height = this.xHeight

    this.createOverlay()

    this.renderer = new WebGLRenderer({
      canvas: this.screen,
    })
    this.renderer.autoClear = false
  }

  private createOverlay() {
    this.overlayCamera.position.z = 10
    this.overlayCamera.left = -this.xWidth / 2
    this.overlayCamera.right = this.xWidth / 2
    this.overlayCamera.top = this.xHeight / 2
    this.overlayCamera.bottom = -this.xHeight / 2
    this.overlayCamera.updateProjectionMatrix()

    const data = this.rVideo.screens[0]
    this.overlayScreenMap = new DataTexture(
      data, data.width, data.height, LuminanceFormat,
    )
    this.overlayScreenMap.flipY = true

    const alpha = data.alpha
    this.overlayAlphaMap = new DataTexture(
      alpha, data.width, data.height, LuminanceFormat,
    )
    this.overlayAlphaMap.flipY = true

    this.overlayMaterial = new SpritePaletteMaterial({
      map: this.overlayScreenMap,
      alphaMap: this.overlayAlphaMap,
    })
    this.overlayMaterial.paletteTexture.palette = this.palette
    const sprite = new Sprite(this.overlayMaterial)
    sprite.scale.set(data.width, data.height, 1)
    sprite.position.set(0, 0, 1)

    this.overlayScene.add(sprite)
  }

  quit(): void {
    if (this.screen === null || this.renderer === null) {
      return
    }

    this.renderer.dispose()
  }
}
