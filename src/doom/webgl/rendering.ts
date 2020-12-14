import {
  PerspectiveCamera,
  Scene,
} from 'three'
import { Doom } from '../doom'
import { FRACBITS } from '../misc/fixed'
import { Rendering as LegacyRendering } from '../rendering/rendering'
import { Level } from '../level/level'
import { Plane } from './plane'
import { Player } from '../doom/player'
import { Segs } from './segs'
import { Textures } from './textures'
import { Things } from './things'
import { Video } from './video'
import { toRad } from '../misc/table'

export class Rendering extends LegacyRendering {

  private camera = new PerspectiveCamera(
    64, 320 / 200, 0.1, 10000,
  )
  private renderedLevel: Level | null = null

  plane: Plane
  segs: Segs = new Segs(this)
  textures = new Textures(this)
  things: Things

  constructor(doom: Doom, public iVideo: Video) {
    super(doom)

    this.plane = new Plane(this, this.video.width, this.video.height)
    this.things = new Things(this, this.video.width)

    iVideo.camera = this.camera
  }

  private setupLevel(level: Level): void {
    const scene = new Scene()
    this.iVideo.scene = scene

    this.segs.reset()
    this.plane.reset()
    this.things.reset(scene)

    if (this.iVideo.renderer) {
      scene.background = this.textures.getSkyTexture(
        level.sky.texture, this.iVideo.renderer,
      )
    }

    level.segs.forEach((seg, i) => this.segs.createSeg(i, seg, scene))

    level.sectors.forEach((sec, i) => {
      const lines = level.lines.filter(({ frontSector, backSector }) =>
        frontSector === sec || backSector === sec)

      this.plane.createPlane(i, sec, lines, scene)
    })
  }

  protected setupFrame(player: Player): void {
    if (this.renderedLevel !== this.level) {
      this.setupLevel(this.level)
      this.renderedLevel = this.level
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
}
