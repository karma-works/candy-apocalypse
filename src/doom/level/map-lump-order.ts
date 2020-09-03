// Lump order in a map WAD: each map needs a couple of lumps
// to provide a complete scene geometry description.
export const enum MapLumpOrder {
  // A separator, name, ExMx or MAPxx
  Label,
  // Monsters, items..
  Things,
  // LineDefs, from editing
  LineDefs,
  // SideDefs, from editing
  SideDefs,
  // Vertices, edited and BSP splits generated
  Vertexes,
  // LineSegs, from LineDefs split by BSP
  Segs,
  // SubSectors, list of LineSegs
  SSectors,
  // BSP nodes
  Nodes,
  // Sectors, from editing
  Sectors,
  // LUT, sector-sector visibility
  Reject,
  // LUT, motion clipping, walls/grid element
  BlockMap
}
