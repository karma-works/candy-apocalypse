import {
  Face3,
  Geometry,
  Material,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector2,
  Vector3,
} from 'three'
import { HeightObserver, Observer, ObserverType } from './observers'
import { Doom } from '../doom'
import { FRACUNIT } from '../misc/fixed'
import { Level } from '../level/level'
import { Player } from '../doom/player'
import { RenderingInterface } from '../rendering/rendering-interface'
import { Sector } from '../rendering/defs/sector'
import { Seg } from '../rendering/segs/seg'
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

  private observers = new Array<Observer>()

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
      this.observers.length = 0

      this.renderedLevel = this.level

      this.renderLevel(this.level)
    }

    this.updateObserved()
  }

  private renderLevel(level: Level): void {
    const scene = new Scene()
    this.iVideo.scene = scene

    scene.add(this.cameraLight)

    let segs: Seg[]
    level.subSectors.forEach(ss => {
      segs = level.segs.slice(ss.firstSeg, ss.firstSeg + ss.numSegs)
      if (ss.sector) {
        this.drawSector(ss.sector, segs, scene)
      }
    })
  }

  private updateObserved(): void {
    this.observers.forEach(o => {
      switch (o.type) {
      case ObserverType.BottomHeight:
      case ObserverType.TopHeight:
        this.updateWall(o)
        break
      }
    })
  }

  private drawSector(sec: Sector, segs: Seg[], scene: Scene): void {
    const meshes: Mesh<Geometry, Material>[] = []
    segs.forEach(l => {
      if (l.sideDef.midTexture) {
        meshes.push(this.drawWall(l, l.frontSector.floorHeight, l.frontSector.ceilingHeight))
        if (l.frontSector.tag) {
          this.observers.push({
            type: ObserverType.BottomHeight,
            mesh: meshes[meshes.length - 1],
            sector: l.frontSector,
            height: 'floorHeight',
          }, {
            type: ObserverType.TopHeight,
            mesh: meshes[meshes.length - 1],
            sector: l.frontSector,
            height: 'ceilingHeight',
          })
        }
      } else {
        if (l.sideDef.bottomTexture && l.backSector) {
          meshes.push(this.drawWall(l, l.frontSector.floorHeight, l.backSector.floorHeight))
          if (l.frontSector.tag) {
            this.observers.push({
              type: ObserverType.BottomHeight,
              mesh: meshes[meshes.length - 1],
              sector: l.frontSector,
              height: 'floorHeight',
            })
          }
          if (l.backSector.tag) {
            this.observers.push({
              type: ObserverType.TopHeight,
              mesh: meshes[meshes.length - 1],
              sector: l.backSector,
              height: 'floorHeight',
            })
          }
        }
        if (l.sideDef.topTexture && l.backSector) {
          meshes.push(this.drawWall(l, l.backSector.ceilingHeight, l.frontSector.ceilingHeight))
          if (l.backSector.tag) {
            this.observers.push({
              type: ObserverType.BottomHeight,
              mesh: meshes[meshes.length - 1],
              sector: l.backSector,
              height: 'ceilingHeight',
            })
          }
          if (l.frontSector.tag) {
            this.observers.push({
              type: ObserverType.TopHeight,
              mesh: meshes[meshes.length - 1],
              sector: l.frontSector,
              height: 'ceilingHeight',
            })
          }
        }
      }
    })

    if (meshes.length > 0) {
      scene.add(...meshes)
    }
  }

  private drawWall(l: Seg, bottom: number, top: number): Mesh<Geometry, Material> {
    const geometry = new Geometry()
    geometry.vertices.push(
      new Vector3(l.v1.x / FRACUNIT, l.v1.y / FRACUNIT, top / FRACUNIT),
      new Vector3(l.v2.x / FRACUNIT, l.v2.y / FRACUNIT, top / FRACUNIT),
      new Vector3(l.v1.x / FRACUNIT, l.v1.y / FRACUNIT, bottom / FRACUNIT),
      new Vector3(l.v2.x / FRACUNIT, l.v2.y / FRACUNIT, bottom / FRACUNIT),
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
      }),
    )

    return mesh
  }
  private updateWall(o: HeightObserver): void {
    let vertices = []
    switch (o.type) {
    case ObserverType.BottomHeight:
      vertices = [ o.mesh.geometry.vertices[2], o.mesh.geometry.vertices[3] ]
      break
    case ObserverType.TopHeight:
      vertices = [ o.mesh.geometry.vertices[0], o.mesh.geometry.vertices[1] ]
      break
    }

    const newZ = o.sector[o.height] / FRACUNIT

    vertices.forEach(v => {
      if (v.z !== newZ) {
        v.z = newZ
        o.mesh.geometry.verticesNeedUpdate = true
      }
    })
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
