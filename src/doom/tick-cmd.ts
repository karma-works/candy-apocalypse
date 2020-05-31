// The data sampled per tick (single player)
// and transmitted to other peers (multiplayer).
// Mainly movements/button commands per game tick,
// plus a checksum for internal state consistency.
export interface TickCmd {
  // *2048 for move
  forwardMove: number
  // *2048 for move
  sideMove: number
  // <<16 for angle delta
  angleTurn: number
  // checks for net game
  consistancy: number
  chatChar: number
  buttons: number
}
