import { Skill } from '../global/doomdef'

export interface Params {
  noMonsters?: boolean
  respawm?: boolean
  fast?: boolean
  dev?: boolean

  skill?: Skill
  episode?: number
  map?: number
}
