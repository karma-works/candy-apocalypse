import { Group, Scene } from 'three';
import { Level as DoomLevel } from '../../level/level'
import { Sector } from './sector';
import { TextureLoader } from '../texture-loader';

export class LevelGroup extends Group {
  sectors: Sector[];

  constructor(
    level: DoomLevel,
    textures: TextureLoader,
  ) {
    super()

    this.name = `e${level.episode}m${level.map}`

    const { flatNum } = level.sky

    const { sectors, segs, lines } = level
    this.sectors = sectors.map(sec => new Sector(sec, segs, lines, textures, flatNum))
    this.add(...this.sectors)
  }

  dispose(): void {
    this.sectors.forEach(s => s.dispose())
  }

  // Make all sectors invisible before updating them for the next render
  reset(): void {
    this.sectors.forEach(s => s.visible = false)
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
}
