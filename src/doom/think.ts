import { MObj } from '../play/mobj'

export type Action = (mObj: MObj) => Promise<void>

// Doubly linked list of actors.
export class Thinker {
  constructor(public func: Action | null = null,
              public prev: Thinker | null = null,
              public next: Thinker | null = null) { }
}
