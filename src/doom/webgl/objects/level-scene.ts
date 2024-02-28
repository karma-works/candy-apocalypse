import { Level as DoomLevel } from '../../level/level'
import { Scene } from 'three';
import { Sector } from './sector';
import { TextureLoader } from '../texture-loader';

export class LevelScene extends Scene {
  sectors: Sector[];

  constructor(
    level: DoomLevel,
    textures: TextureLoader,
  ) {
    super()

    const { flatNum, texture } = level.sky
    this.background = textures.getSkyTexture(texture)

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
