import { ANG45, ANGLE_TO_FINE_SHIFT, FINE_ANGLES, fineSine } from '../misc/table'
import { Cheat, PlayerState } from '../doom/player'
import { FLOAT_SPEED, GRAVITY, ITEM_QUE_SIZE, MAX_MOVE, MELEE_RANGE, ON_CEILING_Z, ON_FLOOR_Z, VIEW_HEIGHT } from './local'
import { FRACBITS, FRACUNIT, mul } from '../misc/fixed'
import { MTF_AMBUSH, Skill } from '../global/doomdef'
import { Sound as DSound } from '../doom/sound'
import { Doom } from '../doom/doom'
import { Enemy } from './enemy'
import { Game } from '../game/game'
import { HeadsUp } from '../heads-up/stuff'
import { MObj } from './mobj/mobj'
import { MObjFlag } from './mobj/mobj-flag'
import { MObjType } from '../doom/info/mobj-type'
import { Map } from './map'
import { MapThing } from '../doom/data'
import { MapUtils } from './map-utils'
import { PSprite } from './p-sprite'
import { Play } from './setup'
import { Rendering } from '../rendering/rendering'
import { Sfx } from '../doom/sounds/sfx'
import { State } from '../doom/info/state'
import { StateNum } from '../doom/info/state-num'
import { StatusBar } from '../status/stuff'
import { Tick } from './tick'
import { mObjInfos } from '../doom/info/mobj-infos'
import { noopFunc } from '../doom/think'
import { random } from '../misc/random'
import { states } from '../doom/info/states'

const STOP_SPEED = 0x1000
const FRICTION = 0xe800

export class MObjHandler {
  private get doom(): Doom {
    return this.play.doom
  }
  private get dSound(): DSound {
    return this.play.dSound
  }
  private get enemy(): Enemy {
    return this.play.enemy
  }
  private get game(): Game {
    return this.doom.game
  }
  private get headsUp(): HeadsUp {
    return this.doom.headsUp
  }
  private get map(): Map {
    return this.play.map
  }
  private get mapUtils(): MapUtils {
    return this.play.mapUtils
  }
  private get pSprite(): PSprite {
    return this.play.pSprite
  }
  private get rendering(): Rendering {
    return this.play.rendering
  }
  private get statusBar(): StatusBar {
    return this.doom.statusBar
  }
  private get tick(): Tick {
    return this.play.tick
  }

  constructor(private play: Play) { }

  //
  // P_SetMobjState
  // Returns true if the mobj is still present.
  //
  setMObjState(mobj: MObj, state: StateNum): boolean {
    let st: State<unknown, [MObj]>
    do {
      if (state === StateNum.Null) {
        mobj.state = states[StateNum.Null] as State<unknown, [MObj]>
        this.removeMObj(mobj)
        return false
      }

      st = states[state] as State<unknown, [MObj]>
      mobj.state = st
      mobj.tics = st.tics
      mobj.sprite = st.sprite
      mobj.frame = st.frame

      // Modified handling.
      // Call action functions when the state is set
      if (st.action !== null) {
        let handler: unknown
        switch (st.handlerType) {
        case Enemy:
          handler = this.enemy
          break
        default:
          debugger
        }
        st.action.call(handler, mobj)
      }

      state = st.nextState
    } while (!mobj.tics)

    return true
  }

  //
  // P_ExplodeMissile
  //
  private explodeMissile(mo: MObj): void {
    mo.momX = mo.momY = mo.momZ = 0

    this.setMObjState(mo, mObjInfos[mo.type].deathState)

    mo.tics -= random.pRandom() & 3

    if (mo.tics < 1) {
      mo.tics = 1
    }

    mo.flags &= ~MObjFlag.Missile

    if (mo.info.deathSound) {
      this.dSound.startSound(mo, mo.info.deathSound)
    }
  }

  //
  // P_XYMovement
  //
  private xyMovement(mo: MObj): void {
    if (!mo.momX && !mo.momY) {
      if (mo.flags & MObjFlag.SkullFly) {
        // the skull slammed into something
        mo.flags &= ~MObjFlag.SkullFly
        mo.momX = mo.momY = mo.momZ = 0

        this.setMObjState(mo, mo.info.spawnState)
      }
      return
    }

    const player = mo.player

    if (mo.momX > MAX_MOVE) {
      mo.momX = MAX_MOVE
    } else if (mo.momX < -MAX_MOVE) {
      mo.momX = -MAX_MOVE
    }

    if (mo.momY > MAX_MOVE) {
      mo.momY = MAX_MOVE
    } else if (mo.momY < -MAX_MOVE) {
      mo.momY = -MAX_MOVE
    }

    let xMove = mo.momX
    let yMove = mo.momY
    let pTryX: number
    let pTryY: number
    do {
      if (xMove > MAX_MOVE / 2 || yMove > MAX_MOVE / 2) {
        pTryX = mo.x + (xMove / 2 >> 0)
        pTryY = mo.y + (yMove / 2 >> 0)
        xMove >>= 1
        yMove >>= 1
      } else {
        pTryX = mo.x + xMove
        pTryY = mo.y + yMove
        xMove = yMove = 0
      }
      if (!this.map.tryMove(mo, pTryX, pTryY)) {
        // blocked move
        if (mo.player) {
          // try to slide along it
          this.map.slideMove(mo)
        } else if (mo.flags & MObjFlag.Missile) {
          // explode a missile
          if (this.map.ceilingLine &&
            this.map.ceilingLine.backSector &&
            this.map.ceilingLine.backSector.ceilingPic === this.rendering.sky.skyFlatNum
          ) {
            // Hack to prevent missiles exploding
            // against the sky.
            // Does not handle sky floors.
            this.removeMObj(mo)
            return
          }
          this.explodeMissile(mo)
        } else {
          mo.momX = mo.momY = 0
        }
      }

    } while (xMove || yMove)

    // slow down
    if (player && player.cheats & Cheat.NoMomentum) {
      // debug option for no sliding at all
      mo.momX = mo.momY = 0
      return
    }

    if (mo.flags & (MObjFlag.Missile | MObjFlag.SkullFly)) {
      // no friction for missiles ever
      return
    }

    if (mo.z > mo.floorZ) {
      // no friction when airborne
      return
    }

    if (mo.flags & MObjFlag.Corpse) {
      // do not stop sliding
      //  if halfway off a step with some momentum
      if (mo.momX > FRACUNIT / 4 ||
        mo.momX < -FRACUNIT / 4 ||
        mo.momY > FRACUNIT / 4 ||
        mo.momY < -FRACUNIT / 4
      ) {
        if (mo.subSector === null) {
          throw 'mo.subSector = null'
        }
        if (mo.subSector.sector === null) {
          throw 'mo.subSector.sector = null'
        }
        if (mo.floorZ !== mo.subSector.sector.floorHeight) {
          return
        }
      }
    }

    if (mo.momX > -STOP_SPEED &&
      mo.momX < STOP_SPEED &&
      mo.momY > -STOP_SPEED &&
      mo.momY < STOP_SPEED &&
      (!player ||
        player.cmd.forwardMove === 0 &&
        player.cmd.sideMove === 0)
    ) {
      if (player !== null) {
        if (player.mo === null) {
          throw 'player.mo = null'
        }

        // if in a walking frame, stop moving
        if (states.indexOf(player.mo.state as State<unknown, [unknown]>) - StateNum.PlayRun1 < 4) {
          this.setMObjState(player.mo, StateNum.Play)
        }
      }

      mo.momX = 0
      mo.momY = 0
    } else {
      mo.momX = mul(mo.momX, FRICTION)
      mo.momY = mul(mo.momY, FRICTION)
    }
  }

  //
  // P_ZMovement
  //
  private zMovement(mo: MObj): void {
    // check for smooth step up
    if (mo.player && mo.z < mo.floorZ) {
      mo.player.viewHeight -= mo.floorZ - mo.z

      mo.player.deltaViewHeight =
        VIEW_HEIGHT - mo.player.viewHeight >> 3
    }

    // adjust height
    mo.z += mo.momZ

    if (mo.flags & MObjFlag.Float &&
      mo.target
    ) {
      // float down towards target if too close
      if (!(mo.flags & MObjFlag.SkullFly) &&
        !(mo.flags & MObjFlag.InFloat)
      ) {
        const dist = this.mapUtils.aproxDistance(
          mo.x - mo.target.x,
          mo.y - mo.target.y)

        const delta = mo.target.z + (mo.height >> 1) - mo.z

        if (delta < 0 && dist < -(delta * 3)) {
          mo.z -= FLOAT_SPEED
        } else if (delta > 0 && dist < delta * 3) {
          mo.z += FLOAT_SPEED
        }
      }
    }

    // clip movement
    if (mo.z <= mo.floorZ) {
      // hit the floor

      // Note (id):
      //  somebody left this after the setting momz to 0,
      //  kinda useless there.
      if (mo.flags & MObjFlag.SkullFly) {
        // the skull slammed into something
        mo.momZ = -mo.momZ
      }

      if (mo.momZ < 0) {
        if (mo.player &&
          mo.momZ < -GRAVITY * 8
        ) {
          // Squat down.
          // Decrease viewheight for a moment
          // after hitting the ground (hard),
          // and utter appropriate sound.
          mo.player.deltaViewHeight = mo.momZ >> 3
          this.dSound.startSound(mo, Sfx.Oof)
        }
        mo.momZ = 0
      }
      mo.z = mo.floorZ

      if (mo.flags & MObjFlag.Missile &&
        !(mo.flags & MObjFlag.NoClip)
      ) {
        this.explodeMissile(mo)
        return
      }

    } else if (!(mo.flags & MObjFlag.NoGravity)) {
      if (mo.momZ === 0) {
        mo.momZ = -GRAVITY * 2
      } else {
        mo.momZ -= GRAVITY
      }
    }

    if (mo.z + mo.height > mo.ceilingZ) {
      // hit the ceiling
      if (mo.momZ > 0) {
        mo.momZ = 0
      }
      mo.z = mo.ceilingZ - mo.height

      if (mo.flags & MObjFlag.SkullFly) {
        // the skull slammed into something
        mo.momZ = -mo.momZ
      }

      if (mo.flags & MObjFlag.Missile &&
        !(mo.flags & MObjFlag.NoClip)
      ) {
        this.explodeMissile(mo)
        return
      }
    }
  }

  //
  // P_MobjThinker
  //
  thinker(mObj: MObj): void {
    // momentum movement
    if (mObj.momX ||
      mObj.momY ||
      mObj.flags & MObjFlag.SkullFly
    ) {
      this.xyMovement(mObj)
    }

    if (mObj.func === noopFunc) {
      // mobj was removed
      return
    }

    if (mObj.z !== mObj.floorZ ||
      mObj.momZ
    ) {
      this.zMovement(mObj)
    }

    if (mObj.func === noopFunc) {
      // mobj was removed
      return
    }

    // cycle through states,
    // calling action functions at transitions
    if (mObj.tics !== -1) {
      mObj.tics--

      // you can cycle through multiple states in a tic
      if (!mObj.tics) {
        if (!this.setMObjState(mObj, mObj.state.nextState)) {
          // freed itself
          return
        }
      }
    } else {
      // check for nightmare respawn
      if (!(mObj.flags & MObjFlag.CountKill)) {
        return
      }

      if (!this.game.respawnMonsters) {
        return
      }

      mObj.moveCount++

      if (mObj.moveCount < 12 * 35) {
        return
      }

      if (this.tick.levelTime & 31) {
        return
      }

      if (random.pRandom() > 4) {
        return
      }

      debugger
    }
  }

  //
  // P_SpawnMobj
  //
  spawnMObj(x: number, y: number, z: number, type: MObjType): MObj {
    const mObj = new MObj(this.play, this.thinker, x, y, z, type)

    this.tick.addThinker(mObj)

    return mObj
  }

  //
  // P_RemoveMobj
  //
  private itemRespawnQue = Array.from({ length: ITEM_QUE_SIZE }, () => new MapThing())
  private itemRespawnTime = new Array<number>(ITEM_QUE_SIZE).fill(0)
  private iQueHead = 0
  private iQueTail = 0
  removeMObj(mobj: MObj): void {
    if (mobj.flags & MObjFlag.Special &&
      !(mobj.flags & MObjFlag.Dropped) &&
      mobj.type !== MObjType.Inv &&
      mobj.type !== MObjType.Ins
    ) {
      if (mobj.spawnPoint === null) {
        throw 'mobj.spawnPoint = null'
      }
      this.itemRespawnQue[this.iQueHead] = mobj.spawnPoint
      this.itemRespawnTime[this.iQueHead] = this.tick.levelTime
      this.iQueHead = this.iQueHead + 1 & ITEM_QUE_SIZE - 1

      // lose one off the end?
      if (this.iQueHead === this.iQueTail) {
        this.iQueTail = this.iQueTail + 1 & ITEM_QUE_SIZE - 1
      }
    }

    // unlink from sector and block lists
    this.mapUtils.unsetThingPosition(mobj)

    // stop any playing sound
    this.dSound.stopSound(mobj)

    // free block
    this.tick.removeThinker(mobj)
  }

  //
  // P_RespawnSpecials
  //
  respawnSpecials(): void {
    // only respawn items in deathmatch
    if (this.game.deathMatch !== 2) {
      return
    }

    // nothing left to respawn?
    if (this.iQueHead === this.iQueTail) {
      return
    }

    // wait at least 30 seconds
    if (this.tick.levelTime - this.itemRespawnTime[this.iQueTail] < 30 * 35) {
      return
    }

    const mThing = this.itemRespawnQue[this.iQueTail]

    const x = mThing.x << FRACBITS
    const y = mThing.y << FRACBITS

    // spawn a teleport fog at the new spot
    const ss = this.rendering.pointInSubSector(x, y)
    if (ss.sector === null) {
      throw 'ss.sector = null'
    }
    let mo = this.spawnMObj(x, y, ss.sector.floorHeight, MObjType.Ifog)
    this.dSound.startSound(mo, Sfx.Itmbk)

    // find which type to spawn
    let i: number
    for (i = 0 ; i < MObjType.NUM_MOBJ_TYPES; i++) {
      if (mThing.type === mObjInfos[i].doomedNum) {
        break
      }
    }

    // spawn it
    let z: number
    if (mObjInfos[i].flags & MObjFlag.SpawnCeiling) {
      z = ON_CEILING_Z
    } else {
      z = ON_FLOOR_Z
    }

    mo = this.spawnMObj(x, y, z, i)
    mo.spawnPoint = mThing
    mo.angle = ANG45 * (mThing.angle / 45 >> 0) >>> 0

    // pull it from the que
    this.iQueTail = this.iQueTail + 1 & ITEM_QUE_SIZE - 1
  }

  //
  // P_SpawnPlayer
  // Called when a player is spawned on the level.
  // Most of the player structure stays unchanged
  //  between levels.
  //
  private spawnPlayer(mThing: MapThing): void {
    // not playing?
    if (!this.doom.game.playerInGame[mThing.type - 1]) {
      return
    }

    const p = this.doom.game.players[mThing.type - 1]

    if (p.playerState === PlayerState.Reborn) {
      this.game.playerReborn(mThing.type - 1)
    }

    const x = mThing.x << FRACBITS
    const y = mThing.y << FRACBITS
    const z = ON_FLOOR_Z
    const mObj = this.spawnMObj(x, y, z, MObjType.Player)

    // set color translations for player sprites
    if (mThing.type > 1) {
      mObj.flags |= mThing.type - 1 << MObjFlag.TransShift
    }

    mObj.angle = ANG45 * mThing.angle / 45 >>> 0
    mObj.player = p
    mObj.health = p.health

    p.mo = mObj
    p.playerState = PlayerState.Live
    p.refire = 0
    p.message = null
    p.damageCount = 0
    p.bonusCount = 0
    p.extraLight = 0
    p.fixedColorMap = 0
    p.viewHeight = VIEW_HEIGHT

    // setup gun psprite
    this.pSprite.setupPSprites(p)

    // // give all cards in death match mode
    // if (deathmatch) {
    //   for (i=0 ; i<NUMCARDS ; i++) {
    //     p->cards[i] = true;
    //   }
    // }

    if (mThing.type - 1 === this.game.consolePlayer) {
      // wake up the status bar
      this.statusBar.start()
      // wake up the heads up text
      this.headsUp.start()
    }
  }

  //
  // P_SpawnMapThing
  // The fields of the mapthing should
  // already be in host byte order.
  //
  spawnMapThing(mThing: MapThing): void {
    // count deathmatch start positions
    if (mThing.type === 11) {
      // if (deathmatch_p < &deathmatchstarts[10])
      // {
      //     memcpy (deathmatch_p, mthing, sizeof(*mthing));
      //     deathmatch_p++;
      // }
      return
    }

    // check for players specially
    if (mThing.type <= 4) {
      // save spots for respawning in network games
      // playerstarts[mthing->type-1] = *mthing;
      if (!this.doom.game.deathMatch) {
        this.spawnPlayer(mThing)
      }
      return
    }

    // check for apropriate skill level
    if (!this.doom.game.netGame && mThing.options & 16) {
      return
    }

    let bit: number
    if (this.doom.game.gameSkill === Skill.Baby) {
      bit = 1
    } else if (this.doom.game.gameSkill === Skill.Nightmare) {
      bit = 4
    } else {
      bit = 1 << this.doom.game.gameSkill - 1
    }
    if (!(mThing.options & bit)) {
      return
    }

    // find which type to spawn
    let i: number
    for (i = 0; i < MObjType.NUM_MOBJ_TYPES; ++i) {
      if (mThing.type === mObjInfos[i].doomedNum) {
        break
      }
    }

    if (i === MObjType.NUM_MOBJ_TYPES) {
      throw `P_SpawnMapThing: Unknown type ${mThing.type} at (${mThing.x}, ${mThing.y})`
    }

    // don't spawn keycards and players in deathmatch
    if (this.doom.game.deathMatch && mObjInfos[i].flags & MObjFlag.NotDMatch) {
      return
    }

    // don't spawn any monsters if -nomonsters
    if (this.doom.noMonsters && (
      i === MObjType.Skull ||
      mObjInfos[i].flags & MObjFlag.CountKill)
    ) {
      return
    }

    // spawn it
    const x = mThing.x << FRACBITS
    const y = mThing.y << FRACBITS
    let z = ON_FLOOR_Z
    if (mObjInfos[i].flags & MObjFlag.SpawnCeiling) {
      z = ON_CEILING_Z
    }

    const mObj = this.spawnMObj(x, y, z, i)
    mObj.spawnPoint = mThing

    if (mObj.tics > 0) {
      mObj.tics = 1 + random.pRandom() % mObj.tics
    }
    if (mObj.flags & MObjFlag.CountKill) {
      this.doom.game.totalKills++
    }
    if (mObj.flags & MObjFlag.CountItem) {
      this.doom.game.totalItems++
    }

    mObj.angle = ANG45 * (mThing.angle / 45) >>> 0
    if (mThing.options & MTF_AMBUSH) {
      mObj.flags |= MObjFlag.Ambush
    }
  }


  //
  // GAME SPAWN FUNCTIONS
  //

  //
  // P_SpawnPuff
  //
  spawnPuff(x: number, y: number, z: number): void {
    z += random.pRandom() - random.pRandom() << 10

    const th = this.spawnMObj(x, y, z, MObjType.Puff)
    th.momZ = FRACUNIT
    th.tics -= random.pRandom() & 3

    if (th.tics < 1) {
      th.tics = 1
    }

    // don't make punches spark on the wall
    if (this.map.attackRange === MELEE_RANGE) {
      this.setMObjState(th, StateNum.Puff3)
    }
  }

  //
  // P_SpawnBlood
  //
  spawnBlood(x: number, y: number, z: number, damage: number): void {
    z += random.pRandom() - random.pRandom() << 10

    const th = this.spawnMObj(x, y, z, MObjType.Blood)
    th.momZ = FRACUNIT * 2
    th.tics -= random.pRandom() & 3

    if (th.tics < 1) {
      th.tics = 1
    }

    if (damage <= 12 && damage >= 9) {
      this.setMObjState(th, StateNum.Blood2)
    } else if (damage < 9) {
      this.setMObjState(th, StateNum.Blood3)
    }
  }

  //
  // P_CheckMissileSpawn
  // Moves the missile forward a bit
  //  and possibly explodes it right there.
  //
  private checkMissileSpawn(th: MObj): void {
    th.tics -= random.pRandom() & 3
    if (th.tics < 1) {
      th.tics = 1
    }

    // move a little forward so an angle can
    // be computed if it immediately explodes
    th.x += th.momX >> 1
    th.y += th.momY >> 1
    th.z += th.momZ >> 1

    if (!this.map.tryMove(th, th.x, th.y)) {
      this.explodeMissile(th)
    }
  }

  //
  // P_SpawnMissile
  //
  spawnMissile(source: MObj, dest: MObj, type: MObjType): MObj {
    const th = this.spawnMObj(source.x,
      source.y,
      source.z + 4 * 8 * FRACUNIT, type)

    if (th.info.seeSound) {
      this.dSound.startSound(th, th.info.seeSound)
    }

    // where it came from
    th.target = source

    let an = this.rendering.pointToAngle2(source.x, source.y, dest.x, dest.y)

    // fuzzy player
    if (dest.flags & MObjFlag.Shadow) {
      an = an + (random.pRandom() - random.pRandom() << 20) >>> 0
    }

    th.angle = an
    an >>>= ANGLE_TO_FINE_SHIFT
    th.momX = mul(th.info.speed, fineSine[FINE_ANGLES / 4 + an])
    th.momY = mul(th.info.speed, fineSine[an])

    let dist = this.mapUtils.aproxDistance(dest.x - source.x, dest.y - source.y)
    dist = dist / th.info.speed >> 0

    if (dist < 1) {
      dist = 1
    }

    th.momZ = (dest.z - source.z) / dist >> 0
    this.checkMissileSpawn(th)

    return th
  }

  //
  // P_SpawnPlayerMissile
  // Tries to aim at a nearby monster
  //
  spawnPlayerMissile(source: MObj, type: MObjType): void {
    // see which target is to be aimed at
    let an = source.angle
    let slope = this.map.aimLineAttack(source, an, 16 * 64 * FRACUNIT)

    if (!this.map.lineTarget) {
      an = an + (1 << 26) >>> 0
      slope = this.map.aimLineAttack(source, an, 16 * 64 * FRACUNIT)
      if (!this.map.lineTarget) {
        an = an - (2 << 26) >>> 0
        slope = this.map.aimLineAttack(source, an, 16 * 64 * FRACUNIT)
      }

      if (!this.map.lineTarget) {
        an = source.angle
        slope = 0
      }
    }

    const x = source.x
    const y = source.y
    const z = source.z + 4 * 8 * FRACUNIT

    const th = this.spawnMObj(x, y, z, type)

    if (th.info.seeSound) {
      this.dSound.startSound(th, th.info.seeSound)
    }

    th.target = source
    th.angle = an
    th.momX = mul(th.info.speed,
      fineSine[FINE_ANGLES / 4 + (an >>> ANGLE_TO_FINE_SHIFT)])
    th.momY = mul(th.info.speed,
      fineSine[an >>> ANGLE_TO_FINE_SHIFT])
    th.momZ = mul(th.info.speed, slope)

    this.checkMissileSpawn(th)
  }
}
