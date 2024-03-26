import { BlockMap } from '../level/block-map'
import { Demo } from '../game/demo'
import { Flat } from '../textures/flat'
import { Level } from '../level/level'
import { LineArray } from '../level/line-array'
import { MapTextureArray } from '../textures/map-texture-array'
import { Mus } from '../doom/sounds/mus'
import { NodeArray } from '../level/node-array'
import { PNameArray } from '../textures/pname-array'
import { Palettes } from '../interfaces/palette'
import { Patch } from '../rendering/defs/patch'
import { Reject } from '../level/reject'
import { SectorArray } from '../level/sector-array'
import { SegArray } from '../level/seg-array'
import { Sfx } from '../doom/sounds/sfx'
import { SideArray } from '../level/side-array'
import { SubSectorArray } from '../level/sub-sector-array'
import { ThingArray } from '../level/thing-array'
import { VertexArray } from '../level/vertex-array'

export type LumpCtor<T> = { new(b: ArrayBuffer, name: string, lump: number): T; }

export interface LumpStatic extends LumpCtor<unknown> {
  isType(buffer: ArrayBuffer, name?: string): boolean
  type: LumpType
}

export type LumpType = 'demo' | 'palettes' | 'colormaps' | 'sfx' | 'mus' | 'patch' | 'flat' | 'unknown' |
  'pnames' | 'textures' |
  'level' | 'things' | 'vertexes' | 'sub-sectors' | 'segs' | 'sectors' | 'nodes' | 'lines' | 'sides' | 'block-map' | 'reject'

const lumpCandidates: LumpStatic[] = [
  Level,
  ThingArray,
  VertexArray,
  SubSectorArray,
  SegArray,
  SectorArray,
  NodeArray,
  LineArray,
  SideArray,
  BlockMap,
  Reject,
  Patch,
  Flat,
  PNameArray,
  MapTextureArray,
  Sfx,
  Mus,
  Palettes,
  Demo,
]

export function guessLumpType(buffer: ArrayBuffer, name: string): LumpType {
  const klass = lumpCandidates.find(c => c.isType(buffer, name))
  return klass ? klass.type : 'unknown'
}
