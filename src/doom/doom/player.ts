import { AmmoType, Card, MAX_PLAYERS, PowerType, WeaponType } from '../global/doomdef'
import { PSpriteDef, PSpriteNum } from '../play/sprite'
import { MObj } from '../play/mobj/mobj'
import { TickCmd } from './tick-cmd'

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
export const enum Cheat {
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
export class Player {
  static sizeOf = 308

  mo: MObj | null = null
  playerState: PlayerState = 0
  cmd = new TickCmd()

  // Determine POV,
  //  including viewpoint bobbing during movement.
  // Focal origin above r.z
  viewZ = 0
  // Base height above floor for viewz.
  viewHeight = 0
  // Bob/squat speed.
  deltaViewHeight = 0
  // bounded/scaled total momentum.
  bob = 0

  // This is only used between levels,
  // mo->health is used during levels.
  health = 0
  armorPoints = 0
  // Armor type is 0-2.
  armorType = 0

  // Power ups. invinc and invis are tic counters.
  powers = new Array<number>(PowerType.NUMPOWERS).fill(0)
  cards = new Array<boolean>(Card.NUM_CARDS).fill(false)
  backpack = false

  // Frags, kills of other players.
  frags = new Array<number>(MAX_PLAYERS).fill(0)
  readyWeapon: WeaponType = 0

  // Is wp_nochange if not changing.
  pendingWeapon: WeaponType = 0

  weaponOwned = new Array<boolean>(WeaponType.NUM_WEAPONS).fill(false)
  ammo = new Array<number>(AmmoType.NUM_AMMO).fill(0)
  maxAmmo = new Array<number>(AmmoType.NUM_AMMO).fill(0)

  // True if button down last tic.
  attackDown = false;
  useDown = false

  // Bit flags, for cheats and debug.
  // See cheat_t, above.
  cheats = 0;

  // Refired shots are less accurate.
  refire = 0;

  // For intermission stats.
  killCount = 0;
  itemCount = 0;
  secretCount = 0;

  // Hint messages.
  message: string | null = ''

  // For screen flashing (red or bright).
  damageCount = 0;
  bonusCount = 0;

  // Who did damage (NULL for floors/ceilings).
  attacker: MObj | null = null

  // So gun flashes light up areas.
  extraLight = 0

  // Current PLAYPAL, ???
  //  can be set to REDCOLORMAP for pain, etc.
  fixedColorMap = 0

  // Player skin colorshift,
  //  0-3 for which color to draw player.
  colorMap = 0

  // Overlay view sprites (gun, etc).
  pSprites = Array.from({ length: PSpriteNum.NUM_PSPRITES }, () => new PSpriteDef())

  // True if secret level has been done.
  didSecret = false

  constructor(buffer?: ArrayBuffer) {
    if (buffer) {
      this.unArchive(buffer)
    }
  }

  reset(): void {
    this.mo = null
    this.playerState = 0
    this.cmd.reset()
    this.viewZ = 0
    this.viewHeight = 0
    this.deltaViewHeight = 0
    this.bob = 0
    this.health = 0
    this.armorPoints = 0
    this.armorType = 0
    this.powers.fill(0)
    this.cards.fill(false)
    this.backpack = false
    this.frags.fill(0)
    this.readyWeapon = 0
    this.pendingWeapon = 0
    this.weaponOwned.fill(false)
    this.ammo.fill(0)
    this.maxAmmo.fill(0)
    this.attackDown = false
    this.useDown = false
    this.cheats = 0
    this.refire = 0
    this.killCount = 0
    this.itemCount = 0
    this.secretCount = 0
    this.message = ''
    this.damageCount = 0
    this.bonusCount = 0
    this.attacker = null
    this.extraLight = 0
    this.fixedColorMap = 0
    this.colorMap = 0
    this.pSprites.forEach(p => p.reset())
    this.didSecret = false
  }

  unArchive(buffer: ArrayBuffer): void {
    const int32 = new Int32Array(buffer, 0, Player.sizeOf / Int32Array.BYTES_PER_ELEMENT)
    let int32Ptr = 0
    int32Ptr++; this.mo = null
    this.playerState = int32[int32Ptr++]

    this.cmd.unArchive(buffer.slice(
      int32Ptr * Int32Array.BYTES_PER_ELEMENT,
      int32Ptr * Int32Array.BYTES_PER_ELEMENT + TickCmd.sizeOf,
    ))
    int32Ptr += TickCmd.sizeOf / Int32Array.BYTES_PER_ELEMENT

    this.viewZ = int32[int32Ptr++]
    this.viewHeight = int32[int32Ptr++]
    this.deltaViewHeight = int32[int32Ptr++]
    this.bob = int32[int32Ptr++]
    this.health = int32[int32Ptr++]
    this.armorPoints = int32[int32Ptr++]
    this.armorType = int32[int32Ptr++]
    for (let i = 0; i < PowerType.NUMPOWERS; ++i) {
      this.powers[i] = int32[int32Ptr++]
    }
    for (let i = 0; i < Card.NUM_CARDS; ++i) {
      this.cards[i] = !!int32[int32Ptr++]
    }
    this.backpack = !!int32[int32Ptr++]
    for (let i = 0; i < MAX_PLAYERS; ++i) {
      this.frags[i] = int32[int32Ptr++]
    }
    this.readyWeapon = int32[int32Ptr++]
    this.pendingWeapon = int32[int32Ptr++]

    for (let i = 0; i < WeaponType.NUM_WEAPONS; ++i) {
      this.weaponOwned[i] = !!int32[int32Ptr++]
    }
    for (let i = 0; i < AmmoType.NUM_AMMO; ++i) {
      this.ammo[i] = int32[int32Ptr++]
    }
    for (let i = 0; i < AmmoType.NUM_AMMO; ++i) {
      this.maxAmmo[i] = int32[int32Ptr++]
    }
    this.attackDown = !!int32[int32Ptr++]
    this.useDown = !!int32[int32Ptr++]
    this.cheats = int32[int32Ptr++]
    this.refire = int32[int32Ptr++]
    this.killCount = int32[int32Ptr++]
    this.itemCount = int32[int32Ptr++]
    this.secretCount = int32[int32Ptr++]
    int32Ptr++; this.message = null
    this.damageCount = int32[int32Ptr++]
    this.bonusCount = int32[int32Ptr++]
    int32Ptr++; this.attacker = null
    this.extraLight = int32[int32Ptr++]
    this.fixedColorMap = int32[int32Ptr++]
    this.colorMap = int32[int32Ptr++]
    for (let i = 0; i < AmmoType.NUM_AMMO; ++i) {
      this.maxAmmo[i] = int32[int32Ptr++]
    }

    // let pSprite: Int32Array
    for (let i = 0; i < PSpriteNum.NUM_PSPRITES; ++i) {
      this.pSprites[i].unArchive(buffer.slice(
        int32Ptr * Int32Array.BYTES_PER_ELEMENT,
        int32Ptr * Int32Array.BYTES_PER_ELEMENT + PSpriteDef.sizeOf,
      ))
      int32Ptr += PSpriteDef.sizeOf / Int32Array.BYTES_PER_ELEMENT
    }
    this.didSecret = !!int32[int32Ptr++]
  }

  archive(): ArrayBuffer {
    let n: number

    const buffer = new ArrayBuffer(Player.sizeOf)
    const int32 = new Int32Array(buffer)

    let int32Ptr = 0

    int32[int32Ptr++] = 0
    int32[int32Ptr++] = this.playerState

    const cmd = new Int32Array(this.cmd.archive())
    for (n of cmd) {
      int32[int32Ptr++] = n
    }

    int32[int32Ptr++] = this.viewZ
    int32[int32Ptr++] = this.viewHeight
    int32[int32Ptr++] = this.deltaViewHeight
    int32[int32Ptr++] = this.bob
    int32[int32Ptr++] = this.health
    int32[int32Ptr++] = this.armorPoints
    int32[int32Ptr++] = this.armorType
    for (let i = 0; i < PowerType.NUMPOWERS; ++i) {
      int32[int32Ptr++] = this.powers[i]
    }
    for (let i = 0; i < Card.NUM_CARDS; ++i) {
      int32[int32Ptr++] = this.cards[i] ? 1 : 0
    }
    int32[int32Ptr++] = this.backpack ? 1 : 0
    for (let i = 0; i < MAX_PLAYERS; ++i) {
      int32[int32Ptr++] = this.frags[i] ? 1 : 0
    }
    int32[int32Ptr++] = this.readyWeapon
    int32[int32Ptr++] = this.pendingWeapon

    for (let i = 0; i < WeaponType.NUM_WEAPONS; ++i) {
      int32[int32Ptr++] = this.weaponOwned[i] ? 1 : 0
    }
    for (let i = 0; i < AmmoType.NUM_AMMO; ++i) {
      int32[int32Ptr++] = this.ammo[i]
    }
    for (let i = 0; i < AmmoType.NUM_AMMO; ++i) {
      int32[int32Ptr++] = this.maxAmmo[i]
    }
    int32[int32Ptr++] = this.attackDown ? 1 : 0
    int32[int32Ptr++] = this.useDown ? 1 : 0
    int32[int32Ptr++] = this.cheats
    int32[int32Ptr++] = this.refire
    int32[int32Ptr++] = this.killCount
    int32[int32Ptr++] = this.itemCount
    int32[int32Ptr++] = this.secretCount
    int32[int32Ptr++] = 0
    int32[int32Ptr++] = this.damageCount
    int32[int32Ptr++] = this.bonusCount
    int32[int32Ptr++] = 0
    int32[int32Ptr++] = this.extraLight
    int32[int32Ptr++] = this.fixedColorMap
    int32[int32Ptr++] = this.colorMap
    for (let i = 0; i < AmmoType.NUM_AMMO; ++i) {
      int32[int32Ptr++] = this.maxAmmo[i]
    }

    let pSprite: Int32Array
    for (let i = 0; i < PSpriteNum.NUM_PSPRITES; ++i) {
      pSprite = new Int32Array(this.pSprites[i].archive())
      for (n of pSprite) {
        int32[int32Ptr++] = n
      }
    }
    int32[int32Ptr++] = this.didSecret ? 1 : 0

    return int32.buffer
  }
}

//
// INTERMISSION
// Structure passed e.g. to WI_Start(wb)
//
export class WbPlayer {
  // whether the player is in game
  in = false

  // Player stats, kills, collected items etc.
  sKills = 0
  sItems = 0
  sSecret = 0
  sTime = 0
  frags = [ 0, 0, 0, 0 ]
  // current score on entry, modified on return
  score = 0

}

export class WbStart {
  // episode # (0-2)
  episode = 0

  // if true, splash the secret level
  didSecret = false

  // previous and next levels, origin 0
  last = 0
  next = 0

  maxKills = 0
  maxItems = 0
  maxSecret = 0
  maxFrags = 0

  // the par time
  parTime = 0

  // index of this player in game
  pNum = 0

  players = Array.from({ length: MAX_PLAYERS },
    () => new WbPlayer())
}
