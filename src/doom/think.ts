export type Action<H, T> = (this: H, thinker: T) => Promise<void>

// Doubly linked list of actors.
export class Thinker<H, T> {
  constructor(public func: Action<H, T> | null = null,
              public handler: H | null = null,
              public prev: Thinker<unknown, unknown> | null = null,
              public next: Thinker<unknown, unknown> | null = null) { }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const noopFunc = async() => void 0
