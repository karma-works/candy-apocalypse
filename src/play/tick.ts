import { Thinker, noopFunc } from '../doom/think'
import { Game } from '../game/game'
import { MAX_PLAYERS } from '../global/doomdef'
import { Play } from './setup'
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
  addThinker<H, T>(thinker: Thinker<H, T>): void {
    if (this.thinkerCap.prev === null) {
      throw 'this.thinkerCap.prev = null'
    }
    this.thinkerCap.prev.next = thinker as Thinker<unknown, unknown>
    thinker.next = this.thinkerCap
    thinker.prev = this.thinkerCap.prev
    this.thinkerCap.prev = thinker as Thinker<unknown, unknown>
  }

  //
  // P_RemoveThinker
  // Deallocation is lazy -- it will not actually be freed
  // until its thinking turn comes up.
  //
  removeThinker<H, T>(thinker: Thinker<H, T>): void {
    thinker.func = noopFunc
  }

  //
  // P_RunThinkers
  //
  private async runThinkers(): Promise<void> {
    let currentThinker = this.thinkerCap.next

    while (currentThinker !== null &&
      currentThinker !== this.thinkerCap
    ) {
      if (currentThinker.func === noopFunc) {
        if (currentThinker.next === null) {
          throw 'currentThinker.next = null'
        }
        if (currentThinker.prev === null) {
          throw 'currentThinker.next = null'
        }
        // time to remove it
        currentThinker.next.prev = currentThinker.prev
        currentThinker.prev.next = currentThinker.next
      } else {
        if (currentThinker.func !== null) {
          await currentThinker.func.call(currentThinker.handler, currentThinker)
        }
      }
      currentThinker = currentThinker.next
    }
  }

  //
  // P_Ticker
  //
  async ticker(): Promise<void> {
    // run the tic
    if (this.game.paused) {
      return
    }

    for (let i = 0; i < MAX_PLAYERS; ++i) {
      if (this.game.playerInGame[i]) {
        await this.user.playerThink(this.game.players[i])
      }
    }

    await this.runThinkers()

    // for par times
    this.levelTime++
  }
}
