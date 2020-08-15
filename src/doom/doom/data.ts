//
// Map level types.
// The following data structures define the persistent format
// used in the lumps of the WAD files.
//

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


//
// LineDef attributes.
//
export const enum MapLineFlag {
  // Solid, is an obstacle.
  Blocking = 1,

  // Blocks monsters only.
  BlockMonsters = 2,

  // Backside will not be present at all
  //  if not two sided.
  TwoSided = 4,

  // If a texture is pegged, the texture will have
  // the end exposed to air held constant at the
  // top or bottom of the texture (stairs or pulled
  // down things) and will move with a height change
  // of one of the neighbor sectors.
  // Unpegged textures allways have the first row of
  // the texture at the top pixel of the line for both
  // top and bottom textures (use next to windows).

  // upper texture unpegged
  DontPegTop = 8,

  // lower texture unpegged
  DontPegBottom = 16,

  // In AutoMap: don't map as two sided: IT'S A SECRET!
  Secret = 32,

  // Sound rendering: don't let sound cross two of these.
  SoundBlock = 64,

  // Don't draw on the automap at all.
  DontDraw = 128,

  // Set if already seen, thus drawn in automap.
  Mapped = 256,

}

// BSP node structure.

// Indicate a leaf.
export const NF_SUBSECTOR = 0x8000
