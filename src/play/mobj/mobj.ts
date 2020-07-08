import { Action, Thinker } from '../../doom/think'
import { MAX_PLAYERS, Skill } from '../../global/doomdef'
import { ON_CEILING_Z, ON_FLOOR_Z } from '../local'
import { DirType } from './direction'
import { MObjHandler } from '../mobj-handler'
import { MObjInfo } from '../../doom/info/mobj-info'
import { MObjType } from '../../doom/info/mobj-type'
import { MapThing } from '../../doom/data'
import { Play } from '../setup'
import { Player } from '../../doom/player'
import { SpriteNum } from '../../doom/info/sprite-num'
import { State } from '../../doom/info/state'
import { SubSector } from '../../rendering/sub-sector'
import { mObjInfos } from '../../doom/info/mobj-infos'
import { random } from '../../misc/random'
import { states } from '../../doom/info/states'

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

// Map Object definition.
export class MObj extends Thinker<MObjHandler, [MObj]> {

  public z = 0

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
  state: State<unknown, [MObj]>
  flags: number
  health: number

  // Movement direction, movement generation (zig-zagging).
  // 0-7
  moveDir: DirType = 0
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
    func: Action<MObjHandler, [MObj]>,

    // Info for drawing: position.
    public x: number,
    public y: number,
    z: number,

    public type: MObjType,
  ) {
    super(func, play.mObjHandler)

    const info = mObjInfos[type]
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
    const st = states[info.spawnState] as State<unknown, [MObj]>
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
    } else {
      this.z = z
    }
  }
}
