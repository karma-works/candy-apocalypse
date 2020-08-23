import { ANG180, ANG90, FINE_ANGLES, FINE_MASK, fineSine } from '../misc/table'
import { AmmoType, PowerType, WeaponType } from '../global/doomdef'
import { FRACBITS, FRACUNIT, mul } from '../misc/fixed'
import { MELEE_RANGE, MISSILE_RANGE } from './local'
import { PSpriteDef, PSpriteNum } from './sprite'
import { Player, PlayerState } from '../doom/player'
import { ButtonCode } from '../doom/event'
import { Sound as DSound } from '../doom/sound'
import { Doom } from '../doom'
import { Enemy } from './enemy'
import { GameMode } from '../doom/mode'
import { Inter } from './inter'
import { MObj } from './mobj/mobj'
import { MObjFlag } from './mobj/mobj-flag'
import { MObjHandler } from './mobj-handler'
import { MObjType } from '../doom/info/mobj-type'
import { Map } from './map'
import { Play } from './setup'
import { SfxName } from '../doom/sounds/sfx-name'
import { State } from '../doom/info/state'
import { StateNum } from '../doom/info/state-num'
import { Tick } from './tick'
import { pointToAngle } from '../misc/angle'
import { random } from '../misc/random'
import { states } from '../doom/info/states'
import { weaponInfo } from '../doom/items'

const LOWER_SPEED = FRACUNIT * 6
const RAISE_SPEED = FRACUNIT * 6

const WEAPON_BOTTOM = 128 * FRACUNIT
const WEAPON_TOP = 32 * FRACUNIT

// plasma cells for a bfg attack
const BGF_CELLS = 40

export class PSprite {

  private get doom(): Doom {
    return this.play.doom
  }
  private get dSound(): DSound {
    return this.play.dSound
  }
  private get enemy(): Enemy {
    return this.play.enemy
  }
  private get inter(): Inter {
    return this.play.inter
  }
  private get map(): Map {
    return this.play.map
  }
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
        case Enemy:
          handler = this.enemy
          break
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

    if (player.pendingWeapon === WeaponType.Chainsaw) {
      this.dSound.startSound(player.mo, SfxName.Sawup)
    }

    const newState = weaponInfo[player.pendingWeapon].upState

    player.pendingWeapon = WeaponType.NoChange
    player.pSprites[PSpriteNum.Weapon].sY = WEAPON_BOTTOM

    this.setPSprite(player, PSpriteNum.Weapon, newState)
  }

  //
  // P_CheckAmmo
  // Returns true if there is enough ammo to shoot.
  // If not, selects the next weapon to use.
  //
  private checkAmmo(player: Player): boolean {
    const ammo = weaponInfo[player.readyWeapon].ammo

    // Minimal amount for one shot varies.
    let count: number
    if (player.readyWeapon === WeaponType.BFG) {
      count = BGF_CELLS
    } else if (player.readyWeapon === WeaponType.Supershotgun) {
      // Double barrel.
      count = 2
    } else {
      // Regular.
      count = 1
    }

    // Some do not need ammunition anyway.
    // Return if current ammunition sufficient.
    if (ammo === AmmoType.NoAmmo || player.ammo[ammo] >= count) {
      return true
    }

    // Out of ammo, pick a weapon to change to.
    // Preferences are set here.
    if (player.weaponOwned[WeaponType.Plasma] &&
      player.ammo[AmmoType.Cell] &&
      this.doom.gameMode !== GameMode.Shareware
    ) {
      player.pendingWeapon = WeaponType.Plasma
    } else if (player.weaponOwned[WeaponType.Supershotgun] &&
      player.ammo[AmmoType.Shell] > 2 &&
      this.doom.gameMode === GameMode.Commercial
    ) {
      player.pendingWeapon = WeaponType.Supershotgun
    } else if (player.weaponOwned[WeaponType.Chaingun] &&
      player.ammo[AmmoType.Clip]
    ) {
      player.pendingWeapon = WeaponType.Chaingun
    } else if (player.weaponOwned[WeaponType.Shotgun] &&
      player.ammo[AmmoType.Shell]
    ) {
      player.pendingWeapon = WeaponType.Shotgun
    } else if (player.ammo[AmmoType.Clip]) {
      player.pendingWeapon = WeaponType.Pistol
    } else if (player.weaponOwned[WeaponType.Chainsaw]) {
      player.pendingWeapon = WeaponType.Chainsaw
    } else if (player.weaponOwned[WeaponType.Missile] &&
      player.ammo[AmmoType.Misl]) {
      player.pendingWeapon = WeaponType.Missile
    } else if (player.weaponOwned[WeaponType.BFG] &&
      player.ammo[AmmoType.Cell] > 40 &&
      this.doom.gameMode !== GameMode.Shareware
    ) {
      player.pendingWeapon = WeaponType.BFG
    } else {
      // If everything fails.
      player.pendingWeapon = WeaponType.Fist
    }

    // Now set appropriate weapon overlay.
    this.setPSprite(player,
      PSpriteNum.Weapon,
      weaponInfo[player.readyWeapon].downState)

    return false
  }

  //
  // P_FireWeapon.
  //
  private fireWeapon(player: Player): void {
    if (!this.checkAmmo(player)) {
      return
    }

    if (player.mo === null) {
      throw 'player.mo = null'
    }

    this.mObjHandler.setMObjState(player.mo, StateNum.PlayAtk1)
    const newState = weaponInfo[player.readyWeapon].atkState
    this.setPSprite(player, PSpriteNum.Weapon, newState)
    this.enemy.noiseAlert(player.mo, player.mo)
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

    if (player.readyWeapon === WeaponType.Chainsaw &&
      psp.state === states[StateNum.Saw]
    ) {
      this.dSound.startSound(player.mo, SfxName.Sawidl)
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

    psp.sX = FRACUNIT + mul(player.bob, fineSine[FINE_ANGLES / 4 + angle])
    angle &= FINE_ANGLES / 2 - 1
    psp.sY = WEAPON_TOP + mul(player.bob, fineSine[angle])
  }

  //
  // A_ReFire
  // The player can re-fire the weapon
  // without lowering it entirely.
  //
  reFire(player: Player): void {
    // check for fire
    //  (if a weaponchange is pending, let it go through instead)
    if (player.cmd.buttons & ButtonCode.Attack &&
      player.pendingWeapon === WeaponType.NoChange &&
      player.health
    ) {
      player.refire++
      this.fireWeapon(player)
    } else {
      player.refire = 0
      this.checkAmmo(player)
    }
  }

  checkReload(player: Player): void {
    this.checkAmmo(player)
  }

  //
  // A_Lower
  // Lowers current weapon,
  //  and changes weapon at bottom.
  //
  lower(player: Player, psp: PSpriteDef): void {
    psp.sY += LOWER_SPEED

    // Is already down.
    if (psp.sY < WEAPON_BOTTOM) {
      return
    }

    // Player is dead.
    if (player.playerState === PlayerState.Dead) {
      psp.sY = WEAPON_BOTTOM

      // don't bring weapon back up
      return
    }

    // The old weapon has been lowered off the screen,
    // so change the weapon and start raising it
    if (!player.health) {
      // Player is dead, so keep the weapon off screen.
      this.setPSprite(player, PSpriteNum.Weapon, StateNum.Null)
      return
    }

    player.readyWeapon = player.pendingWeapon

    this.bringUpWeapon(player)
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

  //
  // A_GunFlash
  //
  gunFlash(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }
    this.mObjHandler.setMObjState(player.mo, StateNum.PlayAtk2)
    this.setPSprite(player, PSpriteNum.Flash,
      weaponInfo[player.readyWeapon].flashState)
  }

  //
  // WEAPON ATTACKS
  //

  //
  // A_Punch
  //
  punch(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }

    let damage = random.pRandom() % 10 + 1 << 1

    if (player.powers[PowerType.Strength]) {
      damage *= 10
    }

    let angle = player.mo.angle
    angle = angle + (random.pRandom() - random.pRandom() << 18) >>> 0

    const slope = this.map.aimLineAttack(player.mo, angle, MELEE_RANGE)
    this.map.lineAttack(player.mo, angle, MELEE_RANGE, slope, damage)

    // turn to face target
    if (this.map.lineTarget) {
      this.dSound.startSound(player.mo, SfxName.Punch)
      player.mo.angle = pointToAngle(player.mo.x,
        player.mo.y,
        this.map.lineTarget.x,
        this.map.lineTarget.y)
    }
  }

  //
  // A_Saw
  //
  saw(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }

    const damage = 2 * (random.pRandom() % 10 + 1)
    let angle = player.mo.angle
    angle = angle + (random.pRandom() - random.pRandom() << 18) >>> 0

    // use meleerange + 1 se the puff doesn't skip the flash
    const slope = this.map.aimLineAttack(player.mo, angle, MELEE_RANGE + 1)
    this.map.lineAttack(player.mo, angle, MELEE_RANGE + 1, slope, damage)

    if (!this.map.lineTarget) {
      this.dSound.startSound(player.mo, SfxName.Sawful)
      return
    }
    this.dSound.startSound(player.mo, SfxName.Sawhit)

    // turn to face target
    angle = pointToAngle(player.mo.x,
      player.mo.y,
      this.map.lineTarget.x, this.map.lineTarget.y)

    debugger

    if (angle - player.mo.angle >>> 0 > ANG180) {
      if (angle - player.mo.angle >>> 0 < -ANG90 / 20 >>> 0) {
        player.mo.angle = angle + (ANG90 / 21 >>> 0) >>> 0
      } else {
        player.mo.angle = player.mo.angle - ANG90 / 20 >>> 0
      }
    } else {
      if (angle - player.mo.angle >>> 0 > ANG90 / 20 >>> 0) {
        player.mo.angle = angle - (ANG90 / 21 >>> 0) >>> 0
      } else {
        player.mo.angle = player.mo.angle + (ANG90 / 20 >>> 0) >>> 0
      }
    }

    player.mo.flags |= MObjFlag.JustAttacked
  }

  //
  // A_FireMissile
  //
  fireMissile(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }
    player.ammo[weaponInfo[player.readyWeapon].ammo]--
    this.mObjHandler.spawnPlayerMissile(player.mo, MObjType.Rocket)
  }

  //
  // A_FireBFG
  //
  fireBFG(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }
    player.ammo[weaponInfo[player.readyWeapon].ammo] -= BGF_CELLS
    this.mObjHandler.spawnPlayerMissile(player.mo, MObjType.Bfg)
  }

  //
  // A_FirePlasma
  //
  firePlasma(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }
    player.ammo[weaponInfo[player.readyWeapon].ammo]--

    this.setPSprite(player,
      PSpriteNum.Flash,
      weaponInfo[player.readyWeapon].flashState + (random.pRandom() & 1))

    this.mObjHandler.spawnPlayerMissile(player.mo, MObjType.Plasma)
  }

  //
  // P_BulletSlope
  // Sets a slope so a near miss is at aproximately
  // the height of the intended target
  //
  private bulletSlopeV = 0
  private bulletSlope(mo: MObj) {
    // see which target is to be aimed at
    let an = mo.angle
    this.bulletSlopeV = this.map.aimLineAttack(mo, an, 16 * 64 * FRACUNIT)

    if (!this.map.lineTarget) {
      an = an + (1 << 26) >>> 0
      this.bulletSlopeV = this.map.aimLineAttack(mo, an, 16 * 64 * FRACUNIT)
      if (!this.map.lineTarget) {
        an = an - (2 << 26) >>> 0
        this.bulletSlopeV = this.map.aimLineAttack(mo, an, 16 * 64 * FRACUNIT)
      }
    }
  }

  //
  // P_GunShot
  //
  private gunShot(mo: MObj, accurate: boolean): void {
    const damage = 5 * (random.pRandom() % 3 + 1)
    let angle = mo.angle

    if (!accurate) {
      angle = angle + (random.pRandom() - random.pRandom() << 18) >>> 0
    }

    this.map.lineAttack(mo, angle, MISSILE_RANGE, this.bulletSlopeV, damage)
  }

  //
  // A_FirePistol
  //
  firePistol(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }
    this.dSound.startSound(player.mo, SfxName.Pistol)
    this.mObjHandler.setMObjState(player.mo, StateNum.PlayAtk2)
    player.ammo[weaponInfo[player.readyWeapon].ammo]--

    this.setPSprite(player,
      PSpriteNum.Flash,
      weaponInfo[player.readyWeapon].flashState)

    this.bulletSlope(player.mo)
    this.gunShot(player.mo, !player.refire)
  }

  //
  // A_FireShotgun
  //
  fireShotgun(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }
    this.dSound.startSound(player.mo, SfxName.Shotgn)
    this.mObjHandler.setMObjState(player.mo, StateNum.PlayAtk2)
    player.ammo[weaponInfo[player.readyWeapon].ammo]--

    this.setPSprite(player,
      PSpriteNum.Flash,
      weaponInfo[player.readyWeapon].flashState)

    this.bulletSlope(player.mo)
    for (let i = 0; i < 7; ++i) {
      this.gunShot(player.mo, false)
    }
  }

  //
  // A_FireShotgun2
  //
  fireShotgun2(player: Player): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }
    this.dSound.startSound(player.mo, SfxName.Dshtgn)
    this.mObjHandler.setMObjState(player.mo, StateNum.PlayAtk2)
    player.ammo[weaponInfo[player.readyWeapon].ammo] -= 2

    this.setPSprite(player,
      PSpriteNum.Flash,
      weaponInfo[player.readyWeapon].flashState)

    this.bulletSlope(player.mo)

    let damage: number
    let angle: number
    for (let i = 0; i < 20; ++i) {
      damage = 5 * (random.pRandom() % 3 + 1)
      angle = player.mo.angle
      angle = angle + (random.pRandom() - random.pRandom() << 19) >>> 0

      this.map.lineAttack(player.mo,
        angle,
        MISSILE_RANGE,
        this.bulletSlopeV + (random.pRandom() - random.pRandom() << 5),
        damage)
    }
  }

  //
  // A_FireCGun
  //
  fireCGun(player: Player, psp: PSpriteDef): void {
    if (player.mo === null) {
      throw 'player.mo = null'
    }

    this.dSound.startSound(player.mo, SfxName.Pistol)

    if (!player.ammo[weaponInfo[player.readyWeapon].ammo]) {
      return
    }

    this.mObjHandler.setMObjState(player.mo, StateNum.PlayAtk2)
    player.ammo[weaponInfo[player.readyWeapon].ammo]--

    debugger
    this.setPSprite(player,
      PSpriteNum.Flash,
      weaponInfo[player.readyWeapon].flashState +
        states.indexOf(psp.state as State<unknown, [unknown]>) -
        StateNum.Chain1)


    this.bulletSlope(player.mo)
    this.gunShot(player.mo, !player.refire)
  }

  light0(player: Player): void {
    player.extraLight = 0
  }

  light1(player: Player): void {
    player.extraLight = 1
  }

  light2(player: Player): void {
    player.extraLight = 2
  }

  //
  // A_BFGSpray
  // Spawn a BFG explosion on every monster in view
  //
  bfgSpray(mo: MObj): void {
    if (mo.target === null) {
      throw 'mo.target = null'
    }

    // offset angles from its attack angle
    let an: number
    let damage: number
    let lineTarget: MObj | null
    let i: number
    let j: number
    for (i = 0; i < 40; ++i) {
      an = mo.angle - ANG90 / 2 + (ANG90 / 40 * i >> 0) >>> 0

      // mo->target is the originator (player)
      //  of the missile
      this.map.aimLineAttack(mo.target, an, 16 * 64 * FRACUNIT)

      lineTarget = this.map.lineTarget

      if (!lineTarget) {
        continue
      }

      this.mObjHandler.spawnMObj(lineTarget.x,
        lineTarget.y,
        lineTarget.z + (lineTarget.height >> 2),
        MObjType.Extrabfg)

      damage = 0
      for (j = 0; j < 15; j++) {
        damage += (random.pRandom() & 7) + 1
      }

      this.inter.damageMObj(lineTarget, mo.target, mo.target, damage)
    }
  }

  //
  // A_BFGsound
  //
  bfgSound(player: Player): void {
    this.dSound.startSound(player.mo, SfxName.Bfg)
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
