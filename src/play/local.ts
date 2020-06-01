import { FRACBITS, FRACUNIT } from '../misc/fixed'

export const VIEW_HEIGHT = 41*FRACUNIT

// mapblocks are used to check movement
// against lines and things
export const MAP_BLOCK_SHIFT = FRACBITS+7

// MAXRADIUS is for precalculated sector block boxes
// the spider demon is larger,
// but we do not have any moving sectors nearby
export const MAX_RADIUS = 32 * FRACUNIT


//
// P_MOBJ
//
export const ON_FLOOR_Z = Number.MIN_SAFE_INTEGER
export const ON_CEILING_Z = Number.MAX_SAFE_INTEGER
