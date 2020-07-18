import { Action, Thinker } from '../../doom/think'
import { ON_CEILING_Z, ON_FLOOR_Z } from '../local'
import { DirType } from './direction'
import { MAX_PLAYERS } from '../../global/doomdef'
import { MObjHandler } from '../mobj-handler'
import { MObjInfo } from '../../doom/info/mobj-info'
import { MObjType } from '../../doom/info/mobj-type'
import { MapThing } from '../../doom/data'
import { Player } from '../../doom/player'
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
  static sizeOf = 154

  // Info for drawing: position.
  x = 0
  y = 0
  z = 0

  // More list: links in sector (if needed)
  sNext: MObj | null = null
  sPrev: MObj | null = null
  //More drawing info: to determine current sprite.
  // orientation
  angle = 0
  // used to find patch_t and flip value
  sprite = 0
  // might be ORed with FF_FULLBRIGHT
  frame = 0

  // Interaction info, by BLOCKMAP.
  // Links in blocks (if needed).
  bNext: MObj | null = null
  bPrev: MObj | null = null

  subSector: SubSector | null = null

  // The closest interval over all contacted Sectors.
  floorZ = 0
  ceilingZ = 0

  // For movement checking.
  radius = 0
  height = 0

  // Momentums, used to update position.
  momX = 0
  momY = 0
  momZ = 0

  // If == validcount, already checked.
  validCount = 0

  type: MObjType = 0
  info: MObjInfo

  // state tic counter
  tics = 0
  state: State<unknown, [MObj]>
  flags = 0
  health = 0

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
  reactionTime = 0

  // If >0, the target will be chased
  // no matter what (even if shot)
  threshold = 0

  // Additional info record for player avatars only.
  // Only valid if type == MT_PLAYER
  player: Player | null = null

  // Player number last looked for.
  lastLook = 0

  // For nightmare respawn.
  spawnPoint = new MapThing()

  // Thing being chased/attacked for tracers.
  tracer: MObj | null = null

  constructor(buffer: ArrayBuffer, func: Action<MObjHandler, [MObj]>, handle: MObjHandler)
  constructor(type: MObjType, func: Action<MObjHandler, [MObj]>, handle: MObjHandler)

  constructor(
    typeOrBuffer: MObjType | ArrayBuffer,

    func: Action<MObjHandler, [MObj]>,
    handle: MObjHandler,
  ) {
    super(func, handle)

    if (typeof typeOrBuffer === 'number') {
      const info = mObjInfos[typeOrBuffer]
      this.type = typeOrBuffer
      this.info = info
      this.radius = info.radius
      this.height = info.height
      this.flags = info.flags
      this.health = info.spawnHealth

      this.reactionTime = info.reactionTime

      this.lastLook = random.pRandom() % MAX_PLAYERS

      // do not set the state with P_SetMobjState,
      // because action routines can not be called yet
      const st = states[info.spawnState] as State<unknown, [MObj]>
      this.state = st
      this.tics = st.tics
      this.sprite = st.sprite
      this.frame = st.frame
    } else {
      const int32 = new Int32Array(typeOrBuffer, 0, MObj.sizeOf / Int32Array.BYTES_PER_ELEMENT >> 0)
      const uint32 = new Uint32Array(typeOrBuffer, 0, MObj.sizeOf / Int32Array.BYTES_PER_ELEMENT >> 0)

      let int32Ptr = 3
      this.x = int32[int32Ptr++]
      this.y = int32[int32Ptr++]
      this.z = int32[int32Ptr++]
      int32Ptr++; this.sNext = null
      int32Ptr++; this.sPrev = null
      this.angle = uint32[int32Ptr++]
      this.sprite = int32[int32Ptr++]
      this.frame = int32[int32Ptr++]
      int32Ptr++; this.bNext = null
      int32Ptr++; this.bPrev = null
      int32Ptr++; this.subSector = null
      this.floorZ = int32[int32Ptr++]
      this.ceilingZ = int32[int32Ptr++]
      this.radius = int32[int32Ptr++]
      this.height = int32[int32Ptr++]
      this.momX = int32[int32Ptr++]
      this.momY = int32[int32Ptr++]
      this.momZ = int32[int32Ptr++]
      this.validCount = int32[int32Ptr++]
      this.type = int32[int32Ptr++]
      int32Ptr++; this.info = mObjInfos[this.type]
      this.tics = int32[int32Ptr++]
      const state = int32[int32Ptr++]
      this.state = states[state] as State<unknown, [unknown]>
      this.flags = int32[int32Ptr++]
      this.health = int32[int32Ptr++]
      this.moveDir = int32[int32Ptr++]
      this.moveCount = int32[int32Ptr++]
      int32Ptr++; this.target = null
      this.reactionTime = int32[int32Ptr++]
      this.threshold = int32[int32Ptr++]
      const player = int32[int32Ptr++]
      if (player) {
        this.player = this.handler.players[player - 1]
        this.player.mo = this
      } else {
        this.player = null
      }
      this.lastLook = int32[int32Ptr++]

      this.spawnPoint.unArchive(typeOrBuffer.slice(
        int32Ptr * Int32Array.BYTES_PER_ELEMENT,
        int32Ptr * Int32Array.BYTES_PER_ELEMENT + MapThing.sizeOf,
      ))

      this.tracer = null
    }

  }

  setZ(z: number = this.z): void {
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

  archive(): ArrayBuffer {
    const buffer = new ArrayBuffer(MObj.sizeOf)
    const int16 = new Int16Array(buffer)
    const int32 = new Int32Array(buffer, 0, MObj.sizeOf / Int32Array.BYTES_PER_ELEMENT >> 0)
    const uint32 = new Uint32Array(buffer, 0, MObj.sizeOf / Int32Array.BYTES_PER_ELEMENT >> 0)

    let int32Ptr = 0
    int32[int32Ptr++] = 0
    int32[int32Ptr++] = 0
    int32[int32Ptr++] = 0
    int32[int32Ptr++] = this.x
    int32[int32Ptr++] = this.y
    int32[int32Ptr++] = this.z
    int32[int32Ptr++] = 0
    int32[int32Ptr++] = 0
    uint32[int32Ptr++] = this.angle
    int32[int32Ptr++] = this.sprite
    int32[int32Ptr++] = this.frame
    int32[int32Ptr++] = 0
    int32[int32Ptr++] = 0
    int32[int32Ptr++] = 0
    int32[int32Ptr++] = this.floorZ
    int32[int32Ptr++] = this.ceilingZ
    int32[int32Ptr++] = this.radius
    int32[int32Ptr++] = this.height
    int32[int32Ptr++] = this.momX
    int32[int32Ptr++] = this.momY
    int32[int32Ptr++] = this.momZ
    int32[int32Ptr++] = this.validCount
    int32[int32Ptr++] = this.type
    int32[int32Ptr++] = 0
    int32[int32Ptr++] = this.tics
    int32[int32Ptr++] = states.indexOf(this.state as State<unknown, [unknown]>)
    int32[int32Ptr++] = this.flags
    int32[int32Ptr++] = this.health
    int32[int32Ptr++] = this.moveDir
    int32[int32Ptr++] = this.moveCount
    int32[int32Ptr++] = 0
    int32[int32Ptr++] = this.reactionTime
    int32[int32Ptr++] = this.threshold
    if (this.player) {
      int32[int32Ptr++] = this.handler.players.indexOf(this.player) + 1
    } else {
      int32[int32Ptr++] = 0
    }
    int32[int32Ptr++] = this.lastLook

    const spawnPoint = new Int16Array(this.spawnPoint.archive())
    int16.set(spawnPoint, int32Ptr * 2)

    return int16.buffer
  }
}
