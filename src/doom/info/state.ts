import { Action } from '../think'
import { SpriteNum } from './sprite-num'
import { StateNum } from './state-num'

export class State<T, A extends unknown[]> {
  constructor(
    public sprite: SpriteNum,
    public frame: number,
    public tics: number,
    public handlerType: { new(...args: never[]): T; } | null,
    public action: Action<T, A> | null,
    public nextState: StateNum,
    public misc1: number,
    public misc2: number) { }
}
