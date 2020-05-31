
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Action = (...args: any) => Promise<void>

// Doubly linked list of actors.
export interface Thinker {
  prev: Thinker
  next: Thinker
  think: () => Promise<void>
}
