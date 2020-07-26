import { AmmoType } from '../global/doomdef'
import { StateNum } from './info/state-num'

class WeaponInfo {
  constructor(
    public ammo: AmmoType,
    public upState: StateNum,
    public downState: StateNum,
    public readyState: StateNum,
    public atkState: StateNum,
    public flashState: StateNum,
  ) { }
}

export const weaponInfo = [
  new WeaponInfo(
    // fist
    AmmoType.NoAmmo,
    StateNum.PunchUp,
    StateNum.PunchDown,
    StateNum.Punch,
    StateNum.Punch1,
    StateNum.Null,
  ),
  new WeaponInfo(
    // pistol
    AmmoType.Clip,
    StateNum.PistolUp,
    StateNum.PistolDown,
    StateNum.Pistol,
    StateNum.Pistol1,
    StateNum.PistolFlash,
  ),
  new WeaponInfo(
    // shotgun
    AmmoType.Shell,
    StateNum.SGunup,
    StateNum.SGunDown,
    StateNum.SGun,
    StateNum.SGun1,
    StateNum.SGunFlash1,
  ),
  new WeaponInfo(
    // chaingun
    AmmoType.Clip,
    StateNum.ChainUp,
    StateNum.ChainDown,
    StateNum.Chain,
    StateNum.Chain1,
    StateNum.ChainFlash1,
  ),
  new WeaponInfo(
    // missile launcher
    AmmoType.Misl,
    StateNum.MissileUp,
    StateNum.MissileDown,
    StateNum.Missile,
    StateNum.Missile1,
    StateNum.MissileFlash1,
  ),
  new WeaponInfo(
    // plasma rifle
    AmmoType.Cell,
    StateNum.PlasmaUp,
    StateNum.PlasmaDown,
    StateNum.Plasma,
    StateNum.Plasma1,
    StateNum.PlasmaFlash1,
  ),
  new WeaponInfo(
    // bfg 9000
    AmmoType.Cell,
    StateNum.BFGUp,
    StateNum.BFGDown,
    StateNum.BFG,
    StateNum.BFGg1,
    StateNum.BFGFlash1,
  ),
  new WeaponInfo(
    // chainsaw
    AmmoType.NoAmmo,
    StateNum.SawUp,
    StateNum.SawDown,
    StateNum.Saw,
    StateNum.Saw1,
    StateNum.Null,
  ),
  new WeaponInfo(
    // super shotgun
    AmmoType.Shell,
    StateNum.DSGunUp,
    StateNum.DSGunDown,
    StateNum.DSGun,
    StateNum.DSGun1,
    StateNum.DSGunFlash1,
  ),
]
