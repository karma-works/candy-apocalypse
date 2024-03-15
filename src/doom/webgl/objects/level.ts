import { Level as DoomLevel } from '../../level/level'
import { MObj as DoomMObj } from '../../play/mobj/mobj';
import { Group } from 'three';
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
    this.sectors = sectors.map(sec => new Sector(sec, segs, lines, textures, level.sky))
    this.add(...this.sectors)

    sectors.forEach(s => this.updateLinkedThings(s.id, s.thingList, s.lightLevel))
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

  updateLinkedThings(secId: number, thing: DoomMObj | null, lightLevel: number) {
    if (thing === null) {
      return
    }

    let mObj = this.mObjs[thing.id]
    if (mObj === undefined) {
      mObj = new MObj(thing, this.textures)
      this.thingsGroup.add(mObj)
      this.mObjs[thing.id] = mObj
    }

    mObj.material.stencilRef = secId

    mObj.update(lightLevel)

    this.updateLinkedThings(secId, thing.sNext, lightLevel)
  }
}
