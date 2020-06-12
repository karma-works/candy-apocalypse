import { MAX_PLAYERS, Skill } from '../global/doomdef'
import { MObjInfo, MObjType, SpriteNum, State, mObjInfo, states } from '../doom/info'
import { ON_CEILING_Z, ON_FLOOR_Z } from './local'
import { MapThing } from '../doom/data'
import { Play } from './setup'
import { Player } from '../doom/player'
import { SubSector } from '../rendering/sub-sector'
import { Thinker } from '../doom/think'
import { random } from '../misc/random'

//
// NOTES: mobj_t
//
// mobj_ts are used to tell the refresh where to draw an image,
// tell the world simulation when objects are contacted,
// and tell the sound driver how to position a sound.
//
// The refresh uses the next and prev links to follow
// lists of things in sectors as they are being drawn.
// The sprite, frame, and angle elements determine which patch_t
// is used to draw the sprite if it is visible.
// The sprite and frame values are allmost allways set
// from state_t structures.
// The statescr.exe utility generates the states.h and states.c
// files that contain the sprite/frame numbers from the
// statescr.txt source file.
// The xyz origin point represents a point at the bottom middle
// of the sprite (between the feet of a biped).
// This is the default origin position for patch_ts grabbed
// with lumpy.exe.
// A walking creature will have its z equal to the floor
// it is standing on.
//
// The sound code uses the x,y, and subsector fields
// to do stereo positioning of any sound effited by the mobj_t.
//
// The play simulation uses the blocklinks, x,y,z, radius, height
// to determine when mobj_ts are touching each other,
// touching lines in the map, or hit by trace lines (gunshots,
// lines of sight, etc).
// The mobj_t->flags element has various bit flags
// used by the simulation.
//
// Every mobj_t is linked into a single sector
// based on its origin coordinates.
// The subsector_t is found with R_PointInSubsector(x,y),
// and the sector_t can be found with subsector->sector.
// The sector links are only used by the rendering code,
// the play simulation does not care about them at all.
//
// Any mobj_t that needs to be acted upon by something else
// in the play world (block movement, be shot, etc) will also
// need to be linked into the blockmap.
// If the thing has the MF_NOBLOCK flag set, it will not use
// the block links. It can still interact with other things,
// but only as the instigator (missiles will run into other
// things, but nothing can run into a missile).
// Each block in the grid is 128*128 units, and knows about
// every line_t that it contains a piece of, and every
// interactable mobj_t that has its origin contained.
//
// A valid mobj_t is a mobj_t that has the proper subsector_t
// filled in for its xy coordinates and is linked into the
// sector from which the subsector was made, or has the
// MF_NOSECTOR flag set (the subsector_t needs to be valid
// even if MF_NOSECTOR is set), and is linked into a blockmap
// block or has the MF_NOBLOCKMAP flag set.
// Links should only be modified by the P_[Un]SetThingPosition()
// functions.
// Do not change the MF_NO? flags while a thing is valid.
//
// Any questions?
//

//
// Misc. mobj flags
//
export const enum MObjFlag {
  // Call P_SpecialThing when touched.
  Special = 1,
  // Blocks.
  Solid = 2,
  // Can be hit.
  Shootable = 4,
  // Don't use the sector links (invisible but touchable).
  NoSector = 8,
  // Don't use the blocklinks (inert but displayable)
  NoBlockMap = 16,

  // Not to be activated by sound, deaf monster.
  Ambush = 32,
  // Will try to attack right back.
  JustHit = 64,
  // Will take at least one step before attacking.
  JustAttacked = 128,
  // On level spawning (initial position),
  //  hang from ceiling instead of stand on floor.
  SpawnCeiling = 256,
  // Don't apply gravity (every tic),
  //  that is, object will float, keeping current height
  //  or changing it actively.
  NoGravity = 512,

  // Movement flags.
  // This allows jumps from high places.
  DropOff = 0x400,
  // For players, will pick up items.
  PickUp = 0x800,
  // Player cheat. ???
  NoClip = 0x1000,
  // Player: keep info about sliding along walls.
  Slide = 0x2000,
  // Allow moves to any height, no gravity.
  // For active floaters, e.g. cacodemons, pain elementals.
  Float = 0x4000,
  // Don't cross lines
  //   ??? or look at heights on teleport.
  Teleport = 0x8000,
  // Don't hit same species, explode on block.
  // Player missiles as well as fireballs of various kinds.
  Missile = 0x10000,
  // Dropped by a demon, not level spawned.
  // E.g. ammo clips dropped by dying former humans.
  Dropped = 0x20000,
  // Use fuzzy draw (shadow demons or spectres),
  //  temporary player invisibility powerup.
  Shadow = 0x40000,
  // Flag: don't bleed when shot (use puff),
  //  barrels and shootable furniture shall not bleed.
  NoBlood = 0x80000,
  // Don't stop moving halfway off a step,
  //  that is, have dead bodies slide down all the way.
  Corpse = 0x100000,
  // Floating to a height for a move, ???
  //  don't auto float to target's height.
  InFloat = 0x200000,

  // On kill, count this enemy object
  //  towards intermission kill total.
  // Happy gathering.
  CountKill = 0x400000,

  // On picking up, count this item object
  //  towards intermission item total.
  CountItem = 0x800000,

  // Special handling: skull in flight.
  // Neither a cacodemon nor a missile.
  SkullFly = 0x1000000,

  // Don't spawn this object
  //  in death match mode (e.g. key cards).
  NotDMatch = 0x2000000,

  // Player sprites in multiplayer modes are modified
  //  using an internal color lookup table for re-indexing.
  // If 0x4 0x8 or 0xc,
  //  use a translation table for player colormaps
  Translation = 0xc000000,
  // Hmm ???.
  TransShift = 26

}


// Map Object definition.
export class MObj {
  // List: thinker links.
  thinker: Thinker | null

  // More list: links in sector (if needed)
  sNext: MObj | null = null
  sPrev: MObj | null = null
  //More drawing info: to determine current sprite.
  // orientation
  angle = 0
  // used to find patch_t and flip value
  sprite: SpriteNum
  // might be ORed with FF_FULLBRIGHT
  frame: number

  // Interaction info, by BLOCKMAP.
  // Links in blocks (if needed).
  bNext: MObj | null = null
  bPrev: MObj | null = null

  subSector: SubSector | null = null

  // The closest interval over all contacted Sectors.
  floorZ: number
  ceilingZ: number

  // For movement checking.
  radius: number
  height: number

  // Momentums, used to update position.
  momX = 0
  momY = 0
  momZ = 0

  // If == validcount, already checked.
  validCount = 0

  info: MObjInfo

  // state tic counter
  tics: number
  state: State
  flags: number
  health: number

  // Movement direction, movement generation (zig-zagging).
  // 0-7
  moveDir = 0
  // when 0, select a new dir
  moveCount = 0

  // Thing being chased/attacked (or NULL),
  // also the originator for missiles.
  target: MObj | null = null

  // Reaction time: if non 0, don't attack yet.
  // Used by player to freeze a bit after teleporting.
  reactionTime: number

  // If >0, the target will be chased
  // no matter what (even if shot)
  threshold = 0

  // Additional info record for player avatars only.
  // Only valid if type == MT_PLAYER
  player: Player | null = null

  // Player number last looked for.
  lastLook: number

  // For nightmare respawn.
  spawnPoint: MapThing | null = null

  // Thing being chased/attacked for tracers.
  tracer: MObj | null = null

  constructor(
    play: Play,

    // Info for drawing: position.
    public x: number,
    public y: number,
    public z: number,

    public type: MObjType,
  ) {
    const info = mObjInfo[type]
    this.info = info
    this.radius = info.radius
    this.height = info.height
    this.flags = info.flags
    this.health = info.spawnHealth

    if (play.doom.game.gameSkill !== Skill.Nightmare) {
      this.reactionTime = info.reactionTime
    } else {
      this.reactionTime = 0
    }

    this.lastLook = random.pRandom() % MAX_PLAYERS

    // do not set the state with P_SetMobjState,
    // because action routines can not be called yet
    const st = states[info.spawnState]
    this.state = st
    this.tics = st.tics
    this.sprite = st.sprite
    this.frame = st.frame

    // set subsector and/or block links
    play.mapUtils.setThingPosition(this)

    if (this.subSector === null || this.subSector.sector === null) {
      throw 'mobj.subSector = null'
    }

    this.floorZ = this.subSector.sector.floorHeight
    this.ceilingZ = this.subSector.sector.ceilingHeight

    if (z === ON_FLOOR_Z) {
      this.z = this.floorZ
    } else if (z === ON_CEILING_Z) {
      this.z = this.ceilingZ - this.info.height
    }

    this.thinker = new Thinker(mObjThinker)

    // P_AddThinker
  }
}

//
// P_MobjThinker
//
export async function mObjThinker(mObj: MObj): Promise<void> {
  debugger
}
