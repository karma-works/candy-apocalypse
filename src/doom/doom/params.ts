import { GameVersion, Skill } from './mode'

export interface Params {
  screen: HTMLCanvasElement,

  wad: string,
  gameVersion?: GameVersion
  pack?: string

  deathMatch?: boolean
  altDeath?: boolean

  net?: boolean;
  extraTic?: boolean;
  dup?: number;

  noMonsters?: boolean
  respawn?: boolean
  fast?: boolean
  dev?: boolean

  skill?: Skill
  episode?: number
  map?: number
}
