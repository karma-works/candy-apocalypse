import { FRACBITS, FRACUNIT } from '../misc/fixed'

export const FLOAT_SPEED = FRACUNIT * 4

export const MAX_HEALTH = 100
export const VIEW_HEIGHT = 41*FRACUNIT

// mapblocks are used to check movement
// against lines and things
export const MAP_BLOCK_UNITS = 128
export const MAP_BLOCK_SIZE = MAP_BLOCK_UNITS * FRACUNIT
export const MAP_BLOCK_SHIFT = FRACBITS + 7
export const MAP_B_TO_FRAC = MAP_BLOCK_SHIFT - FRACBITS

// player radius for movement checking
export const PLAYER_RADIUS = 16 * FRACUNIT


// MAXRADIUS is for precalculated sector block boxes
// the spider demon is larger,
// but we do not have any moving sectors nearby
export const MAX_RADIUS = 32 * FRACUNIT

export const GRAVITY = FRACUNIT
export const MAX_MOVE = 30 * FRACUNIT

export const USE_RANGE = 64 * FRACUNIT
export const MELEE_RANGE = 64 * FRACUNIT
export const MISSILE_RANGE = 32 * 64 * FRACUNIT

// follow a player exlusively for 3 seconds
export const BASE_THRESHOLD = 100

//
// P_MOBJ
//
export const ON_FLOOR_Z = -2147483648
export const ON_CEILING_Z = 2147483647

// Time interval for item respawning.
export const ITEM_QUE_SIZE = 128

export const MAX_INTERCEPTS = 128


export const PT_ADD_LINES = 1
export const PT_ADD_THINGS = 2
export const PT_EARLY_OUT = 4
