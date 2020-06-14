import { MAX_PLAYERS } from '../global/doomdef'
import { TickCmd } from './tick-cmd'

// Networking and tick handling related.
export const BACKUP_TICS = 12

export class Net {
  netCmds = Array.from({ length: MAX_PLAYERS }, () =>
    Array.from({ length: BACKUP_TICS }, () => new TickCmd()))

  makeTic = 0
  ticDup = 1
}
