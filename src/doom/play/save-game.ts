import { Ceiling, MAX_CEILINGS } from './ceiling/ceiling'
import { Ceilings } from './ceilings'
import { Door } from './doors/door'
import { Doors } from './doors'
import { Floor } from './floor'
import { FloorMove } from './floor/floor-move'
import { Game } from '../game/game'
import { Glow } from './lights/glow'
import { LightFlash } from './lights/light-flash'
import { Lights } from './lights'
import { Line } from '../rendering/defs/line'
import { MAX_PLAYERS } from '../global/doomdef'
import { MObj } from './mobj/mobj'
import { MObjHandler } from './mobj-handler'
import { MapUtils } from './map-utils'
import { Plat } from './plats/plat'
import { Plats } from './plats'
import { Play } from './setup'
import { Player } from '../doom/player'
import { Sector } from '../rendering/defs/sector'
import { Side } from '../rendering/defs/side'
import { Strobe } from './lights/strobe'
import { Thinker } from '../doom/think'
import { Tick } from './tick'

// Pads save_p to a 4-byte boundary
//  so that the load/save works on SGI&Gecko.
function padSaveP(saveP: number): number {
  return saveP + (4 - (saveP & 3) & 3)
}

const enum ThinkerClass {
  End,
  MObj,
}
const enum Specials {
  Ceiling,
  Door,
  Floor,
  Plat,
  Flash,
  Strobe,
  Glow,
  EndSpecial,
}

export class SaveGame {
  private get ceilings(): Ceilings {
    return this.play.ceilings
  }
  private get doors(): Doors {
    return this.play.doors
  }
  private get floor(): Floor {
    return this.play.floor
  }
  private get game(): Game {
    return this.play.game
  }
  private get lights(): Lights {
    return this.play.lights
  }
  private get mapUtils(): MapUtils {
    return this.play.mapUtils
  }
  private get mObjHandler(): MObjHandler {
    return this.play.mObjHandler
  }
  private get plats(): Plats {
    return this.play.plats
  }
  private get tick(): Tick {
    return this.play.tick
  }


  constructor(private play: Play) { }

  //
  // P_ArchivePlayers
  //
  archivePlayers(buffer: ArrayBuffer, saveP: number): number {
    const int8 = new Uint8Array(buffer)
    let player: Player
    let temp: Uint8Array

    for (let i = 0; i < MAX_PLAYERS; ++i) {
      if (!this.game.playerInGame[i]) {
        continue
      }

      saveP = padSaveP(saveP)

      player = this.game.players[i]
      temp = new Uint8Array(player.archive())
      int8.set(temp, saveP)
      saveP += temp.length
    }

    return saveP
  }

  //
  // P_UnArchivePlayers
  //
  unArchivePlayers(buffer: ArrayBuffer, saveP: number): number {
    for (let i = 0; i < MAX_PLAYERS; ++i) {
      if (!this.game.playerInGame[i]) {
        continue
      }

      saveP = padSaveP(saveP)

      this.game.players[i].unArchive(buffer.slice(saveP))
      saveP += Player.sizeOf
    }

    return saveP
  }


  //
  // P_ArchiveWorld
  //
  archiveWorld(buffer: ArrayBuffer, saveP: number): number {
    const int8 = new Uint8Array(buffer)
    let temp: Uint8Array

    // do sectors
    for (let i = 0, sec = this.play.sectors[i];
      i < this.play.numSectors;
      ++i, sec = this.play.sectors[i]
    ) {
      temp = new Uint8Array(sec.archive())
      int8.set(temp, saveP)
      saveP += temp.length
    }

    // do lines
    for (let i = 0, li = this.play.lines[i];
      i < this.play.numLines;
      ++i, li = this.play.lines[i]
    ) {
      temp = new Uint8Array(li.archive())
      int8.set(temp, saveP)
      saveP += temp.length

      for (let j = 0; j < 2; ++j) {
        if (li.sideNum[j] === -1) {
          continue
        }

        temp = new Uint8Array(this.play.sides[li.sideNum[j]].archive())
        int8.set(temp, saveP)
        saveP += temp.length
      }
    }

    return saveP
  }

  //
  // P_UnArchiveWorld
  //
  unArchiveWorld(buffer: ArrayBuffer, saveP: number): number {
    // do sectors
    for (let i = 0, sec = this.play.sectors[i];
      i < this.play.numSectors;
      ++i, sec = this.play.sectors[i]
    ) {
      sec.unArchive(buffer.slice(saveP))
      saveP += Sector.sizeOf
    }

    // do lines
    for (let i = 0, li = this.play.lines[i];
      i < this.play.numLines;
      ++i, li = this.play.lines[i]
    ) {
      li.unArchive(buffer.slice(saveP))
      saveP += Line.sizeOf

      for (let j = 0; j < 2; ++j) {
        if (li.sideNum[j] === -1) {
          continue
        }

        this.play.sides[li.sideNum[j]].unArchive(buffer.slice(saveP))
        saveP += Side.sizeOf
      }
    }

    return saveP
  }

  //
  // P_ArchiveThinkers
  //
  archiveThinkers(buffer: ArrayBuffer, saveP: number): number {
    const int8 = new Uint8Array(buffer)
    let mObj: MObj
    let temp: Uint8Array

    // save off the current thinkers
    let th: Thinker<unknown, [unknown]> | null
    for (th = this.tick.thinkerCap.next;
      th !== null && th !== this.tick.thinkerCap;
      th = th.next
    ) {
      if (th.func === this.mObjHandler.thinker) {
        int8[saveP++] = ThinkerClass.MObj
        saveP = padSaveP(saveP)

        mObj = th as MObj
        temp = new Uint8Array(mObj.archive())
        int8.set(temp, saveP)
        saveP += temp.length
      }
    }

    int8[saveP++] = ThinkerClass.End

    return saveP
  }

  //
  // P_UnArchiveThinkers
  //
  unArchiveThinkers(buffer: ArrayBuffer, saveP: number): number {
    const int8 = new Uint8Array(buffer)

    // remove all the current thinkers
    let currentThinker = this.tick.thinkerCap.next
    let next: Thinker<unknown, [unknown]> | null
    while (currentThinker && currentThinker !== this.tick.thinkerCap) {
      next = currentThinker.next

      if (currentThinker.func === this.mObjHandler.thinker) {
        this.mObjHandler.removeMObj(currentThinker as MObj)
      }

      currentThinker = next
    }

    this.tick.initThinkers()

    // read in saved thinkers
    let tClass: ThinkerClass
    let mObj: MObj
    // eslint-disable-next-line no-constant-condition
    while (true) {
      tClass = int8[saveP++]
      switch (tClass) {
      case ThinkerClass.End:
        // end of list
        return saveP

      case ThinkerClass.MObj:
        saveP = padSaveP(saveP)

        mObj = new MObj(buffer.slice(saveP), this.mObjHandler.thinker, this.mObjHandler)
        saveP += MObj.sizeOf

        this.mapUtils.setThingPosition(mObj)

        mObj.setZ()

        this.tick.addThinker(mObj)
        break
      default:
        throw `Unknown tclass ${tClass} in savegame`
      }
    }
  }

  //
  // Things to handle:
  //
  // T_MoveCeiling, (ceiling_t: sector_t * swizzle), - active list
  // T_VerticalDoor, (vldoor_t: sector_t * swizzle),
  // T_MoveFloor, (floormove_t: sector_t * swizzle),
  // T_LightFlash, (lightflash_t: sector_t * swizzle),
  // T_StrobeFlash, (strobe_t: sector_t *),
  // T_Glow, (glow_t: sector_t *),
  // T_PlatRaise, (plat_t: sector_t *), - active list
  //
  archiveSpecials(buffer: ArrayBuffer, saveP: number): number {
    const int8 = new Uint8Array(buffer)
    let ceiling: Ceiling
    let door: Door
    let floor: FloorMove
    let plat: Plat
    let flash: LightFlash
    let strobe: Strobe
    let glow: Glow
    let temp: Uint8Array

    // save off the current thinkers
    let th: Thinker<unknown, [unknown]> | null
    for (th = this.tick.thinkerCap.next;
      th !== null && th !== this.tick.thinkerCap;
      th = th.next
    ) {
      if (th.func === null) {
        let i: number
        for (i = 0; i < MAX_CEILINGS; ++i) {
          if (this.ceilings.activeCeilings[i] === th) {
            break
          }
        }

        if (i < MAX_CEILINGS) {
          int8[saveP++] = Specials.Ceiling
          saveP = padSaveP(saveP)
          ceiling = th as Ceiling
          temp = new Uint8Array(ceiling.archive())
          int8.set(temp, saveP)
          saveP += temp.length
        }

        continue
      }

      if (th.func === this.ceilings.moveCeiling) {
        int8[saveP++] = Specials.Ceiling
        saveP = padSaveP(saveP)
        ceiling = th as Ceiling
        temp = new Uint8Array(ceiling.archive())
        int8.set(temp, saveP)
        saveP += temp.length
        continue
      }

      if (th.func === this.doors.verticalDoor) {
        int8[saveP++] = Specials.Door
        saveP = padSaveP(saveP)
        door = th as Door
        temp = new Uint8Array(door.archive())
        int8.set(temp, saveP)
        saveP += temp.length
        continue
      }

      if (th.func === this.floor.moveFloor) {
        int8[saveP++] = Specials.Floor
        saveP = padSaveP(saveP)
        floor = th as FloorMove
        temp = new Uint8Array(floor.archive())
        int8.set(temp, saveP)
        saveP += temp.length
        continue
      }

      if (th.func === this.plats.platRaise) {
        int8[saveP++] = Specials.Plat
        saveP = padSaveP(saveP)
        plat = th as Plat
        temp = new Uint8Array(plat.archive())
        int8.set(temp, saveP)
        saveP += temp.length
        continue
      }

      if (th.func === this.lights.lightFlash) {
        int8[saveP++] = Specials.Flash
        saveP = padSaveP(saveP)
        flash = th as LightFlash
        temp = new Uint8Array(flash.archive())
        int8.set(temp, saveP)
        saveP += temp.length
        continue
      }

      if (th.func === this.lights.strobeFlash) {
        int8[saveP++] = Specials.Strobe
        saveP = padSaveP(saveP)
        strobe = th as Strobe
        temp = new Uint8Array(strobe.archive())
        int8.set(temp, saveP)
        saveP += temp.length
        continue
      }

      if (th.func === this.lights.glow) {
        int8[saveP++] = Specials.Glow
        saveP = padSaveP(saveP)
        glow = th as Glow
        temp = new Uint8Array(glow.archive())
        int8.set(temp, saveP)
        saveP += temp.length
        continue
      }
    }

    int8[saveP++] = Specials.EndSpecial

    return saveP
  }

  //
  // P_UnArchiveSpecials
  //
  unArchiveSpecials(buffer: ArrayBuffer, saveP: number): number {
    const int8 = new Uint8Array(buffer)
    let ceiling: Ceiling
    let door: Door
    let floor: FloorMove
    let plat: Plat
    let flash: LightFlash
    let strobe: Strobe
    let glow: Glow

    // read in saved thinkers
    let tClass: Specials
    // eslint-disable-next-line no-constant-condition
    while (true) {
      tClass = int8[saveP++]
      switch (tClass) {
      case Specials.EndSpecial:
        // end of list
        return saveP

      case Specials.Ceiling:
        saveP = padSaveP(saveP)

        ceiling = new Ceiling(this.ceilings.moveCeiling, this.ceilings, buffer.slice(saveP))
        saveP += Ceiling.sizeOf

        this.tick.addThinker(ceiling)
        this.ceilings.addActiveCeiling(ceiling)
        break

      case Specials.Door:
        saveP = padSaveP(saveP)

        door = new Door(this.doors.verticalDoor, this.doors, buffer.slice(saveP))
        saveP += Door.sizeOf

        this.tick.addThinker(door)
        break

      case Specials.Floor:
        saveP = padSaveP(saveP)

        floor = new FloorMove(this.floor.moveFloor, this.floor, buffer.slice(saveP))
        saveP += FloorMove.sizeOf

        this.tick.addThinker(floor)
        break

      case Specials.Plat:
        saveP = padSaveP(saveP)

        plat = new Plat(this.plats.platRaise, this.plats, buffer.slice(saveP))
        saveP += Plat.sizeOf

        this.tick.addThinker(plat)
        this.plats.addActivePlat(plat)
        break

      case Specials.Flash:
        saveP = padSaveP(saveP)

        flash = new LightFlash(this.lights.lightFlash, this.lights, buffer.slice(saveP))
        saveP += LightFlash.sizeOf

        this.tick.addThinker(flash)
        break

      case Specials.Strobe:
        saveP = padSaveP(saveP)

        strobe = new Strobe(this.lights.strobeFlash, this.lights, buffer.slice(saveP))
        saveP += Strobe.sizeOf

        this.tick.addThinker(strobe)
        break

      case Specials.Glow:
        saveP = padSaveP(saveP)

        glow = new Glow(this.lights.glow, this.lights, buffer.slice(saveP))
        saveP += Glow.sizeOf

        this.tick.addThinker(glow)
        break

      default:
        throw `P_UnarchiveSpecials:Unknown tclass ${tClass} in savegame`
      }
    }
  }
}
