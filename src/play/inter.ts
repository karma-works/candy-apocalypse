import { ANG180, ANGLE_TO_FINE_SHIFT, FINE_ANGLES, fineSine } from '../misc/table'
import { AmmoType, Card, PowerDuration, PowerType, WeaponType } from '../global/doomdef'
import { BASE_THRESHOLD, MAX_HEALTH, ON_FLOOR_Z } from './local'
import { Cheat, Player, PlayerState } from '../doom/player'
import { FRACUNIT, mul } from '../misc/fixed'
import { GameMode, GameVersion, Skill } from '../doom/mode'
import { AutoMap } from '../auto-map/auto-map'
import { Sound as DSound } from '../doom/sound'
import { Doom } from '../doom/doom'
import { Game } from '../game/game'
import { MObj } from './mobj/mobj'
import { MObjFlag } from './mobj/mobj-flag'
import { MObjHandler } from './mobj-handler'
import { MObjType } from '../doom/info/mobj-type'
import { PSprite } from './p-sprite'
import { Play } from './setup'
import { Rendering } from '../rendering/rendering'
import { Sfx } from '../doom/sounds/sfx'
import { SpriteNum } from '../doom/info/sprite-num'
import { StateNum } from '../doom/info/state-num'
import { Strings } from '../translation/strings'
import { random } from '../misc/random'
import { states } from '../doom/info/states'
import { weaponInfo } from '../doom/items'

const BONUS_ADD = 6

// a weapon is found with two clip loads,
// a big item has five clip loads
export const maxAmmo = [ 200, 50, 300, 50 ]
const clipAmmo = [ 10, 4, 20, 1 ]

export class Inter {

  private get autoMap(): AutoMap {
    return this.play.autoMap
  }
  private get doom(): Doom {
    return this.play.doom
  }
  private get dSound(): DSound {
    return this.play.dSound
  }
  private get game(): Game {
    return this.play.game
  }
  private get mObjHandler(): MObjHandler {
    return this.play.mObjHandler
  }
  private get pSprite(): PSprite {
    return this.play.pSprite
  }
  private get rendering(): Rendering {
    return this.play.rendering
  }
  private get strings(): Strings {
    return this.play.doom.strings
  }
  constructor(private play: Play) { }

  //
  // GET STUFF
  //

  //
  // P_GiveAmmo
  // Num is the number of clip loads,
  // not the individual count (0= 1/2 clip).
  // Returns false if the ammo can't be picked up at all
  //
  private giveAmmo(player: Player, ammo: AmmoType, num: number): boolean {
    if (ammo === AmmoType.NoAmmo) {
      return false
    }

    if (ammo < 0 || ammo > AmmoType.NUM_AMMO) {
      throw `P_GiveAmmo: bad type ${ammo}`
    }

    if (player.ammo[ammo] === player.maxAmmo[ammo]) {
      return false
    }

    if (num) {
      num *= clipAmmo[ammo]
    } else {
      num = clipAmmo[ammo] / 2 >> 0
    }

    if (this.game.gameSkill === Skill.Baby ||
      this.game.gameSkill === Skill.Nightmare
    ) {
      // give double ammo in trainer mode,
      // you'll need in nightmare
      num <<= 1
    }

    const oldAmmo = player.ammo[ammo]
    player.ammo[ammo] += num

    if (player.ammo[ammo] > player.maxAmmo[ammo]) {
      player.ammo[ammo] = player.maxAmmo[ammo]
    }

    // If non zero ammo,
    // don't change up weapons,
    // player was lower on purpose.
    if (oldAmmo) {
      return true
    }

    // We were down to zero,
    // so select a new weapon.
    // Preferences are not user selectable.
    switch (ammo) {
    case AmmoType.Clip:
      if (player.readyWeapon === WeaponType.Fist) {
        if (player.weaponOwned[WeaponType.Chaingun]) {
          player.pendingWeapon = WeaponType.Chaingun
        } else {
          player.pendingWeapon = WeaponType.Pistol
        }
      }
      break
    case AmmoType.Shell:
      if (player.readyWeapon === WeaponType.Fist ||
        player.readyWeapon === WeaponType.Pistol
      ) {
        if (player.weaponOwned[WeaponType.Shotgun]) {
          player.pendingWeapon = WeaponType.Shotgun
        }
      }
      break
    case AmmoType.Cell:
      if (player.readyWeapon === WeaponType.Fist ||
        player.readyWeapon === WeaponType.Pistol
      ) {
        if (player.weaponOwned[WeaponType.Plasma]) {
          player.pendingWeapon = WeaponType.Plasma
        }
      }
      break
    case AmmoType.Misl:
      if (player.readyWeapon === WeaponType.Fist) {
        if (player.weaponOwned[WeaponType.Missile]) {
          player.pendingWeapon = WeaponType.Missile
        }
      }
      break
    }

    return true
  }

  //
  // P_GiveWeapon
  // The weapon name may have a MF_DROPPED flag ored in.
  //
  private giveWeapon(player: Player, weapon: WeaponType, dropped: boolean): boolean {
    if (this.game.netGame &&
      this.game.deathMatch !== 2 &&
      !dropped
    ) {
      // leave placed weapons forever on net games
      if (player.weaponOwned[weapon]) {
        return false
      }

      player.bonusCount += BONUS_ADD
      player.weaponOwned[weapon] = true

      if (this.game.deathMatch) {
        this.giveAmmo(player, weaponInfo[weapon].ammo, 5)
      } else {
        this.giveAmmo(player, weaponInfo[weapon].ammo, 2)
      }
      player.pendingWeapon = weapon

      if (player === this.game.players[this.game.consolePlayer]) {
        this.dSound.startSound(null, Sfx.Wpnup)
        return false
      }
    }

    let gaveAmmo: boolean
    if (weaponInfo[weapon].ammo !== AmmoType.NoAmmo) {
      // give one clip with a dropped weapon,
      // two clips with a found weapon
      if (dropped) {
        gaveAmmo = this.giveAmmo(player, weaponInfo[weapon].ammo, 1)
      } else {
        gaveAmmo = this.giveAmmo(player, weaponInfo[weapon].ammo, 2)
      }
    } else {
      gaveAmmo = false
    }

    let gaveWeapon: boolean
    if (player.weaponOwned[weapon]) {
      gaveWeapon = false
    } else {
      gaveWeapon = true
      player.weaponOwned[weapon] = true
      player.pendingWeapon = weapon
    }

    return gaveWeapon || gaveAmmo
  }

  //
  // P_GiveBody
  // Returns false if the body isn't needed at all
  //
  private giveBody(player: Player, num: number): boolean {
    if (player.health >= MAX_HEALTH) {
      return false
    }

    player.health += num
    if (player.health > MAX_HEALTH) {
      player.health = MAX_HEALTH
    }
    if (player.mo === null) {
      throw 'player.mo = null'
    }
    player.mo.health = player.health

    return true
  }

  //
  // P_GiveArmor
  // Returns false if the armor is worse
  // than the current armor.
  //
  private giveArmor(player: Player, armorType: number): boolean {
    const hits = armorType * 100
    if (player.armorPoints >= hits) {
      // don't pick up
      return false
    }

    player.armorType = armorType
    player.armorPoints = hits

    return true
  }

  //
  // P_GiveCard
  //
  private giveCard(player: Player, card: Card): void {
    if (player.cards[card]) {
      return
    }
    player.bonusCount = BONUS_ADD
    player.cards[card] = true
  }

  //
  // P_GivePower
  //
  private givePower(player: Player, power: PowerType): boolean {
    if (power === PowerType.Invulnerability) {
      player.powers[power] = PowerDuration.InvulnTics
      return true
    }
    if (power === PowerType.Invisibility) {
      player.powers[power] = PowerDuration.InvisTics
      if (player.mo === null) {
        throw 'player.mo = null'
      }
      player.mo.flags |= MObjFlag.Shadow
      return true
    }
    if (power === PowerType.Infrared) {
      player.powers[power] = PowerDuration.InfraTics
      return true
    }
    if (power === PowerType.Ironfeet) {
      player.powers[power] = PowerDuration.IronTics
      return true
    }
    if (power === PowerType.Strength) {
      this.giveBody(player, 100)
      player.powers[power] = 1
      return true
    }

    if (player.powers[power]) {
      // already got it
      return false
    }

    player.powers[power] = 1
    return true
  }

  //
  // P_TouchSpecialThing
  //
  touchSpecialThing(special: MObj, toucher: MObj): void {
    const delta = special.z - toucher.z

    if (delta > toucher.height ||
      delta < -8 * FRACUNIT
    ) {
      // out of reach
      return
    }

    let sound = Sfx.Itemup
    const player = toucher.player

    // Dead thing touching.
    // Can happen with a sliding player corpse.
    if (toucher.health <= 0) {
      return
    }

    if (player === null) {
      throw 'player = null'
    }
    if (player.mo === null) {
      throw 'player.mo = null'
    }

    // Identify by sprite.
    switch (special.sprite) {
    // armor
    case SpriteNum.Arm1:
      if (!this.giveArmor(player, 1)) {
        return
      }
      player.message = this.strings.gotarmor
      break

    case SpriteNum.Arm2:
      if (!this.giveArmor(player, 2)) {
        return
      }
      player.message = this.strings.gotmega
      break

      // bonus items
    case SpriteNum.Bon1:
      // can go over 100%
      player.health++
      if (player.health > 200) {
        player.health = 200
      }
      player.mo.health = player.health
      player.message = this.strings.goththbonus
      break

    case SpriteNum.Bon2:
      // can go over 100%
      player.armorPoints++
      if (player.armorPoints > 200 &&
        this.doom.gameVersion > GameVersion.Doom12
      ) {
        player.armorPoints = 200
      }
      if (!player.armorType) {
        player.armorType = 1
      }
      player.message = this.strings.gotarmbonus
      break

    case SpriteNum.Soul:
      player.health += 100
      if (player.health > 200) {
        player.health = 200
      }
      player.mo.health = player.health
      player.message = this.strings.gotsuper
      if (this.doom.gameVersion > GameVersion.Doom12) {
        sound = Sfx.Getpow
      }
      break

    case SpriteNum.Mega:
      if (this.doom.gameMode !== GameMode.Commercial) {
        return
      }
      player.health = 200
      player.mo.health = player.health
      this.giveArmor(player, 2)
      player.message = this.strings.gotmsphere
      if (this.doom.gameVersion > GameVersion.Doom12) {
        sound = Sfx.Getpow
      }
      break

      // cards
      // leave cards for everyone
    case SpriteNum.Bkey:
      if (!player.cards[Card.BlueCard]) {
        player.message = this.strings.gotbluecard
      }
      this.giveCard(player, Card.BlueCard)
      if (!this.game.netGame) {
        break
      }
      return

    case SpriteNum.Ykey:
      if (!player.cards[Card.YellowCard]) {
        player.message = this.strings.gotyelwcard
      }
      this.giveCard(player, Card.YellowCard)
      if (!this.game.netGame) {
        break
      }
      return

    case SpriteNum.Rkey:
      if (!player.cards[Card.RedCard]) {
        player.message = this.strings.gotredcard
      }
      this.giveCard(player, Card.RedCard)
      if (!this.game.netGame) {
        break
      }
      return

    case SpriteNum.Bsku:
      if (!player.cards[Card.BlueSkull]) {
        player.message = this.strings.gotblueskul
      }
      this.giveCard(player, Card.BlueSkull)
      if (!this.game.netGame) {
        break
      }
      return

    case SpriteNum.Ysku:
      if (!player.cards[Card.YellowSkull]) {
        player.message = this.strings.gotyelwskul
      }
      this.giveCard(player, Card.YellowSkull)
      if (!this.game.netGame) {
        break
      }
      return

    case SpriteNum.Rsku:
      if (!player.cards[Card.RedSkull]) {
        player.message = this.strings.gotredskull
      }
      this.giveCard(player, Card.RedSkull)
      if (!this.game.netGame) {
        break
      }
      return

      // medikits, heals
    case SpriteNum.Stim:
      if (!this.giveBody(player, 10)) {
        return
      }
      player.message = this.strings.gotstim
      break

    case SpriteNum.Medi:
      if (!this.giveBody(player, 25)) {
        return
      }

      if (player.health < 25) {
        player.message = this.strings.gotmedineed
      } else {
        player.message = this.strings.gotmedikit
      }
      break


      // power ups
    case SpriteNum.Pinv:
      if (!this.givePower(player, PowerType.Invulnerability)) {
        return
      }
      player.message = this.strings.gotinvul
      if (this.doom.gameVersion > GameVersion.Doom12) {
        sound = Sfx.Getpow
      }
      break

    case SpriteNum.Pstr:
      if (!this.givePower(player, PowerType.Strength)) {
        return
      }
      player.message = this.strings.gotberserk
      if (player.readyWeapon !== WeaponType.Fist) {
        player.pendingWeapon = WeaponType.Fist
      }
      if (this.doom.gameVersion > GameVersion.Doom12) {
        sound = Sfx.Getpow
      }
      break

    case SpriteNum.Pins:
      if (!this.givePower(player, PowerType.Invisibility)) {
        return
      }
      player.message = this.strings.gotinvis
      if (this.doom.gameVersion > GameVersion.Doom12) {
        sound = Sfx.Getpow
      }
      break

    case SpriteNum.Suit:
      if (!this.givePower(player, PowerType.Ironfeet)) {
        return
      }
      player.message = this.strings.gotsuit
      if (this.doom.gameVersion > GameVersion.Doom12) {
        sound = Sfx.Getpow
      }
      break

    case SpriteNum.Pmap:
      if (!this.givePower(player, PowerType.AllMap)) {
        return
      }
      player.message = this.strings.gotmap
      if (this.doom.gameVersion > GameVersion.Doom12) {
        sound = Sfx.Getpow
      }
      break

    case SpriteNum.Pvis:
      if (!this.givePower(player, PowerType.Infrared)) {
        return
      }
      player.message = this.strings.gotvisor
      if (this.doom.gameVersion > GameVersion.Doom12) {
        sound = Sfx.Getpow
      }
      break

      // ammo
    case SpriteNum.Clip:
      if (special.flags & MObjFlag.Dropped) {
        if (!this.giveAmmo(player, AmmoType.Clip, 0)) {
          return
        }
      } else {
        if (!this.giveAmmo(player, AmmoType.Clip, 1)) {
          return
        }
      }
      player.message = this.strings.gotclip
      break

    case SpriteNum.Ammo:
      if (!this.giveAmmo(player, AmmoType.Clip, 5)) {
        return
      }
      player.message = this.strings.gotclipbox
      break

    case SpriteNum.Rock:
      if (!this.giveAmmo(player, AmmoType.Misl, 1)) {
        return
      }
      player.message = this.strings.gotrocket
      break

    case SpriteNum.Brok:
      if (!this.giveAmmo(player, AmmoType.Misl, 5)) {
        return
      }
      player.message = this.strings.gotrockbox
      break

    case SpriteNum.Cell:
      if (!this.giveAmmo(player, AmmoType.Cell, 1)) {
        return
      }
      player.message = this.strings.gotcell
      break

    case SpriteNum.Celp:
      if (!this.giveAmmo(player, AmmoType.Cell, 5)) {
        return
      }
      player.message = this.strings.gotcellbox
      break

    case SpriteNum.Shel:
      if (!this.giveAmmo(player, AmmoType.Shell, 1)) {
        return
      }
      player.message = this.strings.gotshells
      break

    case SpriteNum.Sbox:
      if (!this.giveAmmo(player, AmmoType.Shell, 5)) {
        return
      }
      player.message = this.strings.gotshellbox
      break

    case SpriteNum.Bpak:
      if (!player.backpack) {
        for (let i = 0; i < AmmoType.NUM_AMMO; i++) {
          player.maxAmmo[i] *= 2
        }
        player.backpack = true
      }
      for (let i = 0; i < AmmoType.NUM_AMMO; i++) {
        this.giveAmmo(player, i, 1)
      }
      player.message = this.strings.gotbackpack
      break

      // weapons
    case SpriteNum.Bfug:
      if (!this.giveWeapon(player, WeaponType.BFG, false)) {
        return
      }
      player.message = this.strings.gotbfg9000
      sound = Sfx.Wpnup
      break

    case SpriteNum.Mgun:
      if (!this.giveWeapon(player, WeaponType.Chaingun, !!(special.flags & MObjFlag.Dropped))) {
        return
      }
      player.message = this.strings.gotchaingun
      sound = Sfx.Wpnup
      break

    case SpriteNum.Csaw:
      if (!this.giveWeapon(player, WeaponType.Chainsaw, false)) {
        return
      }
      player.message = this.strings.gotchainsaw
      sound = Sfx.Wpnup
      break

    case SpriteNum.Laun:
      if (!this.giveWeapon(player, WeaponType.Missile, false)) {
        return
      }
      player.message = this.strings.gotlauncher
      sound = Sfx.Wpnup
      break

    case SpriteNum.Plas:
      if (!this.giveWeapon(player, WeaponType.Plasma, false)) {
        return
      }
      player.message = this.strings.gotplasma
      sound = Sfx.Wpnup
      break

    case SpriteNum.Shot:
      if (!this.giveWeapon(player, WeaponType.Shotgun, !!(special.flags & MObjFlag.Dropped))) {
        return
      }
      player.message = this.strings.gotshotgun
      sound = Sfx.Wpnup
      break

    case SpriteNum.Sgn2:
      if (!this.giveWeapon(player, WeaponType.Supershotgun, !!(special.flags & MObjFlag.Dropped))) {
        return
      }
      player.message = this.strings.gotshotgun2
      sound = Sfx.Wpnup
      break

    default:
      throw 'P_SpecialThing: Unknown gettable thing'
    }

    if (special.flags & MObjFlag.CountItem) {
      player.itemCount++
    }

    this.mObjHandler.removeMObj(special)
    player.bonusCount += BONUS_ADD

    if (player === this.game.players[this.game.consolePlayer]) {
      this.dSound.startSound(null, sound)
    }
  }

  //
  // KillMobj
  //
  private killMObj(source: MObj | null, target: MObj): void {
    target.flags &= ~(MObjFlag.Shootable | MObjFlag.Float | MObjFlag.SkullFly)

    if (target.type !== MObjType.Skull) {
      target.flags &= ~MObjFlag.NoGravity
    }

    target.flags |= MObjFlag.Corpse | MObjFlag.DropOff
    target.height >>= 2

    if (source && source.player) {
      // count for intermission
      if (target.flags & MObjFlag.CountKill) {
        source.player.killCount++
      }

      if (target.player) {
        source.player.frags[this.game.players.indexOf(target.player)]++
      }
    } else if (!this.game.netGame && target.flags & MObjFlag.CountKill) {
      // count all monster deaths,
      // even those caused by other monsters
      this.game.players[0].killCount++
    }

    if (target.player) {
      // count environment kills against you
      if (!source) {
        target.player.frags[this.game.players.indexOf(target.player)]++
      }

      target.flags &= ~MObjFlag.Solid
      target.player.playerState = PlayerState.Dead
      this.pSprite.dropWeapon(target.player)

      if (target.player === this.game.players[this.game.consolePlayer] &&
        this.autoMap.active
      ) {
        // don't die in auto map,
        // switch view prior to dying
        this.autoMap.stop()
      }
    }

    if (target.health < -target.info.spawnHealth &&
      target.info.xdeathState
    ) {
      this.mObjHandler.setMObjState(target, target.info.xdeathState)
    } else {
      this.mObjHandler.setMObjState(target, target.info.deathState)
    }
    target.tics -= random.pRandom() & 3

    if (target.tics < 1) {
      target.tics = 1
    }

    if (this.doom.gameVersion === GameVersion.Chex) {
      return
    }

    // Drop stuff.
    // This determines the kind of object spawned
    // during the death frame of a thing.
    let item: MObjType
    switch (target.type) {
    case MObjType.Wolfss:
    case MObjType.Possessed:
      item = MObjType.Clip
      break

    case MObjType.Shotguy:
      item = MObjType.Shotgun
      break

    case MObjType.Chainguy:
      item = MObjType.Chaingun
      break

    default:
      return
    }

    const mo = this.mObjHandler.spawnMObj(target.x, target.y, ON_FLOOR_Z, item)
    // special versions of items
    mo.flags |= MObjFlag.Dropped
  }

  //
  // P_DamageMobj
  // Damages both enemies and players
  // "inflictor" is the thing that caused the damage
  //  creature or missile, can be NULL (slime, etc)
  // "source" is the thing to target after taking damage
  //  creature or NULL
  // Source and inflictor are the same for melee attacks.
  // Source can be NULL for slime, barrel explosions
  // and other environmental stuff.
  //
  damageMObj(target: MObj, inflictor: MObj | null, source: MObj | null, damage: number): void {
    if (!(target.flags & MObjFlag.Shootable)) {
      // shouldn't happen...
      return
    }

    if (target.health <= 0) {
      return
    }

    if (target.flags & MObjFlag.SkullFly) {
      target.momX = target.momY = target.momZ = 0
    }

    const player = target.player
    if (player && this.game.gameSkill === Skill.Baby) {
      // take half damage in trainer mode
      damage >>= 1
    }

    // Some close combat weapons should not
    // inflict thrust and push the victim out of reach,
    // thus kick away unless using the chainsaw.
    if (inflictor &&
      !(target.flags & MObjFlag.NoClip) &&
      (!source ||
        !source.player ||
        source.player.readyWeapon !== WeaponType.Chainsaw)
    ) {
      let ang = this.rendering.pointToAngle2(inflictor.x,
        inflictor.y,
        target.x,
        target.y)

      let thrust = damage * (FRACUNIT >> 3) * 100 / target.info.mass

      // make fall forwards sometimes
      if (damage < 40 &&
        damage > target.health &&
        target.z - inflictor.z > 64 * FRACUNIT &&
        random.pRandom() & 1
      ) {
        ang = ang + ANG180 >>> 0
        thrust *= 4
      }

      ang >>>= ANGLE_TO_FINE_SHIFT
      target.momX += mul(thrust, fineSine[FINE_ANGLES / 4 + ang])
      target.momY += mul(thrust, fineSine[ang])
    }

    // player specific
    if (player) {
      if (target.subSector === null) {
        throw 'target.subSector = null'
      }
      if (target.subSector.sector === null) {
        throw 'target.subSector.sector = null'
      }

      // end of game hell hack
      if (target.subSector.sector.special === 11 &&
        damage >= target.health
      ) {
        damage = target.health - 1
      }

      // Below certain threshold,
      // ignore damage in GOD mode, or with INVUL power.
      if (damage < 1000 &&
        (player.cheats & Cheat.GodMode ||
        player.powers[PowerType.Invulnerability])
      ) {
        return
      }

      if (player.armorType) {
        let saved: number
        if (player.armorType === 1) {
          saved = damage / 3 >> 0
        } else {
          saved = damage / 2 >> 0
        }

        if (player.armorPoints <= saved) {
          // armor is used up
          saved = player.armorPoints
          player.armorType = 0
        }
        player.armorPoints -= saved
        damage -= saved
      }
      // mirror mobj health here for Dave
      player.health -= damage
      if (player.health < 0) {
        player.health = 0
      }

      player.attacker = source
      // add damage after armor / invuln
      player.damageCount += damage

      if (player.damageCount > 100) {
      // teleport stomp does 10k points...
        player.damageCount = 100
      }
    }

    // do the damage
    target.health -= damage
    if (target.health <= 0) {
      this.killMObj(source, target)
      return
    }

    if (random.pRandom() < target.info.painChance &&
      !(target.flags & MObjFlag.SkullFly)
    ) {
      // fight back!
      target.flags |= MObjFlag.JustHit

      this.mObjHandler.setMObjState(target, target.info.painState)
    }

    // we're awake now...
    target.reactionTime = 0

    if ((!target.threshold || target.type === MObjType.Vile)
      && source && (source !== target || this.doom.gameVersion <= GameVersion.Doom12)
      && source.type !== MObjType.Vile
    ) {
      // if not intent on another player,
      // chase after this one
      target.target = source
      target.threshold = BASE_THRESHOLD
      if (target.state === states[target.info.spawnState] &&
        target.info.seeState !== StateNum.Null
      ) {
        this.mObjHandler.setMObjState(target, target.info.seeState)
      }
    }

  }
}
