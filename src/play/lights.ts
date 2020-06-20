import { GLOW_SPEED, STROBE_BRIGHT } from './special'
import { Glow } from './lights/glow'
import { LightFlash } from './lights/light-flash'
import { Play } from './setup'
import { Sector } from '../rendering/sector'
import { Strobe } from './lights/strobe'
import { Tick } from './tick'
import { random } from '../misc/random'

export class Lights {


  private get tick(): Tick {
    return this.play.tick
  }

  constructor(private play: Play) { }

  //
  // BROKEN LIGHT FLASHING
  //

  //
  // T_LightFlash
  // Do flashing lights.
  //

  async lightFlash(flash: LightFlash): Promise<void> {
    if (--flash.count) {
      return
    }

    if (flash.sector.lightLevel === flash.maxLight) {
      flash.sector.lightLevel = flash.minLight
      flash.count = (random.pRandom() & flash.minTime) + 1
    } else {
      flash.sector.lightLevel = flash.maxLight
      flash.count = (random.pRandom() & flash.maxTime) + 1
    }
  }

  //
  // P_SpawnLightFlash
  // After the map has been loaded, scan each sector
  // for specials that spawn thinkers
  //
  spawnLightFlash(sector: Sector): void {
    // nothing special about it during gameplay
    sector.special = 0

    const flash = new LightFlash(
      sector,
      this.lightFlash,
      this,
    )

    this.tick.addThinker(flash)
  }

  //
  // STROBE LIGHT FLASHING
  //


  //
  // T_StrobeFlash
  //
  async strobeFlash(flash: Strobe): Promise<void> {
    if (--flash.count) {
      return
    }

    if (flash.sector.lightLevel === flash.minLight) {
      flash.sector.lightLevel = flash.maxLight
      flash.count = flash.brightTime
    } else {
      flash.sector.lightLevel = flash.minLight
      flash.count = flash.darkTime
    }
  }

  //
  // P_SpawnStrobeFlash
  // After the map has been loaded, scan each sector
  // for specials that spawn thinkers
  //
  spawnStrobeFlash(sector: Sector, fastOrSlow: number, inSync: number): void {
    const flash = new Strobe(
      sector,
      this.strobeFlash,
      this,
      fastOrSlow,
      STROBE_BRIGHT,
      inSync,
    )
    this.tick.addThinker(flash)

    // nothing special about it during gameplay
    sector.special = 0

  }

  //
  // Spawn glowing light
  //
  async glow(g: Glow): Promise<void> {
    switch (g.direction) {
    case -1:
      // DOWN
      g.sector.lightLevel -= GLOW_SPEED
      if (g.sector.lightLevel <= g.minLight) {
        g.sector.lightLevel += GLOW_SPEED
        g.direction = 1
      }
      break
    case 1:
      // UP
      g.sector.lightLevel += GLOW_SPEED
      if (g.sector.lightLevel >= g.maxLight) {
        g.sector.lightLevel -= GLOW_SPEED
        g.direction = -1
      }
      break
    }
  }
  spawnGlowingLight(sector: Sector): void {
    const glow = new Glow(
      sector,
      this.glow,
      this,
    )
    this.tick.addThinker(glow)

    sector.special = 0
  }

}
