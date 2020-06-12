import { BBox } from '../misc/bbox'
import { Line } from './line'
import { MObj } from '../play/mobj'
//
// The SECTORS record, at runtime.
// Stores things/mobjs.
//
export interface Sector {
  floorHeight: number;
  ceilingHeight: number;
  floorPic: number;
  ceilingPic: number;
  lightLevel: number;
  special: number;
  tag: number;
  // 0 = untraversed, 1,2 = sndlines -1
  soundTraversed: number;
  // thing that made a sound (or null)
  soundTarget: null;
  // mapblock bounding box for height changes
  blockBox: BBox;
  // origin for any sounds played by the sector
  soundOrg: null;
  // if == validcount, already checked
  validCount: number;
  // list of mobjs in sector
  thingList: MObj | null;
  // thinker_t for reversable actions
  specialData: null;
  lineCount: number;
  // [linecount] size
  lines: Line[];
}
