import { FRACBITS, FRACUNIT } from '../misc/fixed'

// mapblocks are used to check movement
// against lines and things
export const MAP_BLOCK_SHIFT = FRACBITS+7

// MAXRADIUS is for precalculated sector block boxes
// the spider demon is larger,
// but we do not have any moving sectors nearby
export const MAX_RADIUS = 32 * FRACUNIT
