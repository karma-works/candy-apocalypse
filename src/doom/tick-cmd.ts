// The data sampled per tick (single player)
// and transmitted to other peers (multiplayer).
// Mainly movements/button commands per game tick,
// plus a checksum for internal state consistency.
export class TickCmd {
  // *2048 for move
  forwardMove = 0
  // *2048 for move
  sideMove = 0
  // <<16 for angle delta
  angleTurn = 0
  // checks for net game
  consistancy = 0
  chatChar = 0
  buttons = 0

  reset(): void {
    this.forwardMove = 0
    this.sideMove = 0
    this.angleTurn = 0
    this.consistancy = 0
    this.chatChar = 0
    this.buttons = 0
  }

  copyFrom(from: TickCmd): void {
    this.forwardMove = from.forwardMove
    this.sideMove = from.sideMove
    this.angleTurn = from.angleTurn
    this.consistancy = from.consistancy
    this.chatChar = from.chatChar
    this.buttons = from.buttons
  }
}
