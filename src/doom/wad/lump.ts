import { Demo } from '../game/demo'
import { Level } from '../level/level'
import { NodeArray } from '../level/node-array'
import { Palettes } from '../interfaces/palette'
import { Patch } from '../rendering/defs/patch'
import { SectorArray } from '../level/sector-array'
import { SegArray } from '../level/seg-array'
import { Sfx } from '../doom/sounds/sfx'
import { SubSectorArray } from '../level/sub-sector-array'
import { ThingArray } from '../level/thing-array'
import { VertexArray } from '../level/vertex-array'

export interface LumpStatic {
  new(buffer: ArrayBuffer, name: string): unknown
  isType(buffer: ArrayBuffer, name?: string): boolean
  type: LumpType
}

export type LumpType = 'demo' | 'palettes' | 'sfx' | 'patch' | 'unknown' |
  'level' | 'things' | 'vertexes' | 'sub-sectors' | 'segs' | 'sectors' | 'nodes'

const lumpCandidates: LumpStatic[] = [
  Level,
  ThingArray,
  VertexArray,
  SubSectorArray,
  SegArray,
  SectorArray,
  NodeArray,
  Patch,
  Sfx,
  Palettes,
  Demo,
]

export function guessLumpType(buffer: ArrayBuffer, name: string): LumpType {
  const klass = lumpCandidates.find(c => c.isType(buffer, name))
  return klass ? klass.type : 'unknown'
}
