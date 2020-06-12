import { Cheat, Player, PlayerState } from '../doom/player'
import { FINE_ANGLES, FINE_MASK, fineSine } from '../misc/table'
import { FRACUNIT, mul } from '../misc/fixed'
import { Play } from './setup'
import { Tick } from './tick'
import { VIEW_HEIGHT } from './local'


//
// Movement.
//

// 16 pixels of bob
const MAX_BOB = 0x100000

export class User {
  private onGround = false

  private get tick(): Tick {
    return this.play.tick
  }
  constructor(private play: Play) { }

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
  // P_PlayerThink
  //
  playerThink(player: Player): void {
    this.calcHeight(player)
  }
}
