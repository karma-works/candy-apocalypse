import { ANG270, ANG90, ANGLE_TO_FINE_SHIFT, FINE_ANGLES, fineSine } from '../misc/table'
import { DirType, diags, opposite } from './mobj/direction'
import { FLOAT_SPEED, MELEE_RANGE, MISSILE_RANGE } from './local'
import { FRACUNIT, mul } from '../misc/fixed'
import { Doom } from '../doom/doom'
import { Game } from '../game/game'
import { Inter } from './inter'
import { Line } from '../rendering/line'
import { MObj } from './mobj/mobj'
import { MObjFlag } from './mobj/mobj-flag'
import { MObjHandler } from './mobj-handler'
import { MObjType } from '../doom/info/mobj-type'
import { Map } from './map'
import { MapLineFlag } from '../doom/data'
import { MapUtils } from './map-utils'
import { Play } from './setup'
import { Player } from '../doom/player'
import { Rendering } from '../rendering/rendering'
import { Sector } from '../rendering/sector'
import { Sfx } from '../doom/sounds'
import { Sight } from './sight'
import { Skill } from '../global/doomdef'
import { Switch } from './switch'
import { random } from '../misc/random'

const xSpeed: readonly number[] = [ FRACUNIT, 47000, 0, -47000, -FRACUNIT, -47000, 0, 47000 ]
const ySpeed: readonly number[] = [ 0, 47000, FRACUNIT, 47000, 0, -47000, -FRACUNIT, -47000 ]
export class Enemy {

  private get doom(): Doom {
    return this.play.doom
  }
  private get game(): Game {
    return this.play.game
  }
  private get inter(): Inter {
    return this.play.inter
  }
  private get map(): Map {
    return this.play.map
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
  private get switch(): Switch {
    return this.play.switch
  }

  constructor(private play: Play) { }

  //
  // Called by P_NoiseAlert.
  // Recursively traverse adjacent sectors,
  // sound blocking lines cut off traversal.
  //
  private soundTarget: MObj | null = null

  private recursiveSound(sec: Sector, soundBlocks: number): void {
    // wake up all monsters in this sector
    if (sec.validCount === this.rendering.validCount &&
      sec.soundTraversed <= soundBlocks + 1
    ) {
      // already flooded
      return
    }

    sec.validCount = this.rendering.validCount
    sec.soundTraversed = soundBlocks + 1
    sec.soundTarget = this.soundTarget

    let check: Line
    let other: Sector
    for (let i = 0; i < sec.lineCount; ++i) {
      check = sec.lines[i]
      if (!(check.flags & MapLineFlag.TwoSided)) {
        continue
      }

      this.mapUtils.lineOpening(check)

      if (this.mapUtils.openRange <= 0) {
        // closed door
        continue
      }

      if (this.play.sides[check.sideNum[0]].sector === sec) {
        other = this.play.sides[check.sideNum[1]].sector
      } else {
        other = this.play.sides[check.sideNum[0]].sector
      }

      if (check.flags & MapLineFlag.SoundBlock) {
        if (!soundBlocks) {
          this.recursiveSound(other, 1)
        }
      } else {
        this.recursiveSound(other, soundBlocks)
      }
    }
  }

  //
  // P_NoiseAlert
  // If a monster yells at a player,
  // it will alert other monsters to the player.
  //
  noiseAlert(target: MObj, emmiter: MObj): void {
    this.soundTarget = target
    this.rendering.validCount++
    if (emmiter.subSector === null) {
      throw 'emmiter.subSector = null'
    }
    if (emmiter.subSector.sector === null) {
      throw 'emmiter.subSector.sector = null'
    }
    this.recursiveSound(emmiter.subSector.sector, 0)
  }

  //
  // P_CheckMeleeRange
  //
  private checkMeleeRange(actor: MObj): boolean {
    if (!actor.target) {
      return false
    }

    const pl = actor.target
    const dist = this.mapUtils.aproxDistance(pl.x - actor.x, pl.y - actor.y)

    if (dist >= MELEE_RANGE - 20 * FRACUNIT + pl.info.radius) {
      return false
    }

    if (!this.sight.checkSight(actor, actor.target)) {
      return false
    }

    return true
  }

  //
  // P_CheckMissileRange
  //
  private checkMissileRange(actor: MObj): boolean {
    if (actor.target === null) {
      throw 'actor.target = null'
    }
    if (!this.sight.checkSight(actor, actor.target)) {
      return false
    }

    if (actor.flags & MObjFlag.JustHit) {
      // the target just hit the enemy,
      // so fight back!
      actor.flags &= ~MObjFlag.JustHit
      return true
    }

    if (actor.reactionTime) {
      // do not attack yet
      return false
    }

    // OPTIMIZE: get this from a global checksight
    let dist = this.mapUtils.aproxDistance(actor.x - actor.target.x,
      actor.y - actor.target.y) - 64 * FRACUNIT

    if (!actor.info.meleeState) {
      // no melee attack, so fire more
      dist -= 128 * FRACUNIT
    }

    dist >>= 16

    if (actor.type === MObjType.Vile) {
      if (dist > 14 * 64) {
        // too far away
        return false
      }
    }

    if (actor.type === MObjType.Undead) {
      if (dist < 196) {
        // close for fist attack
        return false
      }
      dist >>= 1
    }

    if (actor.type === MObjType.Cyborg ||
      actor.type === MObjType.Spider ||
      actor.type === MObjType.Skull
    ) {
      dist >>= 1
    }

    if (dist > 200) {
      dist = 200
    }

    if (actor.type === MObjType.Cyborg && dist > 160) {
      dist = 160
    }

    if (random.pRandom() < dist) {
      return false
    }

    return true
  }

  private move(actor: MObj): boolean {
    if (actor.moveDir === DirType.NoDir) {
      return false
    }

    if (actor.moveDir >>> 0 >= 8) {
      throw 'Weird actor->movedir!'
    }

    const tryX = actor.x + actor.info.speed * xSpeed[actor.moveDir]
    const tryY = actor.y + actor.info.speed * ySpeed[actor.moveDir]

    const tryOk = this.map.tryMove(actor, tryX, tryY)
    let good: boolean
    let ld: Line

    if (!tryOk) {
      // open any specials
      if (actor.flags & MObjFlag.Float && this.map.floatOK) {
        // must adjust height
        if (actor.z < this.map.tmFloorZ) {
          actor.z += FLOAT_SPEED
        } else {
          actor.z -= FLOAT_SPEED
        }

        actor.flags |= MObjFlag.InFloat
        return true
      }

      if (!this.map.numSpecHit) {
        return false
      }

      actor.moveDir = DirType.NoDir
      good = false
      while (this.map.numSpecHit--) {
        ld = this.map.specHit[this.map.numSpecHit]
        // if the special is not a door
        // that can be opened,
        // return false
        if (this.switch.useSpecialLine(actor, ld, 0)) {
          good = true
        }
      }

      return good
    } else {
      actor.flags &= ~MObjFlag.InFloat
    }

    if (!(actor.flags & MObjFlag.Float)) {
      actor.z = actor.floorZ
    }
    return true
  }

  //
  // TryWalk
  // Attempts to move actor on
  // in its current (ob->moveangle) direction.
  // If blocked by either a wall or an actor
  // returns FALSE
  // If move is either clear or blocked only by a door,
  // returns TRUE and sets...
  // If a door is in the way,
  // an OpenDoor call is made to start it opening.
  //
  private tryWalk(actor: MObj): boolean {
    if (!this.move(actor)) {
      return false
    }

    actor.moveCount = random.pRandom() & 15
    return true
  }

  private newChaseDir(actor: MObj): void {

    if (!actor.target) {
      throw 'P_NewChaseDir: called with no target'
    }

    const oldDir = actor.moveDir
    const turnAround = opposite[oldDir]

    const deltaX = actor.target.x - actor.x
    const deltaY = actor.target.y - actor.y

    const d: DirType[] = [ 0, 0, 0 ]

    if (deltaX > 10 * FRACUNIT) {
      d[1] = DirType.East
    } else if (deltaX < -10 * FRACUNIT) {
      d[1] = DirType.West
    } else {
      d[1] = DirType.NoDir
    }

    if (deltaY < -10 * FRACUNIT) {
      d[2] = DirType.South
    } else if (deltaY > 10 * FRACUNIT) {
      d[2] = DirType.North
    } else {
      d[2] = DirType.NoDir
    }

    // try direct route
    if (d[1] !== DirType.NoDir &&
      d[2] !== DirType.NoDir
    ) {
      actor.moveDir = diags[((deltaY < 0 ? 1 : 0) << 1) + (deltaX > 0 ? 1 : 0)]
      if (actor.moveDir !== turnAround && this.tryWalk(actor)) {
        return
      }
    }

    let tDir: number
    // try other directions
    if (random.pRandom() > 200 ||
      Math.abs(deltaY) > Math.abs(deltaX)
    ) {
      tDir = d[1]
      d[1] = d[2]
      d[2] = tDir
    }

    if (d[1] === turnAround) {
      d[1] = DirType.NoDir
    }
    if (d[2] === turnAround) {
      d[2] = DirType.NoDir
    }

    if (d[1] !== DirType.NoDir) {
      actor.moveDir = d[1]
      if (this.tryWalk(actor)) {
        // either moved forward or attacked
        return
      }
    }

    if (d[2] !== DirType.NoDir) {
      actor.moveDir = d[2]

      if (this.tryWalk(actor)) {
        return
      }
    }

    // there is no direct path to the player,
    // so pick another direction.
    if (oldDir !== DirType.NoDir) {
      actor.moveDir = oldDir

      if (this.tryWalk(actor)) {
        return
      }
    }

    // randomly determine direction of search
    if (random.pRandom() & 1) {
      for (tDir = DirType.East;
        tDir <= DirType.SouthEast;
        tDir++
      ) {
        if (tDir !== turnAround) {
          actor.moveDir = tDir

          if (this.tryWalk(actor)) {
            return
          }
        }
      }
    } else {
      for (tDir = DirType.SouthEast;
        tDir !== DirType.East - 1;
        tDir--
      ) {
        if (tDir !== turnAround) {
          actor.moveDir = tDir

          if (this.tryWalk(actor)) {
            return
          }
        }
      }
    }

    if (turnAround !== DirType.NoDir) {
      actor.moveDir = turnAround
      if (this.tryWalk(actor)) {
        return
      }
    }

    // can not move
    actor.moveDir = DirType.NoDir

  }

  //
  // P_LookForPlayers
  // If allaround is false, only look 180 degrees in front.
  // Returns true if a player is targeted.
  //
  private lookForPlayers(actor: MObj, allAround: boolean): boolean {
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
    if (actor.info.seeSound) {
      let sound: number

      switch (actor.info.seeSound) {
      case Sfx.Posit1:
      case Sfx.Posit2:
      case Sfx.Posit3:
        sound = Sfx.Posit1 + random.pRandom() % 3
        break
      case Sfx.Bgsit1:
      case Sfx.Bgsit2:
        sound = Sfx.Bgsit1 + random.pRandom() % 2
        break
      default:
        sound = actor.info.seeSound
      }

      if (actor.type === MObjType.Spider ||
        actor.type === MObjType.Cyborg
      ) {
        // full volume
        // S_StartSound (NULL, sound);
      } else {
        // S_StartSound (actor, sound);
      }
    }
    this.mObjHandler.setMObjState(actor, actor.info.seeState)
  }

  //
  // A_Chase
  // Actor has a melee attack,
  // so it tries to close as fast as possible
  //
  chase(actor: MObj): void {
    if (actor.reactionTime) {
      --actor.reactionTime
    }

    // modify target threshold
    if (actor.threshold) {
      if (!actor.target ||
        actor.target.health <= 0
      ) {
        actor.threshold = 0
      } else {
        actor.threshold--
      }
    }

    // turn towards movement direction if not there yet
    if (actor.moveDir < 8) {
      actor.angle = (actor.angle & 7 << 29) >>> 0
      const delta = actor.angle - (actor.moveDir << 29) >> 0

      if (delta > 0) {
        actor.angle = actor.angle - ANG90 / 2 >>> 0
      } else if (delta < 0) {
        actor.angle = actor.angle + ANG90 / 2 >>> 0
      }
    }

    if (!actor.target ||
      !(actor.target.flags & MObjFlag.Shootable)
    ) {
      // look for a new target
      if (this.lookForPlayers(actor, true)) {
        // got a new target
        return
      }

      this.mObjHandler.setMObjState(actor, actor.info.spawnState)
      return
    }

    // do not attack twice in a row
    if (actor.flags & MObjFlag.JustAttacked) {
      actor.flags &= ~MObjFlag.JustAttacked
      if (this.game.gameSkill !== Skill.Nightmare && !this.doom.fastParam) {
        this.newChaseDir(actor)
      }
      return
    }

    // check for melee attack
    if (actor.info.meleeState &&
      this.checkMeleeRange(actor)
    ) {
      this.mObjHandler.setMObjState(actor, actor.info.meleeState)
      return
    }

    // check for missile attack
    if (actor.info.missileState) {
      if (this.game.gameSkill >= Skill.Nightmare ||
        this.doom.fastParam || !actor.moveCount
      ) {
        if (this.checkMissileRange(actor)) {
          this.mObjHandler.setMObjState(actor, actor.info.missileState)
          actor.flags |= MObjFlag.JustAttacked

          return
        }
      }
    }

    // possibly choose another target
    if (this.game.netGame &&
      !actor.threshold &&
      !this.sight.checkSight(actor, actor.target)
    ) {
      if (this.lookForPlayers(actor, true)) {
        // got a new target
        return
      }
    }

    // chase towards player
    if (--actor.moveCount < 0 ||
      !this.move(actor)
    ) {
      this.newChaseDir(actor)
    }

    // make active sound
    if (actor.info.activeSound &&
      random.pRandom() < 3
    ) {
      // S_StartSound (actor, actor->info->activesound);
    }
  }

  //
  // A_FaceTarget
  //
  faceTarget(actor: MObj): void {
    if (!actor.target) {
      return
    }

    actor.flags &= ~MObjFlag.Ambush

    actor.angle = this.rendering.pointToAngle2(actor.x,
      actor.y,
      actor.target.x,
      actor.target.y)

    if (actor.target.flags & MObjFlag.Shadow) {
      actor.angle = actor.angle + (random.pRandom() - random.pRandom() << 21) >>> 0
    }
  }

  //
  // A_PosAttack
  //
  posAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)
    let angle = actor.angle >> 0
    const slope = this.map.aimLineAttack(actor, angle >>> 0, MISSILE_RANGE)

    angle += random.pRandom() - random.pRandom() << 20
    const damage = (random.pRandom() % 5 + 1) * 3
    this.map.lineAttack(actor, angle >>> 0, MISSILE_RANGE, slope, damage)
  }

  sPosAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)
    const bAngle = actor.angle >> 0
    const slope = this.map.aimLineAttack(actor, bAngle >>> 0, MISSILE_RANGE)

    let angle: number
    let damage: number
    for (let i = 0; i < 3; ++i) {
      angle = bAngle + (random.pRandom() - random.pRandom() << 20)
      damage = (random.pRandom() % 5 + 1) * 3
      this.map.lineAttack(actor, angle >>> 0, MISSILE_RANGE, slope, damage)
    }
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

  troopAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)

    if (this.checkMeleeRange(actor)) {
      const damage = (random.pRandom() % 8 + 1) * 3
      this.inter.damageMObj(actor.target, actor, actor, damage)
      return
    }

    // launch a missile
    this.mObjHandler.spawnMissile(actor, actor.target, MObjType.Troopshot)
  }

  sargAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)
    if (this.checkMeleeRange(actor)) {
      const damage = (random.pRandom() % 10 + 1) * 4
      this.inter.damageMObj(actor.target, actor, actor, damage)
    }
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

  //
  // A_VileAttack
  //
  vileAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)

    if (!this.sight.checkSight(actor, actor.target)) {
      return
    }

    this.inter.damageMObj(actor.target, actor, actor, 20)
    actor.target.momZ = 1000 * FRACUNIT / actor.target.info.mass

    const an = actor.angle >> ANGLE_TO_FINE_SHIFT

    const fire = actor.tracer

    if (!fire) {
      return
    }

    // move the fire between the vile and the player
    fire.x = actor.target.x - mul(24 * FRACUNIT, fineSine[FINE_ANGLES / 4 + an])
    fire.y = actor.target.y - mul(24 * FRACUNIT, fineSine[an])
    this.map.radiusAttack(fire, actor, 70)
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

  scream(actor: MObj): void {
    if (actor.info.deathSound) {
      let sound: number

      switch (actor.info.deathSound) {
      case 0:
        return
      case Sfx.Podth1:
      case Sfx.Podth2:
      case Sfx.Podth3:
        sound = Sfx.Podth1 + random.pRandom() % 3
        break
      case Sfx.Bgdth1:
      case Sfx.Bgdth2:
        sound = Sfx.Bgdth1 + random.pRandom() % 2
        break
      default:
        sound = actor.info.deathSound
      }

      // Check for bosses.
      if (actor.type === MObjType.Spider ||
        actor.type === MObjType.Cyborg
      ) {
        // full volume
        // S_StartSound (NULL, sound);
      } else {
        // S_StartSound (actor, sound);
      }
    }
  }

  xScream(/* actor: MObj */): void {
    debugger
  }

  pain(/* actor: MObj */): void {
    // TODO sound
  }

  fall(actor: MObj): void {
    // actor is on ground, it can be walked over
    actor.flags &= ~MObjFlag.Solid

    // So change this if corpse objects
    // are meant to be obstacles.
  }

  //
  // A_Explode
  //
  explode(thingy: MObj): void {
    this.map.radiusAttack(thingy, thingy.target, 128)
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
