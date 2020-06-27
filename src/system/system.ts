import { TICRATE } from '../global/doomdef'

//
// I_GetTime
// returns time in 1/70th second tics
//
let basetime = 0
export function getTime(): number {
  const now = new Date().getTime()

  const sec = now / 1e3 >> 0
  const usec = (now - sec * 1e3) * 1e3
  if (!basetime) {
    basetime = sec
  }
  const newTics = (sec - basetime) * TICRATE + (usec * TICRATE / 1000000 >> 0)
  return newTics
}
