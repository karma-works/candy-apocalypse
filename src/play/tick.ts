import { Game } from '../game/game'
import { MAX_PLAYERS } from '../global/doomdef'
import { Play } from './setup'
import { Thinker } from '../doom/think'
import { User } from './user'

//
// THINKERS
// All thinkers should be allocated by Z_Malloc
// so they can be operated on uniformly.
// The actual structures will vary in size,
// but the first element must be thinker_t.
//

export class Tick {
  levelTime = -1

  // Both the head and tail of the thinker list.
  thinkerCap = new Thinker()

  private get game(): Game {
    return this.play.game
  }
  private get user(): User {
    return this.play.user
  }
  constructor(private play: Play) { }

  //
  // P_InitThinkers
  //
  initThinkers(): void {
    this.thinkerCap.prev = this.thinkerCap.next = this.thinkerCap
  }

  //
  // P_AddThinker
  // Adds a new thinker at the end of the list.
  //
  addThinker(thinker: Thinker): void {
    if (this.thinkerCap.prev === null) {
      throw 'this.thinkerCap.prev = null'
    }
    this.thinkerCap.prev.next = thinker
    thinker.next = this.thinkerCap
    thinker.prev = this.thinkerCap.prev
    this.thinkerCap.prev = thinker
  }

  //
  // P_RemoveThinker
  // Deallocation is lazy -- it will not actually be freed
  // until its thinking turn comes up.
  //
  removeThinker(thinker: Thinker): void {
    // FIXME: NOP.
    thinker.func = null
  }

  //
  // P_Ticker
  //
  ticker(): void {
    // run the tic
    if (this.game.paused) {
      return
    }

    for (let i = 0; i < MAX_PLAYERS; ++i) {
      if (this.game.playerInGame[i]) {
        this.user.playerThink(this.game.players[i])
      }
    }
  }
}
