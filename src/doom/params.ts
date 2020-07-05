import { Skill } from '../global/doomdef'

export interface Params {
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
