import { FRACBITS, mul } from '../misc/fixed'
import { GRAVITY, ITEM_QUE_SIZE, MAX_MOVE, ON_CEILING_Z, ON_FLOOR_Z, VIEW_HEIGHT } from './local'
import { MObj, MObjFlag } from './mobj'
import { MObjType, State, StateNum, mObjInfo, states } from '../doom/info'
import { MTF_AMBUSH, Skill } from '../global/doomdef'
import { ANG45 } from '../misc/table'
import { Doom } from '../doom/doom'
import { Game } from '../game/game'
import { HeadsUp } from '../heads-up/stuff'
import { Map } from './map'
import { MapThing } from '../doom/data'
import { MapUtils } from './map-utils'
import { Play } from './setup'
import { PlayerState } from '../doom/player'
import { StatusBar } from '../status/stuff'
import { Tick } from './tick'
import { noopFunc } from '../doom/think'
import { random } from '../misc/random'

const STOP_SPEED = 0x1000
const FRICTION = 0xe800

export class MObjHandler {
  private get doom(): Doom {
    return this.play.doom
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
    let st: State
    do {
      if (state === StateNum.Null) {
        mobj.state = states[StateNum.Null]
        this.removeMObj(mobj)
        return false
      }

      st = states[state]
      mobj.state = st
      mobj.tics = st.tics
      mobj.sprite = st.sprite
      mobj.frame = st.frame

      // Modified handling.
      // Call action functions when the state is set
      if (st.action !== null) {
        st.action(mobj)
      }

      state = st.nextState
    } while (!mobj.tics)

    return true
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
        pTryX = mo.x + xMove / 2
        pTryY = mo.y + yMove / 2
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
        } else {
          mo.momX = mo.momY = 0
        }
      }


    } while (xMove || yMove)

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
        if (states.indexOf(player.mo.state) - StateNum.PlayRun1 < 0) {
          debugger
        }
        if (states.indexOf(player.mo.state) - StateNum.PlayRun1 < 4) {
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
          mo.momZ < GRAVITY * 8
        ) {
          // Squat down.
          // Decrease viewheight for a moment
          // after hitting the ground (hard),
          // and utter appropriate sound.
          mo.player.deltaViewHeight = mo.momZ >> 3
        }
        mo.momZ = 0
      }
      mo.z = mo.floorZ
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
    }
  }

  //
  // P_SpawnMobj
  //
  private spawnMObj(x: number, y: number, z: number, type: MObjType): MObj {
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

    // free block
    this.tick.removeThinker(mobj)
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

    // // setup gun psprite
    // P_SetupPsprites (p);

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
    // if (mthing->type-1 == consoleplayer) {
    //   // wake up the status bar
    //   ST_Start ();
    //   // wake up the heads up text
    //   HU_Start ();
    // }
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
    for (i = 0; i < MObjType.NUMMOBJTYPES; ++i) {
      if (mThing.type === mObjInfo[i].doomedNum) {
        break
      }
    }

    if (i === MObjType.NUMMOBJTYPES) {
      throw `P_SpawnMapThing: Unknown type ${mThing.type} at (${mThing.x}, ${mThing.y})`
    }

    // don't spawn keycards and players in deathmatch
    if (this.doom.game.deathMatch && mObjInfo[i].flags & MObjFlag.NotDMatch) {
      return
    }

    // don't spawn any monsters if -nomonsters
    if (this.doom.noMonsters && (
      i === MObjType.Skull ||
      mObjInfo[i].flags & MObjFlag.CountKill)
    ) {
      return
    }

    // spawn it
    const x = mThing.x << FRACBITS
    const y = mThing.y << FRACBITS
    let z = ON_FLOOR_Z
    if (mObjInfo[i].flags & MObjFlag.SpawnCeiling) {
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

}
