import { MObj } from '../play/mobj'

export type Action = (mObj: MObj) => Promise<void>

// Doubly linked list of actors.
export interface Thinker {
  prev: Thinker | null
  next: Thinker | null
  function: Action
}
