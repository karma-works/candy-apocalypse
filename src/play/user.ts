import { ANG90, ANGLE_TO_FINE_SHIFT, FINE_ANGLES, FINE_MASK, fineSine } from '../misc/table'
import { Cheat, Player, PlayerState } from '../doom/player'
import { FRACUNIT, mul } from '../misc/fixed'
import { ButtonCode } from '../doom/event'
import { MObjFlag } from './mobj/mobj-flag'
import { MObjHandler } from './mobj-handler'
import { Map } from './map'
import { PSprite } from './p-sprite'
import { Play } from './setup'
import { PowerType } from '../global/doomdef'
import { StateNum } from '../doom/info/state-num'
import { Tick } from './tick'
import { VIEW_HEIGHT } from './local'
import { states } from '../doom/info/states'


//
// Movement.
//

// 16 pixels of bob
const MAX_BOB = 0x100000

export class User {
  private onGround = false

  private get map(): Map {
    return this.play.map
  }
  private get mObjHandler(): MObjHandler {
    return this.play.mObjHandler
  }
  private get pSprite(): PSprite {
    return this.play.pSprite
  }
  private get tick(): Tick {
    return this.play.tick
  }
  constructor(private play: Play) { }

  //
  // P_Thrust
  // Moves the given origin along a given angle.
  //
  private thrust(player: Player, angle: number, move: number): void {
    angle >>>= ANGLE_TO_FINE_SHIFT

    if (player.mo === null) {
      throw 'player.mo = null'
    }
    player.mo.momX += mul(move, fineSine[FINE_ANGLES / 4 + angle])
    player.mo.momY += mul(move, fineSine[angle])
  }

  //
  // P_CalcHeight
  // Calculate the walking / running height adjustment
  //
  private calcHeight(player: Player): void {
    // Regular movement bobbing
    // (needs to be calculated for gun swing
    // even if not on ground)
    // OPTIMIZE: tablify angle
    // Note: a LUT allows for effects
    //  like a ramp with low health.
    if (player.mo === null) {
      throw 'player.mo = null'
    }

    player.bob = mul(player.mo.momX, player.mo.momX) +
        mul(player.mo.momY, player.mo.momY)

    player.bob >>= 2

    if (player.bob > MAX_BOB) {
      player.bob = MAX_BOB
    }

    if (player.cheats & Cheat.NoMomentum ||
      !this.onGround
    ) {
      player.viewZ = player.mo.z + VIEW_HEIGHT

      if (player.viewZ > player.mo.ceilingZ - 4 * FRACUNIT) {
        player.viewZ = player.mo.ceilingZ - 4 * FRACUNIT
      }

      player.viewZ = player.mo.z + player.viewHeight
      return
    }


    const angle = FINE_ANGLES / 20 * this.tick.levelTime & FINE_MASK
    const bob = mul(player.bob / 2, fineSine[angle])

    // move viewheight
    if (player.playerState === PlayerState.Live) {
      player.viewHeight += player.deltaViewHeight

      if (player.viewHeight > VIEW_HEIGHT) {
        player.viewHeight = VIEW_HEIGHT
        player.deltaViewHeight = 0
      }

      if (player.viewHeight < VIEW_HEIGHT / 2) {
        player.viewHeight = VIEW_HEIGHT / 2
        if (player.deltaViewHeight <= 0) {
          player.deltaViewHeight = 1
        }
      }

      if (player.deltaViewHeight) {
        player.deltaViewHeight += FRACUNIT / 4
        if (!player.deltaViewHeight) {
          player.deltaViewHeight = 1
        }
      }
    }
    player.viewZ = player.mo.z + player.viewHeight + bob

    if (player.viewZ > player.mo.ceilingZ - 4 * FRACUNIT) {
      player.viewZ = player.mo.ceilingZ - 4 * FRACUNIT
    }
  }

  //
  // P_MovePlayer
  //
  private movePlayer(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }

    const cmd = player.cmd

    player.mo.angle += cmd.angleTurn << 16 >>> 0
    player.mo.angle >>>= 0

    // Do not let the player control movement
    //  if not onground.
    this.onGround = player.mo.z <= player.mo.floorZ

    if (cmd.forwardMove && this.onGround) {
      this.thrust(player, player.mo.angle, cmd.forwardMove * 2048)
    }
    if (cmd.sideMove && this.onGround) {
      this.thrust(player, player.mo.angle - ANG90 >>> 0, cmd.sideMove * 2048)
    }

    if ((cmd.forwardMove || cmd.sideMove) &&
      player.mo.state === states[StateNum.Play]
    ) {
      this.mObjHandler.setMObjState(player.mo, StateNum.PlayRun1)
    }
  }

  //
  // P_PlayerThink
  //
  playerThink(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }

    const cmd = player.cmd

    // Move around.
    // Reactiontime is used to prevent movement
    //  for a bit after a teleport.
    if (player.mo.reactionTime) {
      player.mo.reactionTime--
    } else {
      this.movePlayer(player)
    }

    this.calcHeight(player)

    // check for use
    if (cmd.buttons & ButtonCode.Use) {
      if (!player.useDown) {
        this.map.useLines(player)
        player.useDown = true
      }
    } else {
      player.useDown = false
    }

    // cycle psprites
    this.pSprite.movePSprites(player)

    // Counters, time dependend power ups.

    // Strength counts up to diminish fade.
    if (player.powers[PowerType.Strength]) {
      player.powers[PowerType.Strength]++
    }

    if (player.powers[PowerType.Invulnerability]) {
      player.powers[PowerType.Invulnerability]--
    }

    if (player.powers[PowerType.Invisibility]) {
      if (!--player.powers[PowerType.Invisibility]) {
        player.mo.flags &= ~MObjFlag.Shadow
      }
    }

    if (player.powers[PowerType.Infrared]) {
      player.powers[PowerType.Infrared]--
    }

    if (player.powers[PowerType.Ironfeet]) {
      player.powers[PowerType.Ironfeet]--
    }

    if (player.damageCount) {
      player.damageCount--
    }

    if (player.bonusCount) {
      player.bonusCount--
    }
  }
}
