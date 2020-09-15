import {
  PerspectiveCamera,
  Scene,
} from 'three'
import { Doom } from '../doom'
import { FRACBITS } from '../misc/fixed'
import { FloorsAndCeilings } from './floors'
import { Level } from '../level/level'
import { Observer } from './observers'
import { Play } from '../play/setup'
import { Player } from '../doom/player'
import { Data as RData } from '../rendering/data'
import { RenderingInterface } from '../rendering/rendering-interface'
import { Textures } from './textures'
import { Things } from './things'
import { Video } from './video'
import { Walls } from './walls'
import { toRad } from '../misc/table'

export class Rendering implements RenderingInterface {
  fullScreen = true;
  viewWindowX = 0
  viewWindowY = 0
  viewWidth: number
  viewHeight: number
  screenSize = 9
  highDetails = true

  setSizeNeeded = false

  private camera = new PerspectiveCamera(
    64, 320 / 200, 0.1, 10000,
  )

  get level(): Level {
    return this.doom.play.level
  }
  private renderedLevel: Level | null = null

  private observers = new Array<Observer>()

  public get play(): Play {
    return this.doom.play
  }
  public get rData(): RData {
    return this.doom.rData
  }

  floors = new FloorsAndCeilings(this)
  textures = new Textures(this)
  things = new Things(this)
  walls = new Walls(this)

  constructor(private doom: Doom, public iVideo: Video) {
    this.viewWidth = iVideo.xWidth
    this.viewHeight = iVideo.xHeight
  }

  executeSetViewSize(): void {
    throw new Error('Method not implemented.')
  }

  renderPlayerView(pl: Player): void {
    if (pl.mo === null) {
      throw 'player.mo = null'
    }

    this.iVideo.camera = this.camera
    this.camera.position.set(
      pl.mo.x >> FRACBITS,
      pl.mo.y >> FRACBITS,
      pl.viewZ >> FRACBITS,
    )

    this.camera.rotation.x = Math.PI / 2
    this.camera.rotation.y = toRad(pl.mo.angle) - Math.PI / 2

    if (this.renderedLevel !== this.level) {
      this.observers.length = 0

      this.renderedLevel = this.level

      this.renderLevel(this.level)
    }

    this.walls.refreshWalls()
    this.floors.refresh()
    this.things.refresh()
  }

  private renderLevel(level: Level): void {
    const scene = new Scene()
    this.iVideo.scene = scene

    level.segs.forEach((seg, i) => this.walls.drawSeg(i, seg, scene))

    level.sectors.forEach((sec, i) => {
      const lines = level.lines.filter(({ frontSector, backSector }) =>
        frontSector === sec || backSector === sec)

      this.floors.drawSector(i, sec, lines, scene)
    })

    this.things.reset(scene, this.camera)
  }

  fillBackScreen(): void {
    // throw new Error('Method not implemented.')
  }
  drawViewBorder(): void {
    // throw new Error('Method not implemented.')
  }
  init(): void {
    // throw new Error('Method not implemented.')
  }

}
