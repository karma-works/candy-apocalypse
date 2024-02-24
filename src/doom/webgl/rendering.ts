import {
  PerspectiveCamera,
  Vector4,
} from 'three'
import { Controller } from 'lil-gui'
import { Doom } from '../doom'
import { FRACBITS } from '../misc/fixed'
import { Rendering as LegacyRendering } from '../rendering/rendering'
import { Level } from '../level/level'
import { LevelScene } from './objects/level-scene'
import { Player } from '../doom/player'
import { Segs } from './segs'
import { Textures } from './textures'
import { Things } from './things'
import { Video } from './video'
import { toRad } from '../misc/table'

export class Rendering extends LegacyRendering {

  private camera = new PerspectiveCamera(
    64, 320 / 200, 10, 3000,
  )
  private cameraController: Controller | null = null
  private viewport = new Vector4()
  private currentLevel: Level | null = null
  levelScene: LevelScene | null = null

  textures = new Textures(this)
  things: Things

  constructor(doom: Doom, public iVideo: Video) {
    super(doom)

    this.segs = new Segs(this)
    this.things = new Things(this, this.video.width)

    iVideo.camera = this.camera
    iVideo.viewport = this.viewport

    if (iVideo.gui) {
      this.cameraController = iVideo.gui.add(this.camera, 'fov')
        .min(1).max(180)
        .onChange(() => this.camera.updateProjectionMatrix())

      iVideo.gui.add(this.camera, 'near')
        .min(0.1).max(100).step(1)
        .onChange(() => this.camera.updateProjectionMatrix())
      iVideo.gui.add(this.camera, 'far')
        .min(100).max(5000).step(1)
        .onChange(() => this.camera.updateProjectionMatrix())
    }
  }

  private setupLevel(level: Level): void {
    if (this.levelScene) {
      this.levelScene.dispose()
    }

    this.levelScene = new LevelScene(level, this.textures)

    this.iVideo.scene = this.levelScene

    this.levelScene.add(this.things.reset())
  }

  protected setupFrame(player: Player): void {
    if (this.currentLevel !== this.level) {
      this.setupLevel(this.level)
      this.currentLevel = this.level
    }

    super.setupFrame(player)

    // axis are y, z, x
    this.camera.position.set(
      this.viewY >> FRACBITS,
      this.viewZ >> FRACBITS,
      this.viewX >> FRACBITS,
    )

    this.camera.rotation.y = toRad(this.viewAngle) + Math.PI
  }

  renderPlayerView(pl: Player): void {
    this.levelScene?.reset()

    super.renderPlayerView(pl)

    this.setAlphaScreen()
  }


  setAlphaScreen(): void {
    const screen = this.video.screens[0]
    const alpha = screen.alpha
    alpha.fill(255)

    const top = this.viewWindowY
    const bottom = top + this.viewHeight
    const left = this.viewWindowX
    const right = left + this.viewWidth

    for (let y = top; y < bottom; ++y) {
      const offset = screen.width * y;
      alpha.fill(0, left + offset, right + offset)
    }
  }

  executeSetViewSize(): void {
    super.executeSetViewSize()

    // viewport is from bottom to top
    this.camera.aspect = this.viewWidth / this.viewHeight
    this.camera.fov = this.fullScreen ? 64 : 54
    this.camera.updateProjectionMatrix()
    this.cameraController?.updateDisplay()

    this.viewport.set(
      this.viewWindowX,
      this.video.height - this.viewWindowY - this.viewHeight,
      this.viewWidth,
      this.viewHeight)

    this.iVideo.setSize()
  }
}
