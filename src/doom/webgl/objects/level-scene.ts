import { Group, Scene } from 'three';
import { Level as DoomLevel } from '../../level/level'
import { MObj as DoomMObj } from '../../play/mobj/mobj';
import { MObj } from './mobj';
import { Sector } from './sector';
import { TextureLoader } from '../texture-loader';

export class LevelGroup extends Group {
  sectors: Sector[];

  thingsGroup = new Group()
  mObjs: MObj[] = []

  constructor(
    level: DoomLevel,
    private textures: TextureLoader,
  ) {
    super()

    this.name = `e${level.episode}m${level.map}`

    const { sectors, segs, lines } = level
    this.sectors = sectors.map(sec => new Sector(sec, segs, lines, textures))
    this.add(...this.sectors)

    sectors.forEach(s => this.updateLinkedThings(s.thingList, 255))
    this.add(this.thingsGroup)
  }

  dispose(): void {
    this.sectors.forEach(s => s.dispose())
    this.mObjs.forEach(m => m.dispose())
  }

  // Make all sectors invisible before updating them for the next render
  reset(): void {
    this.sectors.forEach(s => s.visible = false)
    this.mObjs.forEach(m => m.visible = false)
  }

  // Update a sector height, texture map and colors.
  // Make it visible.
  updateSector(secId: number, lightLevel: number): void {
    this.sectors[secId].update(lightLevel)
  }
  // Update a seg height, texture map and colors.
  updateSeg(secId: number, segId: number, lightLevel: number): void {
    this.sectors[secId].updateSeg(segId, lightLevel)
  }

  updateLinkedThings(thing: DoomMObj | null, lightLevel: number) {
    if (thing === null) {
      return
    }

    let mObj = this.mObjs[thing.id]
    if (mObj === undefined) {
      mObj = new MObj(thing, this.textures)
      this.thingsGroup.add(mObj)
      this.mObjs[thing.id] = mObj
    }

    mObj.update(lightLevel)

    this.updateLinkedThings(thing.sNext, lightLevel)
  }
}

export class LevelScene extends Scene {
  levelGroup: LevelGroup;

  constructor(
    level: DoomLevel,
    textures: TextureLoader,
  ) {
    super()

    this.add(this.levelGroup = new LevelGroup(level, textures))

    const { texture } = level.sky
    this.background = textures.getSkyTexture(texture)
  }

  dispose(): void {
    this.levelGroup.dispose()
  }
  reset(): void {
    this.levelGroup.reset()
  }
  updateSector(secId: number, lightLevel: number): void {
    this.levelGroup.updateSector(secId, lightLevel)
  }
  updateSeg(secId: number, segId: number, lightLevel: number): void {
    this.levelGroup.updateSeg(secId, segId, lightLevel)
  }
  updateLinkedThings(thingList: DoomMObj | null, lightLevel: number) {
    this.levelGroup.updateLinkedThings(thingList, lightLevel)
  }
}
