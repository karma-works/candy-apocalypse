import { Demo } from '../game/demo'

export interface LumpStatic {
  new(buffer: ArrayBuffer): unknown
  isType(buffer: ArrayBuffer, name?: string): boolean
  type: LumpType
}

export type LumpType = 'demo' | 'unknown'

const lumpCandidates: LumpStatic[] = [
  Demo,
]

export function guessLumpType(buffer: ArrayBuffer, name: string): LumpType {
  const klass = lumpCandidates.find(c => c.isType(buffer, name))
  return klass ? klass.type : 'unknown'
}
