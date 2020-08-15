import { Demo } from '../game/demo'
import { Palettes } from '../interfaces/palette'
import { Sfx } from '../doom/sounds/sfx'

export interface LumpStatic {
  new(buffer: ArrayBuffer): unknown
  isType(buffer: ArrayBuffer, name?: string): boolean
  type: LumpType
}

export type LumpType = 'demo' | 'palettes' | 'sfx' | 'unknown'

const lumpCandidates: LumpStatic[] = [
  Sfx,
  Palettes,
  Demo,
]

export function guessLumpType(buffer: ArrayBuffer, name: string): LumpType {
  const klass = lumpCandidates.find(c => c.isType(buffer, name))
  return klass ? klass.type : 'unknown'
}
