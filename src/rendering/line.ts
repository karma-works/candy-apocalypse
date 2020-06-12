import { BBox } from '../misc/bbox'
import { Sector } from './sector'
import { SlopeType } from './slope-type'
import { Vertex } from './vertex'
export interface Line {
  // Vertices, from v1 to v2.
  v1: Vertex;
  v2: Vertex;
  // Precalculated v2 - v1 for side checking.
  dX: number;
  dY: number;
  // Animation related.
  flags: number;
  special: number;
  tag: number;
  // Visual appearance: SideDefs.
  //  sidenum[1] will be -1 if one sided
  sideNum: number[];
  // Neat. Another bounding box, for the extent
  //  of the LineDef.
  bbox: BBox;
  // To aid move clipping.
  slopeType: SlopeType;
  // Front and back sector.
  // Note: redundant? Can be retrieved from SideDefs.
  frontSector: Sector | null;
  backSector: Sector | null;
  // if == validcount, already checked
  validCount: number;
  // thinker_t for reversable actions
  specialData: null;
}
