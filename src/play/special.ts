import { Game } from '../game/game'
import { Lights } from './lights'
import { Line } from '../rendering/line'
import { Play } from './setup'
import { Sector } from '../rendering/sector'
import { Wad } from '../wad/wad'

export const GLOW_SPEED = 8
export const STROBE_BRIGHT = 5
const SLOW_DARK = 35

//
//      Animating line specials
//
const MAX_LINE_ANIMS = 64

export class Special {

  private get game(): Game {
    return this.play.game
  }
  private get lights(): Lights {
    return this.play.lights
  }

  constructor(private play: Play) { }

  //
  // SPECIAL SPAWNING
  //

  //
  // P_SpawnSpecials
  // After the map has been loaded, scan for specials
  //  that spawn thinkers
  //
  private numLineSpecials = 0
  private lineSpecialList = Array.from({ length: MAX_LINE_ANIMS },
    () => new Line())

  spawnSpecials(): void {
    // Init special SECTORs.
    let sector: Sector
    for (let i = 0; i < this.play.numSectors; ++i) {
      sector = this.play.sectors[i]

      if (!sector.special) {
        continue
      }

      switch (sector.special) {
      case 1:
        // FLICKERING LIGHTS
        this.lights.spawnLightFlash(sector)
        break

      case 2:
        // STROBE FAST
        debugger
        break
      case 3:
        // STROBE SLOW
        debugger
        break
      case 4:
        // STROBE FAST/DEATH SLIME
        debugger
        break
      case 8:
        // GLOWING LIGHT
        this.lights.spawnGlowingLight(sector)
        break
      case 9:
        // SECRET SECTOR *
        this.game.totalSecret++
        break
      case 10:
        // DOOR CLOSE IN 30 SECONDS
        debugger
        break
      case 12:
        // SYNC STROBE SLOW *
        this.lights.spawnStrobeFlash(sector, SLOW_DARK, 1)
        break
      case 13:
        // SYNC STROBE FAST
        debugger
        break
      case 14:
        // DOOR RAISE IN 5 MINUTES
        debugger
        break
      case 17:
        debugger
        break
      }
    }

    // Init line EFFECTs
    this.numLineSpecials = 0
    for (let i = 0; i < this.play.numLines; ++i) {
      switch (this.play.lines[i].special) {
      case 48:
        // EFFECT FIRSTCOL SCROLL+
        this.lineSpecialList[this.numLineSpecials] =
          this.play.lines[i]
        this.numLineSpecials++
        break
      }
    }

  }

}
