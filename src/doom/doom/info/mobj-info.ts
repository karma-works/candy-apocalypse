import { SfxName } from '../sounds/sfx-name'
import { StateNum } from './state-num'

export class MObjInfo {
  constructor(
    public doomedNum: number,
    public spawnState: StateNum,
    public spawnHealth: number,
    public seeState: StateNum,
    public seeSound: SfxName,
    public reactionTime: number,
    public attackSound: SfxName,
    public painState: StateNum,
    public painChance: number,
    public painSound: SfxName,
    public meleeState: StateNum,
    public missileState: StateNum,
    public deathState: StateNum,
    public xdeathState: StateNum,
    public deathSound: SfxName,
    public speed: number,
    public radius: number,
    public height: number,
    public mass: number,
    public damage: number,
    public activeSound: SfxName,
    public flags: number,
    public raiseState: StateNum) { }
}
