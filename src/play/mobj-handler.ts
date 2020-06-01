import { MObj, MObjFlag } from './mobj'
import { MObjType, mObjInfo } from '../doom/info'
import { MTF_AMBUSH, Skill } from '../global/doomdef'
import { ON_CEILING_Z, ON_FLOOR_Z, VIEW_HEIGHT } from './local'
import { ANG45 } from '../misc/table'
import { Doom } from '../doom/doom'
import { FRACBITS } from '../misc/fixed'
import { MapThing } from '../doom/data'
import { Play } from './setup'
import { PlayerState } from '../doom/player'
import { random } from '../misc/random'

export class MObjHandler {

  constructor(private play: Play,
              private doom: Doom) { }

  //
  // P_SpawnMobj
  //
  private spawnMObj(x: number, y: number, z: number, type: MObjType): MObj {
    return new MObj(this.play, x, y, z, type)
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
      // this.game.playerReborn(mThing.type - 1)
    }

    const x = mThing.x << FRACBITS
    const y = mThing.y << FRACBITS
    const z = ON_FLOOR_Z
    const mObj = this.spawnMObj(x, y, z, MObjType.Player)

    // set color translations for player sprites
    if (mThing.type > 1) {
      mObj.flags |= mThing.type - 1 << MObjFlag.TransShift
    }

    mObj.angle = ANG45 * mThing.angle / 45
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
      if (this.doom.game.deathMatch) {
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

    mObj.angle = ANG45 * (mThing.angle / 45)
    if (mThing.options & MTF_AMBUSH) {
      mObj.flags |= MObjFlag.Ambush
    }
  }

}
