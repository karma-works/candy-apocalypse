
//
// Animating textures and planes
// There is another anim_t used in wi_stuff, unrelated.
//
export class Anim {
  constructor(
    public isTexture = false,
    public picNum = 0,
    public basePic = 0,
    public numPics = 0,
    public speed = 0,
  ) { }
}

//
//      source animation definition
//
class AnimDef {
  constructor(
    // if false, it is a flat
    public isTexture: boolean,
    public endName: string,
    public startName: string,
    public speed: number,
  ) { }
}

export const MAX_ANIMS = 32

//
// P_InitPicAnims
//

// Floor/ceiling animation sequences,
//  defined by first and last frame,
//  i.e. the flat (64x64 tile) name to
//  be used.
// The full animation sequence is given
//  using all the flats between the start
//  and end entry, in the order found in
//  the WAD file.
//
export const animDefs: readonly AnimDef[] = [
  new AnimDef(false, 'NUKAGE3', 'NUKAGE1', 8),
  new AnimDef(false, 'FWATER4', 'FWATER1', 8),
  new AnimDef(false, 'SWATER4', 'SWATER1', 8),
  new AnimDef(false, 'LAVA4', 'LAVA1', 8),
  new AnimDef(false, 'BLOOD3', 'BLOOD1', 8),

  // DOOM II flat animations.
  new AnimDef(false, 'RROCK08', 'RROCK05', 8),
  new AnimDef(false, 'SLIME04', 'SLIME01', 8),
  new AnimDef(false, 'SLIME08', 'SLIME05', 8),
  new AnimDef(false, 'SLIME12', 'SLIME09', 8),

  new AnimDef(true, 'BLODGR4', 'BLODGR1', 8),
  new AnimDef(true, 'SLADRIP3', 'SLADRIP1', 8),

  new AnimDef(true, 'BLODRIP4', 'BLODRIP1', 8),
  new AnimDef(true, 'FIREWALL', 'FIREWALA', 8),
  new AnimDef(true, 'GSTFONT3', 'GSTFONT1', 8),
  new AnimDef(true, 'FIRELAVA', 'FIRELAV3', 8),
  new AnimDef(true, 'FIREMAG3', 'FIREMAG1', 8),
  new AnimDef(true, 'FIREBLU2', 'FIREBLU1', 8),
  new AnimDef(true, 'ROCKRED3', 'ROCKRED1', 8),

  new AnimDef(true, 'BFALL4', 'BFALL1', 8),
  new AnimDef(true, 'SFALL4', 'SFALL1', 8),
  new AnimDef(true, 'WFALL4', 'WFALL1', 8),
  new AnimDef(true, 'DBRAIN4', 'DBRAIN1', 8),
]

//
//      Animating line specials
//
export const MAX_LINE_ANIMS = 64
