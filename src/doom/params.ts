import { GameVersion, Skill } from './mode'

export interface Params {
  wad: string,
  gameVersion?: GameVersion
  pack?: string

  deathMatch?: boolean
  altDeath?: boolean

  net?: boolean;
  extraTic?: boolean;
  dup?: number;

  noMonsters?: boolean
  respawm?: boolean
  fast?: boolean
  dev?: boolean

  skill?: Skill
  episode?: number
  map?: number
}
