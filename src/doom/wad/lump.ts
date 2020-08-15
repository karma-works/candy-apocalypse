import { Demo } from '../game/demo'
import { Palettes } from '../interfaces/palette'

export interface LumpStatic {
  new(buffer: ArrayBuffer): unknown
  isType(buffer: ArrayBuffer, name?: string): boolean
  type: LumpType
}

export type LumpType = 'demo' | 'palettes' | 'unknown'

const lumpCandidates: LumpStatic[] = [
  Palettes,
  Demo,
]

export function guessLumpType(buffer: ArrayBuffer, name: string): LumpType {
  const klass = lumpCandidates.find(c => c.isType(buffer, name))
  return klass ? klass.type : 'unknown'
}
