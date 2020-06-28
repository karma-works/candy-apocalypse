import { ANG270, ANG90 } from '../misc/table'
import { MObj, MObjFlag } from './mobj'
import { Game } from '../game/game'
import { MELEE_RANGE } from './local'
import { MObjHandler } from './mobj-handler'
import { MapUtils } from './map-utils'
import { Play } from './setup'
import { Player } from '../doom/player'
import { Rendering } from '../rendering/rendering'
import { Sight } from './sight'
// import { PSpriteDef } from './sprite'

export class Enemy {

  private get game(): Game {
    return this.play.game
  }
  private get mapUtils(): MapUtils {
    return this.play.mapUtils
  }
  private get mObjHandler(): MObjHandler {
    return this.play.mObjHandler
  }
  private get rendering(): Rendering {
    return this.play.rendering
  }
  private get sight(): Sight {
    return this.play.sight
  }
  constructor(private play: Play) { }

  //
  // P_LookForPlayers
  // If allaround is false, only look 180 degrees in front.
  // Returns true if a player is targeted.
  //
  lookForPlayers(actor: MObj, allAround: boolean): boolean {
    let c = 0
    const stop = actor.lastLook - 1 & 3
    let player: Player
    let angle: number
    let dist: number

    for (;; actor.lastLook = actor.lastLook + 1 & 3) {
      if (!this.game.playerInGame[actor.lastLook]) {
        continue
      }

      if (c++ === 2 ||
        actor.lastLook === stop
      ) {
        // done looking
        return false
      }

      player = this.game.players[actor.lastLook]

      if (player.health <= 0) {
        // dead
        continue
      }

      if (player.mo === null) {
        throw 'player.mo = null'
      }

      if (!this.sight.checkSight(actor, player.mo)) {
        // out of sight
        continue
      }

      if (!allAround) {
        angle = this.rendering.pointToAngle2(
          actor.x,
          actor.y,
          player.mo.x,
          player.mo.y,
        ) - actor.angle >>> 0

        if (angle > ANG90 && angle < ANG270) {
          dist = this.mapUtils.aproxDistance(
            player.mo.x - actor.x,
            player.mo.y - actor.y,
          )

          // if real close, react anyway
          if (dist > MELEE_RANGE) {
            // behind back
            continue
          }
        }
      }

      actor.target = player.mo
      return true
    }

    return false
  }

  keenDie(/* mo: MObj */): void {
    debugger
  }

  //
  // ACTION ROUTINES
  //

  //
  // A_Look
  // Stay in state until a player is sighted.
  //
  look(actor: MObj): void {
    if (actor.subSector === null) {
      throw 'actor.subSector = null'
    }
    if (actor.subSector.sector === null) {
      throw 'actor.subSector.sector = null'
    }

    actor.threshold = 0
    const targ = actor.subSector.sector.soundTarget

    if (targ && targ.flags & MObjFlag.Shootable) {
      actor.target = targ

      if (actor.flags & MObjFlag.Ambush) {
        if (this.sight.checkSight(actor, actor.target)) {
          return this.lookGoToSeeYou(actor)
        }
      } else {
        return this.lookGoToSeeYou(actor)
      }
    }

    if (!this.lookForPlayers(actor, false)) {
      return
    }

    return this.lookGoToSeeYou(actor)
  }

  private lookGoToSeeYou(actor: MObj): void {
    this.mObjHandler.setMObjState(actor, actor.info.seeState)
  }

  chase(/* actor: MObj */): void {
    debugger
  }

  faceTarget(/* actor: MObj */): void {
    debugger
  }

  posAttack(/* actor: MObj */): void {
    debugger
  }

  sPosAttack(/* actor: MObj */): void {
    debugger
  }

  cPosAttack(/* actor: MObj */): void {
    debugger
  }

  cPosRefire(/* actor: MObj */): void {
    debugger
  }

  spidRefire(/* actor: MObj */): void {
    debugger
  }

  bspiAttack(/* actor: MObj */): void {
    debugger
  }

  troopAttack(/* actor: MObj */): void {
    debugger
  }

  sargAttack(/* actor: MObj */): void {
    debugger
  }

  headAttack(/* actor: MObj */): void {
    debugger
  }

  cyberAttack(/* actor: MObj */): void {
    debugger
  }

  bruisAttack(/* actor: MObj */): void {
    debugger
  }

  skelMissile(/* actor: MObj */): void {
    debugger
  }

  tracer(/* actor: MObj */): void {
    debugger
  }

  skelWhoosh(/* actor: MObj */): void {
    debugger
  }

  skelFist(/* actor: MObj */): void {
    debugger
  }

  vileChase(/* actor: MObj */): void {
    debugger
  }

  vileStart(/* actor: MObj */): void {
    debugger
  }

  startFire(/* actor: MObj */): void {
    debugger
  }

  fireCrackle(/* actor: MObj */): void {
    debugger
  }

  fire(/* actor: MObj */): void {
    debugger
  }

  vileTarget(/* actor: MObj */): void {
    debugger
  }

  vileAttack(/* actor: MObj */): void {
    debugger
  }

  fatRaise(/* actor: MObj */): void {
    debugger
  }

  fatAttack1(/* actor: MObj */): void {
    debugger
  }

  fatAttack2(/* actor: MObj */): void {
    debugger
  }

  fatAttack3(/* actor: MObj */): void {
    debugger
  }

  skullAttack(/* actor: MObj */): void {
    debugger
  }

  painAttack(/* actor: MObj */): void {
    debugger
  }

  painDie(/* actor: MObj */): void {
    debugger
  }

  scream(/* actor: MObj */): void {
    debugger
  }

  xScream(/* actor: MObj */): void {
    debugger
  }

  pain(/* actor: MObj */): void {
    debugger
  }

  fall(/* actor: MObj */): void {
    debugger
  }

  explode(/* thingy: MObj */): void {
    debugger
  }

  bossDeath(/* mo: MObj */): void {
    debugger
  }

  hoof(/* mo: MObj */): void {
    debugger
  }

  metal(/* mo: MObj */): void {
    debugger
  }

  babyMetal(/* mo: MObj */): void {
    debugger
  }

  openShotgun2(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  loadShotgun2(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  closeShotgun2(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  brainAwake(/* mo: MObj */): void {
    debugger
  }

  brainPain(/* mo: MObj */): void {
    debugger
  }

  brainScream(/* mo: MObj */): void {
    debugger
  }

  brainExplode(/* mo: MObj */): void {
    debugger
  }

  brainDie(/* mo: MObj */): void {
    debugger
  }

  brainSpit(/* mo: MObj */): void {
    debugger
  }

  spawnSound(/* mo: MObj */): void {
    debugger
  }

  spawnFly(/* mo: MObj */): void {
    debugger
  }

  playerScream(/* mo: MObj */): void {
    debugger
  }
}
