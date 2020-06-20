import { BBox } from '../misc/bbox'
import { Line } from './line'
import { MObj } from '../play/mobj'
import { MapLineFlag } from '../doom/data'
//
// The SECTORS record, at runtime.
// Stores things/mobjs.
//
export class Sector {
  floorHeight: number;
  ceilingHeight: number;
  floorPic: number;
  ceilingPic: number;
  lightLevel: number;
  special: number;
  tag: number;
  // 0 = untraversed, 1,2 = sndlines -1
  soundTraversed = 1
  // thing that made a sound (or null)
  soundTarget = null
  // mapblock bounding box for height changes
  blockBox = new BBox()
  // origin for any sounds played by the sector
  soundOrg = null
  // if == validcount, already checked
  validCount = 0
  // list of mobjs in sector
  thingList: MObj | null
  // thinker_t for reversable actions
  specialData = null
  lineCount = 0
  // [linecount] size
  lines: Line[] = []

  constructor(
    floorHeight: number,
    ceilingHeight: number,
    floorPic: number,
    ceilingPic: number,
    lightLevel: number,
    special: number,
    tag: number,
    thingList: MObj | null,
  ) {
    this.floorHeight = floorHeight
    this.ceilingHeight = ceilingHeight
    this.floorPic = floorPic
    this.ceilingPic = ceilingPic
    this.lightLevel = lightLevel
    this.special = special
    this.tag = tag
    this.thingList = thingList
  }

  //
  // getNextSector()
  // Return sector_t * of sector next to current.
  // NULL if not two-sided line
  //
  private getNextSector(line: Line): Sector | null {
    if (!(line.flags & MapLineFlag.TwoSided)) {
      return null
    }

    if (line.frontSector === this) {
      return line.backSector
    }
    return line.frontSector
  }

  //
  // Find minimum light from an adjacent sector
  //
  findMinSurroundingLight(max: number = this.lightLevel): number {
    let min = max

    let line: Line
    let check: Sector | null
    for (let i = 0; i < this.lineCount; ++i) {
      line = this.lines[i]
      check = this.getNextSector(line)

      if (!check) {
        continue
      }

      if (check.lightLevel < min) {
        min = check.lightLevel
      }
    }

    return min
  }
}
