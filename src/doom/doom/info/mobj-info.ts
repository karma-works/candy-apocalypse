import { Sfx } from '../sounds/sfx'
import { StateNum } from './state-num'

export class MObjInfo {
  constructor(
    public doomedNum: number,
    public spawnState: StateNum,
    public spawnHealth: number,
    public seeState: StateNum,
    public seeSound: Sfx,
    public reactionTime: number,
    public attackSound: Sfx,
    public painState: StateNum,
    public painChance: number,
    public painSound: Sfx,
    public meleeState: StateNum,
    public missileState: StateNum,
    public deathState: StateNum,
    public xdeathState: StateNum,
    public deathSound: Sfx,
    public speed: number,
    public radius: number,
    public height: number,
    public mass: number,
    public damage: number,
    public activeSound: Sfx,
    public flags: number,
    public raiseState: StateNum) { }
}
