export const enum DirType {
  East,
  NorthEast,
  North,
  NorthWest,
  West,
  SouthWest,
  South,
  SouthEast,
  NoDir,
  NUM_DIRS
}
//
// P_NewChaseDir related LUT.
//

export const opposite: readonly DirType[] = [
  DirType.West, DirType.SouthWest, DirType.South, DirType.SouthEast,
  DirType.East, DirType.NorthEast, DirType.North, DirType.NorthWest, DirType.NoDir,
]

export const diags: readonly DirType[] = [
  DirType.NorthWest, DirType.NorthEast, DirType.SouthWest, DirType.SouthEast,
]
