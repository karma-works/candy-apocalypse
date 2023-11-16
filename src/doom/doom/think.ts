export type Action<T, A extends unknown[]> = (this: T, ...args: A) => void

// Doubly linked list of actors.
export class Thinker<T, A extends unknown[]> {
  constructor(public func: Action<T, A> | null,
    public handler: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public prev: Thinker<any, any> | null = null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public next: Thinker<any, any> | null = null) { }
}


export const noopFunc = () => void 0
