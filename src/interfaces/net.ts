import { Net as DNet, DOOMCOM_ID } from '../doom/net'
import { Doom } from '../doom/doom'
import { DoomCom } from '../doom/net/doom-com'
import { Game } from '../game/game'

export class Net {
  private get dNet(): DNet {
    return this.doom.net
  }
  private get game(): Game {
    return this.doom.game
  }
  constructor(private doom: Doom) { }

  //
  // I_InitNetwork
  //
  initNetwork(): void {
    const doomCom = new DoomCom()
    this.dNet.doomCom = doomCom

    // set up for network
    const i = this.doom.params.dup
    if (i !== undefined) {
      doomCom.ticDup = i
      if (doomCom.ticDup < 1) {
        doomCom.ticDup = 1
      }
      if (doomCom.ticDup > 9) {
        doomCom.ticDup = 9
      }
    } else {
      doomCom.ticDup = 1
    }

    if (this.doom.params.extraTic) {
      doomCom.extraTics = 1
    } else {
      doomCom.extraTics = 0
    }

    // parse network game options,
    //  -net <consoleplayer> <host> <host> ...
    if (!this.doom.params.net) {
      // single player game
      this.game.netGame = false
      doomCom.id = DOOMCOM_ID
      doomCom.numPlayers = doomCom.numNodes = 1
      doomCom.deathMatch = false
      doomCom.consolePlayer = 0
      return
    }

    debugger
  }
}
