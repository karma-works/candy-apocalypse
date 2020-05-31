import { MObj } from '../play/mobj'
import { PSpriteDef } from '../play/sprite'
import { TickCmd } from './tick-cmd'
import { WeaponType } from '../global/doomdef'

//
// Player states.
//
export const enum PlayerState {
  // Playing or camping.
  Live,
  // Dead on the ground, view follows killer.
  Dead,
  // Ready to restart/respawn???
  Reborn,
}

//
// Player internal flags, for cheats and debug.
//
const enum Cheat {
  // No clipping, walk through barriers.
  NoClip = 1,
  // No damage, no health loss.
  GodMode = 2,
  // Not really a cheat, just a debug aid.
  NoMomentum = 4,
}

//
// Extended player object info: player_t
//
export interface Player {
  mo: MObj | null
  playerState: PlayerState
  cmd: TickCmd

  // Determine POV,
  //  including viewpoint bobbing during movement.
  // Focal origin above r.z
  viewZ: number
  // Base height above floor for viewz.
  viewHeight: number
  // Bob/squat speed.
  deltaViewHeight: number
  // bounded/scaled total momentum.
  bob: number

  // This is only used between levels,
  // mo->health is used during levels.
  health: number
  armorPoints: number
  // Armor type is 0-2.
  armorType: number

  // Power ups. invinc and invis are tic counters.
  powers: number[]
  cards: boolean[]
  backpack: boolean

  // Frags, kills of other players.
  frags: number[]
  readyWeapon: WeaponType

  // Is wp_nochange if not changing.
  pendingWeapon: WeaponType

  weaponOwned: boolean[]
  ammo: number[]
  maxAmmo: number[]

  // True if button down last tic.
  attackDown: number;
  useDown: number;

  // Bit flags, for cheats and debug.
  // See cheat_t, above.
  cheats: number;

  // Refired shots are less accurate.
  refire: number;

    // For intermission stats.
  killCount: number;
  itemCount: number;
  secretCount: number;

  // Hint messages.
  message: string

  // For screen flashing (red or bright).
  damageCount: number;
  bonusCount: number;

  // Who did damage (NULL for floors/ceilings).
  attacker: MObj | null

  // So gun flashes light up areas.
  extraLight: number

  // Current PLAYPAL, ???
  //  can be set to REDCOLORMAP for pain, etc.
  fixedColorMap: number

  // Player skin colorshift,
  //  0-3 for which color to draw player.
  colorMap: number

  // Overlay view sprites (gun, etc).
  pSprites: PSpriteDef[]

  // True if secret level has been done.
  didSecret: boolean
}
