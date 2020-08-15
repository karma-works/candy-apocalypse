import { Demo } from '../game/demo'
import { Level } from '../level/level'
import { Palettes } from '../interfaces/palette'
import { Patch } from '../rendering/defs/patch'
import { Sfx } from '../doom/sounds/sfx'
import { ThingArray } from '../level/thing-array'

export interface LumpStatic {
  new(buffer: ArrayBuffer, name: string): unknown
  isType(buffer: ArrayBuffer, name?: string): boolean
  type: LumpType
}

export type LumpType = 'demo' | 'palettes' | 'sfx' | 'patch' | 'unknown' |
  'level' | 'things'

const lumpCandidates: LumpStatic[] = [
  Level,
  ThingArray,
  Patch,
  Sfx,
  Palettes,
  Demo,
]

export function guessLumpType(buffer: ArrayBuffer, name: string): LumpType {
  const klass = lumpCandidates.find(c => c.isType(buffer, name))
  return klass ? klass.type : 'unknown'
}
