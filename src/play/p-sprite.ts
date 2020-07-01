import { FINE_ANGLES, FINE_MASK, fineSine } from '../misc/table'
import { FRACBITS, FRACUNIT, mul } from '../misc/fixed'
import { PSpriteDef, PSpriteNum } from './sprite'
import { ButtonCode } from '../doom/event'
import { MObjHandler } from './mobj-handler'
import { Play } from './setup'
import { Player } from '../doom/player'
import { State } from '../doom/info/state'
import { StateNum } from '../doom/info/state-num'
import { Tick } from './tick'
import { WeaponType } from '../global/doomdef'
import { states } from '../doom/info/states'
import { weaponInfo } from '../doom/items'

const LOWER_SPEED = FRACUNIT * 6
const RAISE_SPEED = FRACUNIT * 6

const WEAPON_BOTTOM = 128 * FRACUNIT
const WEAPON_TOP = 32 * FRACUNIT

// plasma cells for a bfg attack
const BGF_CELLS = 40

export class PSprite {

  private get mObjHandler(): MObjHandler {
    return this.play.mObjHandler
  }
  private get tick(): Tick {
    return this.play.tick
  }

  constructor(private play: Play) { }

  //
  // P_SetPsprite
  //
  private setPSprite(player: Player, position: PSpriteNum, st: StateNum): void {
    const psp = player.pSprites[position]

    let state: State<unknown, [Player, PSpriteDef]>

    do {
      if (!st) {
        // object removed itself
        psp.state = null
        break
      }

      state = states[st] as State<unknown, [Player, PSpriteDef]>
      psp.state = state
      // could be 0
      psp.tics = state.tics

      if (state.misc1) {
        // coordinate set
        psp.sX = state.misc1 << FRACBITS
        psp.sY = state.misc2 << FRACBITS
      }

      // Call action routine.
      // Modified handling.
      if (state.action) {
        let handler: unknown
        switch (state.handlerType) {
        case PSprite:
          handler = this
          break
        default:
          debugger
        }
        state.action.call(handler, player, psp)
        if (!psp.state) {
          break
        }
      }

      st = psp.state.nextState

    } while (!psp.tics)
    // an initial state of 0 could cycle through
  }

  //
  // P_BringUpWeapon
  // Starts bringing the pending weapon up
  // from the bottom of the screen.
  // Uses player
  //
  private bringUpWeapon(player: Player): void {
    if (player.pendingWeapon === WeaponType.NoChange) {
      player.pendingWeapon = player.readyWeapon
    }

    const newState = weaponInfo[player.pendingWeapon].upState

    player.pendingWeapon = WeaponType.NoChange
    player.pSprites[PSpriteNum.Weapon].sY = WEAPON_BOTTOM

    this.setPSprite(player, PSpriteNum.Weapon, newState)
  }

  private fireWeapon(player: Player): void {
    debugger
  }

  //
  // P_DropWeapon
  // Player died, so put the weapon away.
  //
  dropWeapon(player: Player): void {
    this.setPSprite(player,
      PSpriteNum.Weapon,
      weaponInfo[player.readyWeapon].downState,
    )
  }

  //
  // A_WeaponReady
  // The player can fire the weapon
  // or change to another weapon at this time.
  // Follows after getting weapon up,
  // or after previous attack/fire sequence.
  //
  weaponReady(player: Player, psp: PSpriteDef): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }

    // get out of attack state
    if (player.mo.state === states[StateNum.PlayAtk1] ||
      player.mo.state === states[StateNum.PlayAtk2]
    ) {
      this.mObjHandler.setMObjState(player.mo, StateNum.Play)
    }

    // check for change
    //  if player is dead, put the weapon away
    if (player.pendingWeapon !== WeaponType.NoChange || !player.health) {
      // change weapon
      //  (pending weapon should allready be validated)
      const newState = weaponInfo[player.readyWeapon].downState
      this.setPSprite(player, PSpriteNum.Weapon, newState)
      return
    }
    // check for fire
    //  the missile launcher and bfg do not auto fire
    if (player.cmd.buttons & ButtonCode.Attack) {
      if (!player.attackDown ||
        player.readyWeapon !== WeaponType.Missile &&
          player.readyWeapon !== WeaponType.BFG
      ) {
        player.attackDown = true
        this.fireWeapon(player)
        return
      }
    } else {
      player.attackDown = false
    }

    // bob the weapon based on movement speed
    let angle = 128 * this.tick.levelTime & FINE_MASK

    console.log(angle)

    psp.sX = FRACUNIT + mul(player.bob, fineSine[FINE_ANGLES / 4 + angle])
    angle &= FINE_ANGLES / 2 - 1
    psp.sY = WEAPON_TOP + mul(player.bob, fineSine[angle])
  }

  reFire(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  checkReload(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  lower(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  //
  // A_Raise
  //
  raise(player: Player, psp: PSpriteDef): void {
    psp.sY -= RAISE_SPEED

    if (psp.sY > WEAPON_TOP) {
      return
    }

    psp.sY = WEAPON_TOP

    // The weapon has been raised all the way,
    //  so change to the ready state.
    const newState = weaponInfo[player.readyWeapon].readyState

    this.setPSprite(player, PSpriteNum.Weapon, newState)
  }

  gunFlash(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  punch(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  saw(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  fireMissile(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  fireBFG(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  firePlasma(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  firePistol(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  fireShotgun(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  fireShotgun2(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  fireCGun(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  light0(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  light1(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  light2(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  bfgSpray(/* mo: MObj */): void {
    debugger
  }

  bFGsound(/* player: Player, psp: PSpriteDef */): void {
    debugger
  }

  //
  // P_SetupPsprites
  // Called at start of level for each player.
  //
  setupPSprites(player: Player): void {
    // remove all psprites
    for (let i = 0; i < PSpriteNum.NUM_PSPRITES; ++i) {
      player.pSprites[i].state = null
    }

    // spawn the gun
    player.pendingWeapon = player.readyWeapon
    this.bringUpWeapon(player)
  }

  //
  // P_MovePsprites
  // Called every tic by player thinking routine.
  //
  movePSprites(player: Player): void {
    let psp: PSpriteDef
    for (let i = 0; i < PSpriteNum.NUM_PSPRITES; ++i) {
      psp = player.pSprites[i]

      // a null state means not active
      if (psp.state !== null) {
        // drop tic count and possibly change state

        // a -1 tic count never changes
        if (psp.tics !== -1) {
          psp.tics--
          if (!psp.tics) {
            this.setPSprite(player, i, psp.state.nextState)
          }
        }
      }
    }

    player.pSprites[PSpriteNum.Flash].sX = player.pSprites[PSpriteNum.Weapon].sX
    player.pSprites[PSpriteNum.Flash].sY = player.pSprites[PSpriteNum.Weapon].sY
  }

}
