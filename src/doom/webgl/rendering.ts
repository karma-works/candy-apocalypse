import {
  DoubleSide,
  Face3,
  Geometry,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector2,
  Vector3,
} from 'three'
import { Doom } from '../doom'
import { FRACUNIT } from '../misc/fixed'
import { Level } from '../level/level'
import { Line } from '../rendering/defs/line'
import { Player } from '../doom/player'
import { RenderingInterface } from '../rendering/rendering-interface'
import { Sector } from '../rendering/defs/sector'
import { Video } from './video'
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
  private cameraLight = new PointLight(0xffffff, 0.2, 0, 2)

  get level(): Level {
    return this.doom.play.level
  }
  private renderedLevel: Level | null = null

  constructor(private doom: Doom, private iVideo: Video) {
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
      pl.mo.x / FRACUNIT,
      pl.mo.y / FRACUNIT,
      pl.viewZ / FRACUNIT,
    )
    this.cameraLight.position.set(
      pl.mo.x / FRACUNIT,
      pl.mo.y / FRACUNIT,
      pl.viewZ / FRACUNIT,
    )

    this.camera.rotation.x = Math.PI / 2
    this.camera.rotation.y = toRad(pl.mo.angle) - Math.PI / 2

    if (this.renderedLevel !== this.level) {
      this.renderedLevel = this.level

      this.renderLevel(this.level)
    }
  }

  private renderLevel(level: Level): void {
    const scene = new Scene()
    this.iVideo.scene = scene

    scene.add(this.cameraLight)

    level.sectors.forEach(sec => {
      this.drawSector(sec, scene)
    })
  }

  private drawSector(sec: Sector, scene: Scene): void {
    sec.lines.forEach(l => {
      this.drawLine(l, sec, scene)
    })
  }

  private drawLine(l: Line, sec: Sector, scene: Scene): void {
    const geometry = new Geometry()
    geometry.vertices.push(
      new Vector3(l.v1.x / FRACUNIT, l.v1.y / FRACUNIT, sec.ceilingHeight / FRACUNIT),
      new Vector3(l.v2.x / FRACUNIT, l.v2.y / FRACUNIT, sec.ceilingHeight / FRACUNIT),
      new Vector3(l.v1.x / FRACUNIT, l.v1.y / FRACUNIT, sec.floorHeight / FRACUNIT),
      new Vector3(l.v2.x / FRACUNIT, l.v2.y / FRACUNIT, sec.floorHeight / FRACUNIT),
    )
    geometry.faces.push(
      new Face3(0, 2, 1),
      new Face3(2, 3, 1),
    )
    geometry.faceVertexUvs.push([
      [
        new Vector2(0, 1),
        new Vector2(0, 0),
        new Vector2(1, 1),
      ],
      [
        new Vector2(0, 0),
        new Vector2(1, 0),
        new Vector2(1, 1),
      ],
    ])

    geometry.computeFaceNormals()
    geometry.computeVertexNormals()

    const mesh = new Mesh(
      geometry,
      new MeshPhongMaterial({
        color: 0xffffff,
        side: DoubleSide,
      }),
    )

    scene.add(mesh)
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
