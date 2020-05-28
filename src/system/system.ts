import { TICRATE } from '../global/doomdef'

//
// I_GetTime
// returns time in 1/70th second tics
//
let basetime = 0
export function getTime(): number {
  const now = new Date()
  const sec = Math.floor(now.getTime() / 1e6)
  const usec = now.getTime() - sec * 1e6
  if (!basetime) {
    basetime = sec
  }
  return Math.floor(
    (sec - basetime) * TICRATE + usec * TICRATE / 1e6,
  )
}
