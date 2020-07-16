import { ANG180, ANG270, ANG90, ANGLE_TO_FINE_SHIFT, FINE_ANGLES, fineSine } from '../misc/table'
import { DirType, diags, opposite } from './mobj/direction'
import { FLOAT_SPEED, MAP_BLOCK_SHIFT, MAX_RADIUS, MELEE_RANGE, MISSILE_RANGE } from './local'
import { FRACUNIT, mul } from '../misc/fixed'
import { GameMode, GameVersion, Skill } from '../doom/mode'
import { Sound as DSound } from '../doom/sound'
import { Doom } from '../doom/doom'
import { DoorType } from './doors/door-type'
import { Doors } from './doors'
import { Floor } from './floor'
import { FloorType } from './floor/floor-type'
import { Game } from '../game/game'
import { Inter } from './inter'
import { Line } from '../rendering/line'
import { MAX_PLAYERS } from '../global/doomdef'
import { MObj } from './mobj/mobj'
import { MObjFlag } from './mobj/mobj-flag'
import { MObjHandler } from './mobj-handler'
import { MObjInfo } from '../doom/info/mobj-info'
import { MObjType } from '../doom/info/mobj-type'
import { Map } from './map'
import { MapLineFlag } from '../doom/data'
import { MapUtils } from './map-utils'
import { PSprite } from './p-sprite'
import { Play } from './setup'
import { Player } from '../doom/player'
import { Rendering } from '../rendering/rendering'
import { Sector } from '../rendering/sector'
import { Sfx } from '../doom/sounds/sfx'
import { Sight } from './sight'
import { StateNum } from '../doom/info/state-num'
import { Switch } from './switch'
import { Thinker } from '../doom/think'
import { Tick } from './tick'
import { mObjInfos } from '../doom/info/mobj-infos'
import { random } from '../misc/random'

const xSpeed: readonly number[] = [ FRACUNIT, 47000, 0, -47000, -FRACUNIT, -47000, 0, 47000 ]
const ySpeed: readonly number[] = [ 0, 47000, FRACUNIT, 47000, 0, -47000, -FRACUNIT, -47000 ]

const TRACE_ANGLE = 0xc000000

const FAT_SPREAD = ANG90 / 8

const SKULL_SPEED = 20 * FRACUNIT

export class Enemy {

  private get doom(): Doom {
    return this.play.doom
  }
  private get doors(): Doors {
    return this.play.doors
  }
  private get dSound(): DSound {
    return this.play.dSound
  }
  private get floor(): Floor {
    return this.play.floor
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
  private get pSprite(): PSprite {
    return this.play.pSprite
  }
  private get sight(): Sight {
    return this.play.sight
  }
  private get switch(): Switch {
    return this.play.switch
  }
  private get tick(): Tick {
    return this.play.tick
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

    let range = MELEE_RANGE - 20 * FRACUNIT + pl.info.radius
    if (this.doom.gameVersion <= GameVersion.Doom12) {
      range = MELEE_RANGE
    }

    if (dist >= range) {
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

  //
  // A_KeenDie
  // DOOM II special, map 32.
  // Uses special tag 666.
  //
  keenDie(mo: MObj): void {
    this.fall(mo)

    let th: Thinker<unknown, [unknown]> | null
    let mo2: MObj
    for (th = this.tick.thinkerCap.next;
      th !== null && th !== this.tick.thinkerCap;
      th = th.next
    ) {
      if (th.func !== this.mObjHandler.thinker) {
        continue
      }

      mo2 = th as MObj
      if (mo2 !== mo &&
        mo2.type === mo.type &&
        mo2.health > 0
      ) {
        // other Keen not dead
        return
      }
    }

    const junk = new Line()
    junk.tag = 666
    this.doors.evDoDoor(junk, DoorType.Open)
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
        this.dSound.startSound(null, sound)
      } else {
        this.dSound.startSound(actor, sound)
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
      if (this.doom.gameVersion > GameVersion.Doom12 &&
        (!actor.target ||
        actor.target.health <= 0)
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
      if (actor.info.attackSound) {
        this.dSound.startSound(actor, actor.info.attackSound)
      }
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
      this.dSound.startSound(actor, actor.info.activeSound)
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

    this.dSound.startSound(actor, Sfx.Pistol)
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

    this.dSound.startSound(actor, Sfx.Shotgn)
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

  cPosAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)
    const bAngle = actor.angle >> 0
    const slope = this.map.aimLineAttack(actor, bAngle >>> 0, MISSILE_RANGE)

    const angle = bAngle + (random.pRandom() - random.pRandom() << 20)
    const damage = (random.pRandom() % 5 + 1) * 3
    this.map.lineAttack(actor, angle >>> 0, MISSILE_RANGE, slope, damage)
  }

  cPosRefire(actor: MObj): void {
    // keep firing unless target got out of sight
    this.faceTarget(actor)

    if (random.pRandom() < 40) {
      return
    }

    if (!actor.target ||
      actor.target.health <= 0 ||
      !this.sight.checkSight(actor, actor.target)
    ) {
      this.mObjHandler.setMObjState(actor, actor.info.seeState)
    }
  }

  spidRefire(actor: MObj): void {
    // keep firing unless target got out of sight
    this.faceTarget(actor)

    if (random.pRandom() < 10) {
      return
    }

    if (!actor.target ||
      actor.target.health <= 0 ||
      !this.sight.checkSight(actor, actor.target)
    ) {
      this.mObjHandler.setMObjState(actor, actor.info.seeState)
    }
  }

  bspiAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)

    // launch a missile
    this.mObjHandler.spawnMissile(actor, actor.target, MObjType.Arachplaz)
  }

  //
  // A_TroopAttack
  //
  troopAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)

    if (this.checkMeleeRange(actor)) {
      this.dSound.startSound(actor, Sfx.Claw)
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

    if (this.doom.gameVersion > GameVersion.Doom12) {
      if (!this.checkMeleeRange(actor)) {
        return
      }
    }

    const damage = (random.pRandom() % 10 + 1) * 4

    if (this.doom.gameVersion <= GameVersion.Doom12) {
      this.map.lineAttack(actor, actor.angle, MELEE_RANGE, 0, damage)
    } else {
      this.inter.damageMObj(actor.target, actor, actor, damage)
    }
  }

  headAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)
    if (this.checkMeleeRange(actor)) {
      const damage = (random.pRandom() % 6 + 1) * 10
      this.inter.damageMObj(actor.target, actor, actor, damage)
      return
    }

    // launch a missile
    this.mObjHandler.spawnMissile(actor, actor.target, MObjType.Headshot)
  }

  cyberAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)
    this.mObjHandler.spawnMissile(actor, actor.target, MObjType.Rocket)
  }

  bruisAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    if (this.checkMeleeRange(actor)) {
      this.dSound.startSound(actor, Sfx.Claw)
      const damage = (random.pRandom() % 8 + 1) * 10
      this.inter.damageMObj(actor.target, actor, actor, damage)
      return
    }

    // launch a missile
    this.mObjHandler.spawnMissile(actor, actor.target, MObjType.Bruisershot)
  }

  //
  // A_SkelMissile
  //
  skelMissile(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)
    // so missile spawns higher
    actor.z += 16 * FRACUNIT
    const mo = this.mObjHandler.spawnMissile(actor, actor.target, MObjType.Tracer)
    // back to normal
    actor.z -= 16 * FRACUNIT

    mo.x += mo.momX
    mo.y += mo.momY
    mo.tracer = actor.target
  }

  tracer(actor: MObj): void {
    if (this.game.gameTic & 3) {
      return
    }

    // spawn a puff of smoke behind the rocket
    this.mObjHandler.spawnPuff(actor.x, actor.y, actor.z)

    const th = this.mObjHandler.spawnMObj(actor.x - actor.momX,
      actor.y - actor.momY,
      actor.z, MObjType.Smoke)

    th.momZ = FRACUNIT
    th.tics -= random.pRandom() & 3
    if (th.tics < 1) {
      th.tics = 1
    }

    // adjust direction
    const dest = actor.tracer

    if (!dest || dest.health <= 0) {
      return
    }

    // change angle
    let exact = this.rendering.pointToAngle2(actor.x, actor.y,
      dest.x, dest.y)

    if (exact !== actor.angle) {
      if (exact - actor.angle >>> 0 > 0x80000000) {
        actor.angle = actor.angle - TRACE_ANGLE >>> 0
        if (exact - actor.angle >>> 0 < 0x80000000) {
          actor.angle = exact
        }
      } else {
        actor.angle = actor.angle + TRACE_ANGLE >>> 0
        if (exact - actor.angle >>> 0 > 0x80000000) {
          actor.angle = exact
        }
      }
    }

    exact = actor.angle >>> ANGLE_TO_FINE_SHIFT
    actor.momX = mul(actor.info.speed, fineSine[FINE_ANGLES / 4 + exact])
    actor.momY = mul(actor.info.speed, fineSine[exact])

    // change slope
    let dist = this.mapUtils.aproxDistance(dest.x - actor.x,
      dest.y - actor.y)

    dist = dist / actor.info.speed >> 0

    if (dist < 1) {
      dist = 1
    }
    const slope = (dest.z + 40 * FRACUNIT - actor.z) / dist >> 0

    if (slope < actor.momZ) {
      actor.momZ -= FRACUNIT / 8
    } else {
      actor.momZ += FRACUNIT / 8
    }
  }

  skelWhoosh(actor: MObj): void {
    if (!actor.target) {
      return
    }
    this.faceTarget(actor)
    this.dSound.startSound(actor, Sfx.Skeswg)
  }

  skelFist(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)

    if (this.checkMeleeRange(actor)) {
      const damage = (random.pRandom() % 10 + 1) * 6
      this.dSound.startSound(actor, Sfx.Skepch)
      this.inter.damageMObj(actor.target, actor, actor, damage)
    }
  }

  //
  // PIT_VileCheck
  // Detect a corpse that could be raised.
  //
  private corpseHit: MObj | null = null
  private vileTryX = 0
  private vileTryY = 0
  private vileCheck(thing: MObj): boolean {
    if (!(thing.flags & MObjFlag.Corpse)) {
    // not a monster
      return true
    }

    if (thing.tics !== -1) {
      // not lying still yet
      return true
    }

    if (thing.info.raiseState === StateNum.Null) {
      // monster doesn't have a raise state
      return true
    }

    const maxDist = thing.info.radius + mObjInfos[MObjType.Vile].radius

    if (Math.abs(thing.x - this.vileTryX) > maxDist ||
    Math.abs(thing.y - this.vileTryY) > maxDist
    ) {
      // not actually touching
      return true
    }

    this.corpseHit = thing
    this.corpseHit.momX = this.corpseHit.momY = 0
    this.corpseHit.height <<= 2
    const check = this.map.checkPosition(this.corpseHit, this.corpseHit.x, this.corpseHit.y)
    this.corpseHit.height >>= 2

    if (!check) {
      // doesn't fit here
      return true
    }

    // got one, so stop checking
    return false
  }

  //
  // A_VileChase
  // Check for ressurecting a body
  //
  vileChase(actor: MObj): void {

    if (actor.moveDir !== DirType.NoDir) {
      // check for corpses to raise
      this.vileTryX =
        actor.x + actor.info.speed * xSpeed[actor.moveDir]
      this.vileTryY =
        actor.y + actor.info.speed * ySpeed[actor.moveDir]

      const xl = this.vileTryX - this.play.bMapOrgX - MAX_RADIUS * 2 >> MAP_BLOCK_SHIFT
      const xh = this.vileTryX - this.play.bMapOrgX + MAX_RADIUS * 2 >> MAP_BLOCK_SHIFT
      const yl = this.vileTryY - this.play.bMapOrgY - MAX_RADIUS * 2 >> MAP_BLOCK_SHIFT
      const yh = this.vileTryY - this.play.bMapOrgY + MAX_RADIUS * 2 >> MAP_BLOCK_SHIFT

      let temp: MObj | null
      let info: MObjInfo
      for (let bx = xl; bx <= xh; bx++) {
        for (let by = yl; by <= yh; by++) {
          // Call PIT_VileCheck to check
          // whether object is a corpse
          // that canbe raised.
          if (!this.mapUtils.blockThingsIterator(bx, by, this.vileCheck, this)) {
            // got one!
            temp = actor.target
            actor.target = this.corpseHit
            this.faceTarget(actor)
            actor.target = temp

            this.mObjHandler.setMObjState(actor, StateNum.VileHeal1)
            if (this.corpseHit === null) {
              throw 'this.corpseHit = null'
            }
            this.dSound.startSound(this.corpseHit, Sfx.Slop)
            info = this.corpseHit.info

            this.mObjHandler.setMObjState(this.corpseHit, info.raiseState)
            this.corpseHit.height <<= 2
            this.corpseHit.flags = info.flags
            this.corpseHit.health = info.spawnHealth
            this.corpseHit.target = null

            return
          }
        }
      }
    }

    // Return to normal attack.
    this.chase(actor)
  }

  //
  // A_VileStart
  //
  vileStart(actor: MObj): void {
    this.dSound.startSound(actor, Sfx.Vilatk)
  }

  //
  // A_Fire
  // Keep fire in front of player unless out of sight
  //
  startFire(actor: MObj): void {
    this.dSound.startSound(actor, Sfx.Flamst)
    this.fire(actor)
  }

  fireCrackle(actor: MObj): void {
    this.dSound.startSound(actor, Sfx.Flame)
    this.fire(actor)
  }

  fire(actor: MObj): void {
    const dest = actor.tracer
    if (!dest) {
      return
    }

    if (actor.target === null) {
      throw 'actor.target = null'
    }

    // don't move it if the vile lost sight
    if (!this.sight.checkSight(actor.target, dest)) {
      return
    }

    const an = dest.angle >>> ANGLE_TO_FINE_SHIFT

    this.mapUtils.unsetThingPosition(actor)
    actor.x = dest.x + mul(24 * FRACUNIT, fineSine[FINE_ANGLES / 4 + an])
    actor.y = dest.y + mul(24 * FRACUNIT, fineSine[an])
    actor.z = dest.z
    this.mapUtils.setThingPosition(actor)
  }

  //
  // A_VileTarget
  // Spawn the hellfire
  //
  vileTarget(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)

    const fog = this.mObjHandler.spawnMObj(actor.target.x,
      actor.target.x,
      actor.target.z, MObjType.Fire)

    actor.tracer = fog
    fog.target = actor
    fog.tracer = actor.target
    this.fire(fog)
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

    this.dSound.startSound(actor, Sfx.Barexp)
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

  //
  // Mancubus attack,
  // firing three missiles (bruisers)
  // in three different directions?
  // Doesn't look like it.
  //

  fatRaise(actor: MObj): void {
    this.faceTarget(actor)
    this.dSound.startSound(actor, Sfx.Manatk)
  }

  fatAttack1(actor: MObj): void {
    if (actor.target === null) {
      throw 'actor.target = null'
    }

    this.faceTarget(actor)
    // Change direction  to ...
    actor.angle = actor.angle + FAT_SPREAD >>> 0
    this.mObjHandler.spawnMissile(actor, actor.target, MObjType.Fatshot)

    const mo = this.mObjHandler.spawnMissile(actor, actor.target, MObjType.Fatshot)
    mo.angle = mo.angle + FAT_SPREAD >>> 0
    const an = mo.angle >>> ANGLE_TO_FINE_SHIFT
    mo.momX = mul(mo.info.speed, fineSine[FINE_ANGLES / 4 + an])
    mo.momY = mul(mo.info.speed, fineSine[an])
  }

  fatAttack2(actor: MObj): void {
    if (actor.target === null) {
      throw 'actor.target = null'
    }

    this.faceTarget(actor)
    // Now here choose opposite deviation.
    actor.angle = actor.angle - FAT_SPREAD >>> 0
    this.mObjHandler.spawnMissile(actor, actor.target, MObjType.Fatshot)

    const mo = this.mObjHandler.spawnMissile(actor, actor.target, MObjType.Fatshot)
    mo.angle = mo.angle - FAT_SPREAD * 2 >>> 0
    const an = mo.angle >>> ANGLE_TO_FINE_SHIFT
    mo.momX = mul(mo.info.speed, fineSine[FINE_ANGLES / 4 + an])
    mo.momY = mul(mo.info.speed, fineSine[an])
  }

  fatAttack3(actor: MObj): void {
    if (actor.target === null) {
      throw 'actor.target = null'
    }

    this.faceTarget(actor)

    let mo = this.mObjHandler.spawnMissile(actor, actor.target, MObjType.Fatshot)
    mo.angle = mo.angle - FAT_SPREAD / 2 >>> 0
    let an = mo.angle >>> ANGLE_TO_FINE_SHIFT
    mo.momX = mul(mo.info.speed, fineSine[FINE_ANGLES / 4 + an])
    mo.momY = mul(mo.info.speed, fineSine[an])

    mo = this.mObjHandler.spawnMissile(actor, actor.target, MObjType.Fatshot)
    mo.angle = mo.angle + FAT_SPREAD / 2 >>> 0
    an = mo.angle >>> ANGLE_TO_FINE_SHIFT
    mo.momX = mul(mo.info.speed, fineSine[FINE_ANGLES / 4 + an])
    mo.momY = mul(mo.info.speed, fineSine[an])
  }

  //
  // SkullAttack
  // Fly at the player like a missile.
  //
  skullAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    const dest = actor.target
    actor.flags |= MObjFlag.SkullFly

    this.dSound.startSound(actor, actor.info.attackSound)
    this.faceTarget(actor)
    const an = actor.angle >>> ANGLE_TO_FINE_SHIFT
    actor.momX = mul(SKULL_SPEED, fineSine[FINE_ANGLES / 4 + an])
    actor.momY = mul(SKULL_SPEED, fineSine[an])
    let dist = this.mapUtils.aproxDistance(dest.x - actor.x, dest.y - actor.y)
    dist = dist / SKULL_SPEED >> 0

    if (dist < 1) {
      dist = 1
    }
    actor.momZ = (dest.z + (dest.height >> 1) - actor.z) / dist >> 0
  }

  //
  // A_PainShootSkull
  // Spawn a lost soul and launch it at the target
  //
  private painShootSkull(actor: MObj, angle: number): void {

    // count total number of skull currently on the level
    let count = 0

    let currentTinker = this.tick.thinkerCap.next
    while (currentTinker && currentTinker !== this.tick.thinkerCap) {
      if (currentTinker.func === this.mObjHandler.thinker &&
        // eslint-disable-next-line no-extra-parens
        (currentTinker as MObj).type === MObjType.Skull
      ) {
        count++
        currentTinker = currentTinker.next
      }
    }

    // if there are allready 20 skulls on the level,
    // don't spit another one
    if (count > 20) {
      return
    }


    // okay, there's playe for another one
    const an = angle >>> ANGLE_TO_FINE_SHIFT

    const preStep = 4 * FRACUNIT +
        (3 * (actor.info.radius + mObjInfos[MObjType.Skull].radius) / 2 >> 0)

    const x = actor.x + mul(preStep, fineSine[FINE_ANGLES / 4 + an])
    const y = actor.y + mul(preStep, fineSine[an])
    const z = actor.z + 8 * FRACUNIT

    const newMObj = this.mObjHandler.spawnMObj(x, y, z, MObjType.Skull)

    // Check for movements.
    if (!this.map.tryMove(newMObj, newMObj.x, newMObj.y)) {
      // kill it immediately
      this.inter.damageMObj(newMObj, actor, actor, 10000)
      return
    }

    newMObj.target = actor.target
    this.skullAttack(newMObj)
  }

  //
  // A_PainAttack
  // Spawn a lost soul and launch it at the target
  //
  painAttack(actor: MObj): void {
    if (!actor.target) {
      return
    }

    this.faceTarget(actor)
    this.painShootSkull(actor, actor.angle)
  }

  painDie(actor: MObj): void {
    this.fall(actor)
    this.painShootSkull(actor, actor.angle + ANG90 >>> 0)
    this.painShootSkull(actor, actor.angle + ANG180 >>> 0)
    this.painShootSkull(actor, actor.angle + ANG270 >>> 0)
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
        this.dSound.startSound(null, sound)
      } else {
        this.dSound.startSound(actor, sound)
      }
    }
  }

  xScream(actor: MObj): void {
    this.dSound.startSound(actor, Sfx.Slop)
  }

  pain(actor: MObj): void {
    if (actor.info.painSound) {
      this.dSound.startSound(actor, actor.info.painSound)
    }
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

  //
  // A_BossDeath
  // Possibly trigger special effects
  // if on first boss level
  //
  bossDeath(mo: MObj): void {
    if (this.doom.gameMode === GameMode.Commercial) {
      if (this.game.gameMap !== 7) {
        return
      }

      if (mo.type !== MObjType.Fatso &&
        mo.type !== MObjType.Baby
      ) {
        return
      }
    } else {
      switch (this.game.gameEpisode) {
      case 1:
        if (this.game.gameMap !== 8) {
          return
        }

        if (mo.type !== MObjType.Bruiser) {
          return
        }
        break

      case 2:
        if (this.game.gameMap !== 8) {
          return
        }

        if (mo.type !== MObjType.Cyborg) {
          return
        }
        break

      case 3:
        if (this.game.gameMap !== 8) {
          return
        }

        if (mo.type !== MObjType.Spider) {
          return
        }

        break

      case 4:
        switch (this.game.gameMap) {
        case 6:
          if (mo.type !== MObjType.Cyborg) {
            return
          }
          break

        case 8:
          if (mo.type !== MObjType.Spider) {
            return
          }
          break

        default:
          return
        }
        break

      default:
        if (this.game.gameMap !== 8) {
          return
        }
        break
      }

    }


    // make sure there is a player alive for victory
    let i: number
    for (i = 0; i < MAX_PLAYERS; i++) {
      if (this.game.playerInGame[i] && this.game.players[i].health > 0) {
        break
      }
    }

    if (i === MAX_PLAYERS) {
      // no one left alive, so do not end game
      return
    }

    // scan the remaining thinkers to see
    // if all bosses are dead
    let th: Thinker<unknown, [unknown]> | null
    let mo2: MObj
    for (th = this.tick.thinkerCap.next;
      th !== null && th !== this.tick.thinkerCap;
      th = th.next
    ) {
      if (th.func !== this.mObjHandler.thinker) {
        continue
      }

      mo2 = th as MObj
      if (mo2 !== mo &&
        mo2.type === mo.type &&
        mo2.health > 0
      ) {
        // other boss not dead
        return
      }
    }

    // victory!
    const junk = new Line()
    if (this.doom.gameMode === GameMode.Commercial) {
      if (this.game.gameMap === 7) {
        if (mo.type === MObjType.Fatso) {
          junk.tag = 666
          this.floor.evDoFloor(junk, FloorType.LowerFloorToLowest)
          return
        }

        if (mo.type === MObjType.Baby) {
          junk.tag = 667
          this.floor.evDoFloor(junk, FloorType.RaiseToTexture)
          return
        }
      }
    } else {
      switch (this.game.gameEpisode) {
      case 1:
        junk.tag = 666
        this.floor.evDoFloor(junk, FloorType.LowerFloorToLowest)
        return

      case 4:
        switch (this.game.gameMap) {
        case 6:
          junk.tag = 666
          this.doors.evDoDoor(junk, DoorType.BlazeOpen)
          return

        case 8:
          junk.tag = 666
          this.floor.evDoFloor(junk, FloorType.LowerFloorToLowest)
          return
        }
      }
    }

    this.game.exitLevel()
  }

  hoof(mo: MObj): void {
    this.dSound.startSound(mo, Sfx.Hoof)
    this.chase(mo)
  }

  metal(mo: MObj): void {
    this.dSound.startSound(mo, Sfx.Metal)
    this.chase(mo)
  }

  babyMetal(mo: MObj): void {
    this.dSound.startSound(mo, Sfx.Bspwlk)
    this.chase(mo)
  }

  openShotgun2(player: Player): void {
    this.dSound.startSound(player.mo, Sfx.Dbopn)
  }

  loadShotgun2(player: Player): void {
    this.dSound.startSound(player.mo, Sfx.Dbload)
  }

  closeShotgun2(player: Player): void {
    this.dSound.startSound(player.mo, Sfx.Dbcls)
    this.pSprite.reFire(player)
  }

  private brainTargets = new Array<MObj>(32)
  private numBrainTargets = 0
  private brainTargetOn = 0
  brainAwake(): void {
    // find all the target spots
    this.numBrainTargets = 0
    this.brainTargetOn = 0


    let thinker: Thinker<unknown, [unknown]> | null
    let m: MObj
    for (thinker = this.tick.thinkerCap.next;
      thinker !== null && thinker !== this.tick.thinkerCap;
      thinker = thinker.next
    ) {
      if (thinker.func !== this.mObjHandler.thinker) {
        // not a mobj
        continue
      }

      m = thinker as MObj

      if (m.type === MObjType.Bosstarget) {
        this.brainTargets[this.numBrainTargets] = m
        this.numBrainTargets++
      }
    }
    this.dSound.startSound(null, Sfx.Bossit)
  }

  brainPain(): void {
    this.dSound.startSound(null, Sfx.Bospn)
  }

  brainScream(mo: MObj): void {
    let x: number
    let y: number
    let z: number
    let th: MObj
    for (x = mo.x - 196 * FRACUNIT;
      x < mo.x + 320 * FRACUNIT;
      x += FRACUNIT * 8
    ) {
      y = mo.y - 320 * FRACUNIT
      z = 128 + random.pRandom() * 2 * FRACUNIT
      th = this.mObjHandler.spawnMObj(x, y, z, MObjType.Rocket)
      th.momZ = random.pRandom() * 512

      this.mObjHandler.setMObjState(th, StateNum.Brainexplode1)

      th.tics -= random.pRandom() & 7
      if (th.tics < 1) {
        th.tics = 1
      }
    }

    this.dSound.startSound(mo, Sfx.Bosdth)
  }

  brainExplode(mo: MObj): void {
    const x = mo.x + (random.pRandom() - random.pRandom()) * 2048
    const y = mo.y
    const z = 128 + random.pRandom() * 2 * FRACUNIT
    const th = this.mObjHandler.spawnMObj(x, y, z, MObjType.Rocket)
    th.momZ = random.pRandom() * 512

    this.mObjHandler.setMObjState(th, StateNum.Brainexplode1)

    th.tics -= random.pRandom() & 7
    if (th.tics < 1) {
      th.tics = 1
    }
  }

  brainDie(): void {
    this.game.exitLevel()
  }

  private easy = 0
  brainSpit(mo: MObj): void {
    this.easy ^= 1
    if (this.game.gameSkill <= Skill.Easy && !this.easy) {
      return
    }

    // shoot a cube at current target
    const targ = this.brainTargets[this.brainTargetOn]
    this.brainTargetOn = (this.brainTargetOn + 1) % this.numBrainTargets

    // spawn brain missile
    const newMObj = this.mObjHandler.spawnMissile(mo, targ, MObjType.Spawnshot)
    newMObj.target = targ
    newMObj.reactionTime = ((targ.y - mo.y) / newMObj.momY >> 0) /
      newMObj.state.tics >> 0

    this.dSound.startSound(null, Sfx.Bospit)
  }

  // travelling cube sound
  spawnSound(mo: MObj): void {
    this.dSound.startSound(mo, Sfx.Boscub)
    this.spawnFly(mo)
  }

  spawnFly(mo: MObj): void {
    if (--mo.reactionTime) {
      // still flying
      return
    }

    const targ = mo.target

    if (targ === null) {
      throw 'targ = null'
    }

    // First spawn teleport fog.
    this.mObjHandler.spawnMObj(targ.x, targ.y, targ.z, MObjType.Spawnfire)
    this.dSound.startSound(mo, Sfx.Telept)

    // Randomly select monster to spawn.
    const r = random.pRandom()

    // Probability distribution (kind of :),
    // decreasing likelihood.
    let type: MObjType
    if (r < 50) {
      type = MObjType.Troop
    } else if (r < 90) {
      type = MObjType.Sergeant
    } else if (r < 120) {
      type = MObjType.Shadows
    } else if (r < 130) {
      type = MObjType.Pain
    } else if (r < 160) {
      type = MObjType.Head
    } else if (r < 162) {
      type = MObjType.Vile
    } else if (r < 172) {
      type = MObjType.Undead
    } else if (r < 192) {
      type = MObjType.Baby
    } else if (r < 222) {
      type = MObjType.Fatso
    } else if (r < 246) {
      type = MObjType.Knight
    } else {
      type = MObjType.Bruiser
    }

    const newMObj = this.mObjHandler.spawnMObj(targ.x, targ.y, targ.z, type)

    if (this.lookForPlayers(newMObj, true)) {
      this.mObjHandler.setMObjState(newMObj, newMObj.info.seeState)
    }

    // telefrag anything in this spot
    this.map.teleportMove(newMObj, newMObj.x, newMObj.y)

    // remove self (i.e., cube).
    this.mObjHandler.removeMObj(mo)
  }

  playerScream(mo: MObj): void {
    // Default death sound.
    let sound = Sfx.Pldeth

    if (this.doom.gameMode === GameMode.Commercial &&
      mo.health < -50
    ) {
      // IF THE PLAYER DIES
      // LESS THAN -50% WITHOUT GIBBING
      sound = Sfx.Pdiehi
    }

    this.dSound.startSound(mo, sound)
  }
}
