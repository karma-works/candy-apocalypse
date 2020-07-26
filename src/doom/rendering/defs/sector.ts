import { FRACBITS, FRACUNIT } from '../../misc/fixed'
import { BBox } from '../../misc/bbox'
import { Line } from './line'
import { MObj } from '../../play/mobj/mobj'
import { MapLineFlag } from '../../doom/data'

// 20 adjoining sectors max!
const MAX_ADJOINING_SECTORS = 20

//
// The SECTORS record, at runtime.
// Stores things/mobjs.
//
export class Sector {
  static sizeOf = 14

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
  soundTarget: MObj | null = null
  // mapblock bounding box for height changes
  blockBox = new BBox()
  // origin for any sounds played by the sector
  soundOrg = null
  // if == validcount, already checked
  validCount = 0
  // list of mobjs in sector
  thingList: MObj | null
  // thinker_t for reversable actions
  specialData: unknown = null
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
  getNextSector(line: Line): Sector | null {
    if (!(line.flags & MapLineFlag.TwoSided)) {
      return null
    }

    if (line.frontSector === this) {
      return line.backSector
    }
    return line.frontSector
  }

  //
  // P_FindLowestFloorSurrounding()
  // FIND LOWEST FLOOR HEIGHT IN SURROUNDING SECTORS
  //
  findLowestFloorSurrounding(): number {
    let check: Line
    let other: Sector | null
    let floor = this.floorHeight
    for (let i = 0; i < this.lineCount; ++i) {
      check = this.lines[i]
      other = this.getNextSector(check)

      if (!other) {
        continue
      }

      if (other.floorHeight < floor) {
        floor = other.floorHeight
      }
    }

    return floor
  }

  //
  // P_FindHighestFloorSurrounding()
  // FIND HIGHEST FLOOR HEIGHT IN SURROUNDING SECTORS
  //
  findHighestFloorSurrounding(): number {
    let check: Line
    let other: Sector | null
    let floor = -500 * FRACUNIT
    for (let i = 0; i < this.lineCount; ++i) {
      check = this.lines[i]
      other = this.getNextSector(check)

      if (!other) {
        continue
      }

      if (other.floorHeight > floor) {
        floor = other.floorHeight
      }
    }

    return floor
  }

  //
  // P_FindNextHighestFloor
  // FIND NEXT HIGHEST FLOOR IN SURROUNDING SECTORS
  // Note: this should be doable w/o a fixed array.
  findNextHighestFloor(currentHeight = this.floorHeight): number {
    const height = currentHeight

    const heightList = new Array<number>(MAX_ADJOINING_SECTORS).fill(0)

    let i: number
    let h: number
    let check: Line
    let other: Sector | null
    for (i = 0, h = 0; i < this.lineCount; ++i) {
      check = this.lines[i]
      other = this.getNextSector(check)

      if (!other) {
        continue
      }

      if (other.floorHeight > height) {
        heightList[h++] = other.floorHeight
      }

      // Check for overflow. Exit.
      if (h >= MAX_ADJOINING_SECTORS) {
        console.error('Sector with more than 20 adjoining sectors')
        break
      }
    }

    // Find lowest height in list
    if (!h) {
      return currentHeight
    }

    let min = heightList[0]

    // Range checking?
    for (i = 1; i < h; ++i) {
      if (heightList[i] < min) {
        min = heightList[i]
      }
    }

    return min
  }


  //
  // FIND LOWEST CEILING IN THE SURROUNDING SECTORS
  //
  findLowestCeilingSurrounding(): number {
    let check: Line
    let other: Sector | null
    let height = 2147483647
    for (let i = 0; i < this.lineCount; ++i) {
      check = this.lines[i]
      other = this.getNextSector(check)

      if (!other) {
        continue
      }

      if (other.ceilingHeight < height) {
        height = other.ceilingHeight
      }
    }

    return height
  }

  //
  // FIND HIGHEST CEILING IN THE SURROUNDING SECTORS
  //
  findHighestCeilingSurrounding(): number {
    let check: Line
    let other: Sector | null
    let height = 0

    for (let i = 0; i < this.lineCount; ++i) {
      check = this.lines[i]
      other = this.getNextSector(check)

      if (!other) {
        continue
      }

      if (other.ceilingHeight > height) {
        height = other.ceilingHeight
      }
    }

    return height
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

  unArchive(buffer: ArrayBuffer): void {
    const int16 = new Int16Array(buffer)
    let int16Ptr = 0
    this.floorHeight = int16[int16Ptr++] << FRACBITS
    this.ceilingHeight = int16[int16Ptr++] << FRACBITS
    this.floorPic = int16[int16Ptr++]
    this.ceilingPic = int16[int16Ptr++]
    this.lightLevel = int16[int16Ptr++]
    this.special = int16[int16Ptr++]
    this.tag = int16[int16Ptr++]
    this.specialData = 0
    this.soundTarget = null
  }

  archive(): ArrayBuffer {
    return new Int16Array([
      this.floorHeight >> FRACBITS,
      this.ceilingHeight >> FRACBITS,
      this.floorPic,
      this.ceilingPic,
      this.lightLevel,
      this.special,
      this.tag,
    ]).buffer
  }
}

export function isSector(s: unknown): s is Sector {
  const sec = s as Sector

  return typeof sec.getNextSector === 'function'
}
