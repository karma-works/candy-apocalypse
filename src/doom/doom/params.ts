import { GameVersion, Skill } from './mode'

export interface Params {
  input?: HTMLElement,
  screen2d?: HTMLCanvasElement,
  screen3d?: HTMLCanvasElement,

  wad: string,
  gameVersion?: GameVersion
  pack?: string
  config?: string

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

  playDemo?: string
  record?: string
}
