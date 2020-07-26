import { GLOW_SPEED, SLOW_DARK, STROBE_BRIGHT, Special } from './special'
import { FireFlicker } from './lights/fire-flicker'
import { Glow } from './lights/glow'
import { LightFlash } from './lights/light-flash'
import { Line } from '../rendering/defs/line'
import { Play } from './setup'
import { Sector } from '../rendering/defs/sector'
import { Strobe } from './lights/strobe'
import { Tick } from './tick'
import { random } from '../misc/random'

export class Lights {

  get sectors(): readonly Sector[] {
    return this.play.sectors
  }
  private get special(): Special {
    return this.play.special
  }
  private get tick(): Tick {
    return this.play.tick
  }

  constructor(private play: Play) { }

  //
  // T_FireFlicker
  //
  private fireFlicker(flick: FireFlicker): void {
    if (--flick.count) {
      return
    }

    const amount = (random.pRandom() & 3) * 16

    if (flick.sector.lightLevel - amount < flick.minLight) {
      flick.sector.lightLevel = flick.minLight
    } else {
      flick.sector.lightLevel = flick.maxLight - amount
    }

    flick.count = 4
  }

  spawnFireFlicker(sector: Sector): void {
    const flick = new FireFlicker(
      sector,
      this.fireFlicker,
      this,
    )

    this.tick.addThinker(flick)
  }

  //
  // BROKEN LIGHT FLASHING
  //

  //
  // T_LightFlash
  // Do flashing lights.
  //

  lightFlash(flash: LightFlash): void {
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
      this.lightFlash,
      this,
      sector,
    )

    this.tick.addThinker(flash)
  }

  //
  // STROBE LIGHT FLASHING
  //


  //
  // T_StrobeFlash
  //
  strobeFlash(flash: Strobe): void {
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
      this.strobeFlash,
      this,
      sector,
      fastOrSlow,
      STROBE_BRIGHT,
      inSync,
    )
    this.tick.addThinker(flash)

    // nothing special about it during gameplay
    sector.special = 0
  }

  //
  // Start strobing lights (usually from a trigger)
  //
  evStartLightStrobing(line: Line): void {
    let secNum = -1
    let sec: Sector
    while ((secNum = this.special.findSectorFromLineTag(line, secNum)) >= 0) {
      sec = this.sectors[secNum]
      if (sec.specialData) {
        continue
      }

      this.spawnStrobeFlash(sec, SLOW_DARK, 0)
    }
  }

  //
  // TURN LINE'S TAG LIGHTS OFF
  //
  evTurnTagLightsOff(line: Line): void {
    let min: number
    let tSec: Sector | null
    let tempLine: Line

    for (let i = 0, sector = this.sectors[i];
      i < this.play.numSectors;
      i++, sector = this.sectors[i]) {
      if (sector.tag === line.tag) {
        min = sector.lightLevel
        for (i = 0; i < sector.lineCount; i++) {
          tempLine = sector.lines[i]
          tSec = sector.getNextSector(tempLine)
          if (!tSec) {
            continue
          }
          if (tSec.lightLevel < min) {
            min = tSec.lightLevel
          }
        }
        sector.lightLevel = min
      }
    }
  }

  //
  // TURN LINE'S TAG LIGHTS ON
  //
  evLightTurnOn(line: Line, bright: number): void {
    let tempLine: Line
    let temp: Sector | null

    for (let i = 0, sector = this.sectors[i];
      i < this.play.numSectors;
      i++, sector = this.sectors[i]) {
      if (sector.tag === line.tag) {
        // bright = 0 means to search
        // for highest light level
        // surrounding sector
        if (!bright) {
          for (let j = 0; j < sector.lineCount; j++) {
            tempLine = sector.lines[j]
            temp = sector.getNextSector(tempLine)

            if (!temp) {
              continue
            }

            if (temp.lightLevel > bright) {
              bright = temp.lightLevel
            }
          }
        }
        sector.lightLevel = bright
      }
    }
  }

  //
  // Spawn glowing light
  //
  glow(g: Glow): void {
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
      this.glow,
      this,
      sector,
    )
    this.tick.addThinker(glow)

    sector.special = 0
  }

}
