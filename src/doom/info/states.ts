import { Enemy } from '../../play/enemy'
import { PSprite } from '../../play/p-sprite'
import { SpriteNum } from './sprite-num'
import { State } from './state'
import { StateNum } from './state-num'

export const states = [
  // S_NULL
  new State(SpriteNum.Troo, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_LIGHTDONE
  new State(SpriteNum.Shtg, 4, 0, PSprite, PSprite.prototype.light0, StateNum.Null, 0, 0),
  // S_PUNCH
  new State(SpriteNum.Pung, 0, 1, PSprite, PSprite.prototype.weaponReady, StateNum.Punch, 0, 0),
  // S_PUNCHDOWN
  new State(SpriteNum.Pung, 0, 1, PSprite, PSprite.prototype.lower, StateNum.PunchDown, 0, 0),
  // S_PUNCHUP
  new State(SpriteNum.Pung, 0, 1, PSprite, PSprite.prototype.raise, StateNum.PunchUp, 0, 0),
  // S_PUNCH1
  new State(SpriteNum.Pung, 1, 4, null, null, StateNum.Punch2, 0, 0),
  // S_PUNCH2
  new State(SpriteNum.Pung, 2, 4, PSprite, PSprite.prototype.punch, StateNum.Punch3, 0, 0),
  // S_PUNCH3
  new State(SpriteNum.Pung, 3, 5, null, null, StateNum.Punch4, 0, 0),
  // S_PUNCH4
  new State(SpriteNum.Pung, 2, 4, null, null, StateNum.Punch5, 0, 0),
  // S_PUNCH5
  new State(SpriteNum.Pung, 1, 5, PSprite, PSprite.prototype.reFire, StateNum.Punch, 0, 0),
  // S_PISTOL
  new State(SpriteNum.Pisg, 0, 1, PSprite, PSprite.prototype.weaponReady, StateNum.Pistol, 0, 0),
  // S_PISTOLDOWN
  new State(SpriteNum.Pisg, 0, 1, PSprite, PSprite.prototype.lower, StateNum.PistolDown, 0, 0),
  // S_PISTOLUP
  new State(SpriteNum.Pisg, 0, 1, PSprite, PSprite.prototype.raise, StateNum.PistolUp, 0, 0),
  // S_PISTOL1
  new State(SpriteNum.Pisg, 0, 4, null, null, StateNum.Pistol2, 0, 0),
  // S_PISTOL2
  new State(SpriteNum.Pisg, 1, 6, PSprite, PSprite.prototype.firePistol, StateNum.Pistol3, 0, 0),
  // S_PISTOL3
  new State(SpriteNum.Pisg, 2, 4, null, null, StateNum.Pistol4, 0, 0),
  // S_PISTOL4
  new State(SpriteNum.Pisg, 1, 5, PSprite, PSprite.prototype.reFire, StateNum.Pistol, 0, 0),
  // S_PISTOLFLASH
  new State(SpriteNum.Pisf, 32768, 7, PSprite, PSprite.prototype.light1, StateNum.Lightdone, 0, 0),
  // S_SGUN
  new State(SpriteNum.Shtg, 0, 1, PSprite, PSprite.prototype.weaponReady, StateNum.SGun, 0, 0),
  // S_SGUNDOWN
  new State(SpriteNum.Shtg, 0, 1, PSprite, PSprite.prototype.lower, StateNum.SGunDown, 0, 0),
  // S_SGUNUP
  new State(SpriteNum.Shtg, 0, 1, PSprite, PSprite.prototype.raise, StateNum.SGunup, 0, 0),
  // S_SGUN1
  new State(SpriteNum.Shtg, 0, 3, null, null, StateNum.Sgun2, 0, 0),
  // S_SGUN2
  new State(SpriteNum.Shtg, 0, 7, PSprite, PSprite.prototype.fireShotgun, StateNum.Sgun3, 0, 0),
  // S_SGUN3
  new State(SpriteNum.Shtg, 1, 5, null, null, StateNum.Sgun4, 0, 0),
  // S_SGUN4
  new State(SpriteNum.Shtg, 2, 5, null, null, StateNum.Sgun5, 0, 0),
  // S_SGUN5
  new State(SpriteNum.Shtg, 3, 4, null, null, StateNum.Sgun6, 0, 0),
  // S_SGUN6
  new State(SpriteNum.Shtg, 2, 5, null, null, StateNum.Sgun7, 0, 0),
  // S_SGUN7
  new State(SpriteNum.Shtg, 1, 5, null, null, StateNum.Sgun8, 0, 0),
  // S_SGUN8
  new State(SpriteNum.Shtg, 0, 3, null, null, StateNum.Sgun9, 0, 0),
  // S_SGUN9
  new State(SpriteNum.Shtg, 0, 7, PSprite, PSprite.prototype.reFire, StateNum.SGun, 0, 0),
  // S_SGUNFLASH1
  new State(SpriteNum.Shtf, 32768, 4, PSprite, PSprite.prototype.light1, StateNum.Sgunflash2, 0, 0),
  // S_SGUNFLASH2
  new State(SpriteNum.Shtf, 32769, 3, PSprite, PSprite.prototype.light2, StateNum.Lightdone, 0, 0),
  // S_DSGUN
  new State(SpriteNum.Sht2, 0, 1, PSprite, PSprite.prototype.weaponReady, StateNum.DSGun, 0, 0),
  // S_DSGUNDOWN
  new State(SpriteNum.Sht2, 0, 1, PSprite, PSprite.prototype.lower, StateNum.DSGunDown, 0, 0),
  // S_DSGUNUP
  new State(SpriteNum.Sht2, 0, 1, PSprite, PSprite.prototype.raise, StateNum.DSGunUp, 0, 0),
  // S_DSGUN1
  new State(SpriteNum.Sht2, 0, 3, null, null, StateNum.Dsgun2, 0, 0),
  // S_DSGUN2
  new State(SpriteNum.Sht2, 0, 7, PSprite, PSprite.prototype.fireShotgun2, StateNum.Dsgun3, 0, 0),
  // S_DSGUN3
  new State(SpriteNum.Sht2, 1, 7, null, null, StateNum.Dsgun4, 0, 0),
  // S_DSGUN4
  new State(SpriteNum.Sht2, 2, 7, PSprite, PSprite.prototype.checkReload, StateNum.Dsgun5, 0, 0),
  // S_DSGUN5
  new State(SpriteNum.Sht2, 3, 7, Enemy, Enemy.prototype.openShotgun2, StateNum.Dsgun6, 0, 0),
  // S_DSGUN6
  new State(SpriteNum.Sht2, 4, 7, null, null, StateNum.Dsgun7, 0, 0),
  // S_DSGUN7
  new State(SpriteNum.Sht2, 5, 7, Enemy, Enemy.prototype.loadShotgun2, StateNum.Dsgun8, 0, 0),
  // S_DSGUN8
  new State(SpriteNum.Sht2, 6, 6, null, null, StateNum.Dsgun9, 0, 0),
  // S_DSGUN9
  new State(SpriteNum.Sht2, 7, 6, Enemy, Enemy.prototype.closeShotgun2, StateNum.Dsgun10, 0, 0),
  // S_DSGUN10
  new State(SpriteNum.Sht2, 0, 5, PSprite, PSprite.prototype.reFire, StateNum.DSGun, 0, 0),
  // S_DSNR1
  new State(SpriteNum.Sht2, 1, 7, null, null, StateNum.Dsnr2, 0, 0),
  // S_DSNR2
  new State(SpriteNum.Sht2, 0, 3, null, null, StateNum.DSGunDown, 0, 0),
  // S_DSGUNFLASH1
  new State(SpriteNum.Sht2, 32776, 5, PSprite, PSprite.prototype.light1, StateNum.Dsgunflash2, 0, 0),
  // S_DSGUNFLASH2
  new State(SpriteNum.Sht2, 32777, 4, PSprite, PSprite.prototype.light2, StateNum.Lightdone, 0, 0),
  // S_CHAIN
  new State(SpriteNum.Chgg, 0, 1, PSprite, PSprite.prototype.weaponReady, StateNum.Chain, 0, 0),
  // S_CHAINDOWN
  new State(SpriteNum.Chgg, 0, 1, PSprite, PSprite.prototype.lower, StateNum.ChainDown, 0, 0),
  // S_CHAINUP
  new State(SpriteNum.Chgg, 0, 1, PSprite, PSprite.prototype.raise, StateNum.ChainUp, 0, 0),
  // S_CHAIN1
  new State(SpriteNum.Chgg, 0, 4, PSprite, PSprite.prototype.fireCGun, StateNum.Chain2, 0, 0),
  // S_CHAIN2
  new State(SpriteNum.Chgg, 1, 4, PSprite, PSprite.prototype.fireCGun, StateNum.Chain3, 0, 0),
  // S_CHAIN3
  new State(SpriteNum.Chgg, 1, 0, PSprite, PSprite.prototype.reFire, StateNum.Chain, 0, 0),
  // S_CHAINFLASH1
  new State(SpriteNum.Chgf, 32768, 5, PSprite, PSprite.prototype.light1, StateNum.Lightdone, 0, 0),
  // S_CHAINFLASH2
  new State(SpriteNum.Chgf, 32769, 5, PSprite, PSprite.prototype.light2, StateNum.Lightdone, 0, 0),
  // S_MISSILE
  new State(SpriteNum.Misg, 0, 1, PSprite, PSprite.prototype.weaponReady, StateNum.Missile, 0, 0),
  // S_MISSILEDOWN
  new State(SpriteNum.Misg, 0, 1, PSprite, PSprite.prototype.lower, StateNum.MissileDown, 0, 0),
  // S_MISSILEUP
  new State(SpriteNum.Misg, 0, 1, PSprite, PSprite.prototype.raise, StateNum.MissileUp, 0, 0),
  // S_MISSILE1
  new State(SpriteNum.Misg, 1, 8, PSprite, PSprite.prototype.gunFlash, StateNum.Missile2, 0, 0),
  // S_MISSILE2
  new State(SpriteNum.Misg, 1, 12, PSprite, PSprite.prototype.fireMissile, StateNum.Missile3, 0, 0),
  // S_MISSILE3
  new State(SpriteNum.Misg, 1, 0, PSprite, PSprite.prototype.reFire, StateNum.Missile, 0, 0),
  // S_MISSILEFLASH1
  new State(SpriteNum.Misf, 32768, 3, PSprite, PSprite.prototype.light1, StateNum.Missileflash2, 0, 0),
  // S_MISSILEFLASH2
  new State(SpriteNum.Misf, 32769, 4, null, null, StateNum.Missileflash3, 0, 0),
  // S_MISSILEFLASH3
  new State(SpriteNum.Misf, 32770, 4, PSprite, PSprite.prototype.light2, StateNum.Missileflash4, 0, 0),
  // S_MISSILEFLASH4
  new State(SpriteNum.Misf, 32771, 4, PSprite, PSprite.prototype.light2, StateNum.Lightdone, 0, 0),
  // S_SAW
  new State(SpriteNum.Sawg, 2, 4, PSprite, PSprite.prototype.weaponReady, StateNum.Sawb, 0, 0),
  // S_SAWB
  new State(SpriteNum.Sawg, 3, 4, PSprite, PSprite.prototype.weaponReady, StateNum.Saw, 0, 0),
  // S_SAWDOWN
  new State(SpriteNum.Sawg, 2, 1, PSprite, PSprite.prototype.lower, StateNum.SawDown, 0, 0),
  // S_SAWUP
  new State(SpriteNum.Sawg, 2, 1, PSprite, PSprite.prototype.raise, StateNum.SawUp, 0, 0),
  // S_SAW1
  new State(SpriteNum.Sawg, 0, 4, PSprite, PSprite.prototype.saw, StateNum.Saw2, 0, 0),
  // S_SAW2
  new State(SpriteNum.Sawg, 1, 4, PSprite, PSprite.prototype.saw, StateNum.Saw3, 0, 0),
  // S_SAW3
  new State(SpriteNum.Sawg, 1, 0, PSprite, PSprite.prototype.reFire, StateNum.Saw, 0, 0),
  // S_PLASMA
  new State(SpriteNum.Plsg, 0, 1, PSprite, PSprite.prototype.weaponReady, StateNum.Plasma, 0, 0),
  // S_PLASMADOWN
  new State(SpriteNum.Plsg, 0, 1, PSprite, PSprite.prototype.lower, StateNum.PlasmaDown, 0, 0),
  // S_PLASMAUP
  new State(SpriteNum.Plsg, 0, 1, PSprite, PSprite.prototype.raise, StateNum.PlasmaUp, 0, 0),
  // S_PLASMA1
  new State(SpriteNum.Plsg, 0, 3, PSprite, PSprite.prototype.firePlasma, StateNum.Plasma2, 0, 0),
  // S_PLASMA2
  new State(SpriteNum.Plsg, 1, 20, PSprite, PSprite.prototype.reFire, StateNum.Plasma, 0, 0),
  // S_PLASMAFLASH1
  new State(SpriteNum.Plsf, 32768, 4, PSprite, PSprite.prototype.light1, StateNum.Lightdone, 0, 0),
  // S_PLASMAFLASH2
  new State(SpriteNum.Plsf, 32769, 4, PSprite, PSprite.prototype.light1, StateNum.Lightdone, 0, 0),
  // S_BFG
  new State(SpriteNum.Bfgg, 0, 1, PSprite, PSprite.prototype.weaponReady, StateNum.BFG, 0, 0),
  // S_BFGDOWN
  new State(SpriteNum.Bfgg, 0, 1, PSprite, PSprite.prototype.lower, StateNum.BFGDown, 0, 0),
  // S_BFGUP
  new State(SpriteNum.Bfgg, 0, 1, PSprite, PSprite.prototype.raise, StateNum.BFGUp, 0, 0),
  // S_BFG1
  new State(SpriteNum.Bfgg, 0, 20, PSprite, PSprite.prototype.bFGsound, StateNum.Bfg2, 0, 0),
  // S_BFG2
  new State(SpriteNum.Bfgg, 1, 10, PSprite, PSprite.prototype.gunFlash, StateNum.Bfg3, 0, 0),
  // S_BFG3
  new State(SpriteNum.Bfgg, 1, 10, PSprite, PSprite.prototype.fireBFG, StateNum.Bfg4, 0, 0),
  // S_BFG4
  new State(SpriteNum.Bfgg, 1, 20, PSprite, PSprite.prototype.reFire, StateNum.BFG, 0, 0),
  // S_BFGFLASH1
  new State(SpriteNum.Bfgf, 32768, 11, PSprite, PSprite.prototype.light1, StateNum.Bfgflash2, 0, 0),
  // S_BFGFLASH2
  new State(SpriteNum.Bfgf, 32769, 6, PSprite, PSprite.prototype.light2, StateNum.Lightdone, 0, 0),
  // S_BLOOD1
  new State(SpriteNum.Blud, 2, 8, null, null, StateNum.Blood2, 0, 0),
  // S_BLOOD2
  new State(SpriteNum.Blud, 1, 8, null, null, StateNum.Blood3, 0, 0),
  // S_BLOOD3
  new State(SpriteNum.Blud, 0, 8, null, null, StateNum.Null, 0, 0),
  // S_PUFF1
  new State(SpriteNum.Puff, 32768, 4, null, null, StateNum.Puff2, 0, 0),
  // S_PUFF2
  new State(SpriteNum.Puff, 1, 4, null, null, StateNum.Puff3, 0, 0),
  // S_PUFF3
  new State(SpriteNum.Puff, 2, 4, null, null, StateNum.Puff4, 0, 0),
  // S_PUFF4
  new State(SpriteNum.Puff, 3, 4, null, null, StateNum.Null, 0, 0),
  // S_TBALL1
  new State(SpriteNum.Bal1, 32768, 4, null, null, StateNum.Tball2, 0, 0),
  // S_TBALL2
  new State(SpriteNum.Bal1, 32769, 4, null, null, StateNum.Tball1, 0, 0),
  // S_TBALLX1
  new State(SpriteNum.Bal1, 32770, 6, null, null, StateNum.Tballx2, 0, 0),
  // S_TBALLX2
  new State(SpriteNum.Bal1, 32771, 6, null, null, StateNum.Tballx3, 0, 0),
  // S_TBALLX3
  new State(SpriteNum.Bal1, 32772, 6, null, null, StateNum.Null, 0, 0),
  // S_RBALL1
  new State(SpriteNum.Bal2, 32768, 4, null, null, StateNum.Rball2, 0, 0),
  // S_RBALL2
  new State(SpriteNum.Bal2, 32769, 4, null, null, StateNum.Rball1, 0, 0),
  // S_RBALLX1
  new State(SpriteNum.Bal2, 32770, 6, null, null, StateNum.Rballx2, 0, 0),
  // S_RBALLX2
  new State(SpriteNum.Bal2, 32771, 6, null, null, StateNum.Rballx3, 0, 0),
  // S_RBALLX3
  new State(SpriteNum.Bal2, 32772, 6, null, null, StateNum.Null, 0, 0),
  // S_PLASBALL
  new State(SpriteNum.Plss, 32768, 6, null, null, StateNum.Plasball2, 0, 0),
  // S_PLASBALL2
  new State(SpriteNum.Plss, 32769, 6, null, null, StateNum.Plasball, 0, 0),
  // S_PLASEXP
  new State(SpriteNum.Plse, 32768, 4, null, null, StateNum.Plasexp2, 0, 0),
  // S_PLASEXP2
  new State(SpriteNum.Plse, 32769, 4, null, null, StateNum.Plasexp3, 0, 0),
  // S_PLASEXP3
  new State(SpriteNum.Plse, 32770, 4, null, null, StateNum.Plasexp4, 0, 0),
  // S_PLASEXP4
  new State(SpriteNum.Plse, 32771, 4, null, null, StateNum.Plasexp5, 0, 0),
  // S_PLASEXP5
  new State(SpriteNum.Plse, 32772, 4, null, null, StateNum.Null, 0, 0),
  // S_ROCKET
  new State(SpriteNum.Misl, 32768, 1, null, null, StateNum.Rocket, 0, 0),
  // S_BFGSHOT
  new State(SpriteNum.Bfs1, 32768, 4, null, null, StateNum.Bfgshot2, 0, 0),
  // S_BFGSHOT2
  new State(SpriteNum.Bfs1, 32769, 4, null, null, StateNum.Bfgshot, 0, 0),
  // S_BFGLAND
  new State(SpriteNum.Bfe1, 32768, 8, null, null, StateNum.Bfgland2, 0, 0),
  // S_BFGLAND2
  new State(SpriteNum.Bfe1, 32769, 8, null, null, StateNum.Bfgland3, 0, 0),
  // S_BFGLAND3
  new State(SpriteNum.Bfe1, 32770, 8, PSprite, PSprite.prototype.bfgSpray, StateNum.Bfgland4, 0, 0),
  // S_BFGLAND4
  new State(SpriteNum.Bfe1, 32771, 8, null, null, StateNum.Bfgland5, 0, 0),
  // S_BFGLAND5
  new State(SpriteNum.Bfe1, 32772, 8, null, null, StateNum.Bfgland6, 0, 0),
  // S_BFGLAND6
  new State(SpriteNum.Bfe1, 32773, 8, null, null, StateNum.Null, 0, 0),
  // S_BFGEXP
  new State(SpriteNum.Bfe2, 32768, 8, null, null, StateNum.Bfgexp2, 0, 0),
  // S_BFGEXP2
  new State(SpriteNum.Bfe2, 32769, 8, null, null, StateNum.Bfgexp3, 0, 0),
  // S_BFGEXP3
  new State(SpriteNum.Bfe2, 32770, 8, null, null, StateNum.Bfgexp4, 0, 0),
  // S_BFGEXP4
  new State(SpriteNum.Bfe2, 32771, 8, null, null, StateNum.Null, 0, 0),
  // S_EXPLODE1
  new State(SpriteNum.Misl, 32769, 8, Enemy, Enemy.prototype.explode, StateNum.Explode2, 0, 0),
  // S_EXPLODE2
  new State(SpriteNum.Misl, 32770, 6, null, null, StateNum.Explode3, 0, 0),
  // S_EXPLODE3
  new State(SpriteNum.Misl, 32771, 4, null, null, StateNum.Null, 0, 0),
  // S_TFOG
  new State(SpriteNum.Tfog, 32768, 6, null, null, StateNum.Tfog01, 0, 0),
  // S_TFOG01
  new State(SpriteNum.Tfog, 32769, 6, null, null, StateNum.Tfog02, 0, 0),
  // S_TFOG02
  new State(SpriteNum.Tfog, 32768, 6, null, null, StateNum.Tfog2, 0, 0),
  // S_TFOG2
  new State(SpriteNum.Tfog, 32769, 6, null, null, StateNum.Tfog3, 0, 0),
  // S_TFOG3
  new State(SpriteNum.Tfog, 32770, 6, null, null, StateNum.Tfog4, 0, 0),
  // S_TFOG4
  new State(SpriteNum.Tfog, 32771, 6, null, null, StateNum.Tfog5, 0, 0),
  // S_TFOG5
  new State(SpriteNum.Tfog, 32772, 6, null, null, StateNum.Tfog6, 0, 0),
  // S_TFOG6
  new State(SpriteNum.Tfog, 32773, 6, null, null, StateNum.Tfog7, 0, 0),
  // S_TFOG7
  new State(SpriteNum.Tfog, 32774, 6, null, null, StateNum.Tfog8, 0, 0),
  // S_TFOG8
  new State(SpriteNum.Tfog, 32775, 6, null, null, StateNum.Tfog9, 0, 0),
  // S_TFOG9
  new State(SpriteNum.Tfog, 32776, 6, null, null, StateNum.Tfog10, 0, 0),
  // S_TFOG10
  new State(SpriteNum.Tfog, 32777, 6, null, null, StateNum.Null, 0, 0),
  // S_IFOG
  new State(SpriteNum.Ifog, 32768, 6, null, null, StateNum.Ifog01, 0, 0),
  // S_IFOG01
  new State(SpriteNum.Ifog, 32769, 6, null, null, StateNum.Ifog02, 0, 0),
  // S_IFOG02
  new State(SpriteNum.Ifog, 32768, 6, null, null, StateNum.Ifog2, 0, 0),
  // S_IFOG2
  new State(SpriteNum.Ifog, 32769, 6, null, null, StateNum.Ifog3, 0, 0),
  // S_IFOG3
  new State(SpriteNum.Ifog, 32770, 6, null, null, StateNum.Ifog4, 0, 0),
  // S_IFOG4
  new State(SpriteNum.Ifog, 32771, 6, null, null, StateNum.Ifog5, 0, 0),
  // S_IFOG5
  new State(SpriteNum.Ifog, 32772, 6, null, null, StateNum.Null, 0, 0),
  // S_PLAY
  new State(SpriteNum.Play, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_PLAY_RUN1
  new State(SpriteNum.Play, 0, 4, null, null, StateNum.PlayRun2, 0, 0),
  // S_PLAY_RUN2
  new State(SpriteNum.Play, 1, 4, null, null, StateNum.PlayRun3, 0, 0),
  // S_PLAY_RUN3
  new State(SpriteNum.Play, 2, 4, null, null, StateNum.PlayRun4, 0, 0),
  // S_PLAY_RUN4
  new State(SpriteNum.Play, 3, 4, null, null, StateNum.PlayRun1, 0, 0),
  // S_PLAY_ATK1
  new State(SpriteNum.Play, 4, 12, null, null, StateNum.Play, 0, 0),
  // S_PLAY_ATK2
  new State(SpriteNum.Play, 32773, 6, null, null, StateNum.PlayAtk1, 0, 0),
  // S_PLAY_PAIN
  new State(SpriteNum.Play, 6, 4, null, null, StateNum.PlayPain2, 0, 0),
  // S_PLAY_PAIN2
  new State(SpriteNum.Play, 6, 4, Enemy, Enemy.prototype.pain, StateNum.Play, 0, 0),
  // S_PLAY_DIE1
  new State(SpriteNum.Play, 7, 10, null, null, StateNum.PlayDie2, 0, 0),
  // S_PLAY_DIE2
  new State(SpriteNum.Play, 8, 10, Enemy, Enemy.prototype.playerScream, StateNum.PlayDie3, 0, 0),
  // S_PLAY_DIE3
  new State(SpriteNum.Play, 9, 10, Enemy, Enemy.prototype.fall, StateNum.PlayDie4, 0, 0),
  // S_PLAY_DIE4
  new State(SpriteNum.Play, 10, 10, null, null, StateNum.PlayDie5, 0, 0),
  // S_PLAY_DIE5
  new State(SpriteNum.Play, 11, 10, null, null, StateNum.PlayDie6, 0, 0),
  // S_PLAY_DIE6
  new State(SpriteNum.Play, 12, 10, null, null, StateNum.PlayDie7, 0, 0),
  // S_PLAY_DIE7
  new State(SpriteNum.Play, 13, -1, null, null, StateNum.Null, 0, 0),
  // S_PLAY_XDIE1
  new State(SpriteNum.Play, 14, 5, null, null, StateNum.PlayXdie2, 0, 0),
  // S_PLAY_XDIE2
  new State(SpriteNum.Play, 15, 5, Enemy, Enemy.prototype.xScream, StateNum.PlayXdie3, 0, 0),
  // S_PLAY_XDIE3
  new State(SpriteNum.Play, 16, 5, Enemy, Enemy.prototype.fall, StateNum.PlayXdie4, 0, 0),
  // S_PLAY_XDIE4
  new State(SpriteNum.Play, 17, 5, null, null, StateNum.PlayXdie5, 0, 0),
  // S_PLAY_XDIE5
  new State(SpriteNum.Play, 18, 5, null, null, StateNum.PlayXdie6, 0, 0),
  // S_PLAY_XDIE6
  new State(SpriteNum.Play, 19, 5, null, null, StateNum.PlayXdie7, 0, 0),
  // S_PLAY_XDIE7
  new State(SpriteNum.Play, 20, 5, null, null, StateNum.PlayXdie8, 0, 0),
  // S_PLAY_XDIE8
  new State(SpriteNum.Play, 21, 5, null, null, StateNum.PlayXdie9, 0, 0),
  // S_PLAY_XDIE9
  new State(SpriteNum.Play, 22, -1, null, null, StateNum.Null, 0, 0),
  // S_POSS_STND
  new State(SpriteNum.Poss, 0, 10, Enemy, Enemy.prototype.look, StateNum.PossStnd2, 0, 0),
  // S_POSS_STND2
  new State(SpriteNum.Poss, 1, 10, Enemy, Enemy.prototype.look, StateNum.PossStnd, 0, 0),
  // S_POSS_RUN1
  new State(SpriteNum.Poss, 0, 4, Enemy, Enemy.prototype.chase, StateNum.PossRun2, 0, 0),
  // S_POSS_RUN2
  new State(SpriteNum.Poss, 0, 4, Enemy, Enemy.prototype.chase, StateNum.PossRun3, 0, 0),
  // S_POSS_RUN3
  new State(SpriteNum.Poss, 1, 4, Enemy, Enemy.prototype.chase, StateNum.PossRun4, 0, 0),
  // S_POSS_RUN4
  new State(SpriteNum.Poss, 1, 4, Enemy, Enemy.prototype.chase, StateNum.PossRun5, 0, 0),
  // S_POSS_RUN5
  new State(SpriteNum.Poss, 2, 4, Enemy, Enemy.prototype.chase, StateNum.PossRun6, 0, 0),
  // S_POSS_RUN6
  new State(SpriteNum.Poss, 2, 4, Enemy, Enemy.prototype.chase, StateNum.PossRun7, 0, 0),
  // S_POSS_RUN7
  new State(SpriteNum.Poss, 3, 4, Enemy, Enemy.prototype.chase, StateNum.PossRun8, 0, 0),
  // S_POSS_RUN8
  new State(SpriteNum.Poss, 3, 4, Enemy, Enemy.prototype.chase, StateNum.PossRun1, 0, 0),
  // S_POSS_ATK1
  new State(SpriteNum.Poss, 4, 10, Enemy, Enemy.prototype.faceTarget, StateNum.PossAtk2, 0, 0),
  // S_POSS_ATK2
  new State(SpriteNum.Poss, 5, 8, Enemy, Enemy.prototype.posAttack, StateNum.PossAtk3, 0, 0),
  // S_POSS_ATK3
  new State(SpriteNum.Poss, 4, 8, null, null, StateNum.PossRun1, 0, 0),
  // S_POSS_PAIN
  new State(SpriteNum.Poss, 6, 3, null, null, StateNum.PossPain2, 0, 0),
  // S_POSS_PAIN2
  new State(SpriteNum.Poss, 6, 3, Enemy, Enemy.prototype.pain, StateNum.PossRun1, 0, 0),
  // S_POSS_DIE1
  new State(SpriteNum.Poss, 7, 5, null, null, StateNum.PossDie2, 0, 0),
  // S_POSS_DIE2
  new State(SpriteNum.Poss, 8, 5, Enemy, Enemy.prototype.scream, StateNum.PossDie3, 0, 0),
  // S_POSS_DIE3
  new State(SpriteNum.Poss, 9, 5, Enemy, Enemy.prototype.fall, StateNum.PossDie4, 0, 0),
  // S_POSS_DIE4
  new State(SpriteNum.Poss, 10, 5, null, null, StateNum.PossDie5, 0, 0),
  // S_POSS_DIE5
  new State(SpriteNum.Poss, 11, -1, null, null, StateNum.Null, 0, 0),
  // S_POSS_XDIE1
  new State(SpriteNum.Poss, 12, 5, null, null, StateNum.PossXdie2, 0, 0),
  // S_POSS_XDIE2
  new State(SpriteNum.Poss, 13, 5, Enemy, Enemy.prototype.xScream, StateNum.PossXdie3, 0, 0),
  // S_POSS_XDIE3
  new State(SpriteNum.Poss, 14, 5, Enemy, Enemy.prototype.fall, StateNum.PossXdie4, 0, 0),
  // S_POSS_XDIE4
  new State(SpriteNum.Poss, 15, 5, null, null, StateNum.PossXdie5, 0, 0),
  // S_POSS_XDIE5
  new State(SpriteNum.Poss, 16, 5, null, null, StateNum.PossXdie6, 0, 0),
  // S_POSS_XDIE6
  new State(SpriteNum.Poss, 17, 5, null, null, StateNum.PossXdie7, 0, 0),
  // S_POSS_XDIE7
  new State(SpriteNum.Poss, 18, 5, null, null, StateNum.PossXdie8, 0, 0),
  // S_POSS_XDIE8
  new State(SpriteNum.Poss, 19, 5, null, null, StateNum.PossXdie9, 0, 0),
  // S_POSS_XDIE9
  new State(SpriteNum.Poss, 20, -1, null, null, StateNum.Null, 0, 0),
  // S_POSS_RAISE1
  new State(SpriteNum.Poss, 10, 5, null, null, StateNum.PossRaise2, 0, 0),
  // S_POSS_RAISE2
  new State(SpriteNum.Poss, 9, 5, null, null, StateNum.PossRaise3, 0, 0),
  // S_POSS_RAISE3
  new State(SpriteNum.Poss, 8, 5, null, null, StateNum.PossRaise4, 0, 0),
  // S_POSS_RAISE4
  new State(SpriteNum.Poss, 7, 5, null, null, StateNum.PossRun1, 0, 0),
  // S_SPOS_STND
  new State(SpriteNum.Spos, 0, 10, Enemy, Enemy.prototype.look, StateNum.SposStnd2, 0, 0),
  // S_SPOS_STND2
  new State(SpriteNum.Spos, 1, 10, Enemy, Enemy.prototype.look, StateNum.SposStnd, 0, 0),
  // S_SPOS_RUN1
  new State(SpriteNum.Spos, 0, 3, Enemy, Enemy.prototype.chase, StateNum.SposRun2, 0, 0),
  // S_SPOS_RUN2
  new State(SpriteNum.Spos, 0, 3, Enemy, Enemy.prototype.chase, StateNum.SposRun3, 0, 0),
  // S_SPOS_RUN3
  new State(SpriteNum.Spos, 1, 3, Enemy, Enemy.prototype.chase, StateNum.SposRun4, 0, 0),
  // S_SPOS_RUN4
  new State(SpriteNum.Spos, 1, 3, Enemy, Enemy.prototype.chase, StateNum.SposRun5, 0, 0),
  // S_SPOS_RUN5
  new State(SpriteNum.Spos, 2, 3, Enemy, Enemy.prototype.chase, StateNum.SposRun6, 0, 0),
  // S_SPOS_RUN6
  new State(SpriteNum.Spos, 2, 3, Enemy, Enemy.prototype.chase, StateNum.SposRun7, 0, 0),
  // S_SPOS_RUN7
  new State(SpriteNum.Spos, 3, 3, Enemy, Enemy.prototype.chase, StateNum.SposRun8, 0, 0),
  // S_SPOS_RUN8
  new State(SpriteNum.Spos, 3, 3, Enemy, Enemy.prototype.chase, StateNum.SposRun1, 0, 0),
  // S_SPOS_ATK1
  new State(SpriteNum.Spos, 4, 10, Enemy, Enemy.prototype.faceTarget, StateNum.SposAtk2, 0, 0),
  // S_SPOS_ATK2
  new State(SpriteNum.Spos, 32773, 10, Enemy, Enemy.prototype.sPosAttack, StateNum.SposAtk3, 0, 0),
  // S_SPOS_ATK3
  new State(SpriteNum.Spos, 4, 10, null, null, StateNum.SposRun1, 0, 0),
  // S_SPOS_PAIN
  new State(SpriteNum.Spos, 6, 3, null, null, StateNum.SposPain2, 0, 0),
  // S_SPOS_PAIN2
  new State(SpriteNum.Spos, 6, 3, Enemy, Enemy.prototype.pain, StateNum.SposRun1, 0, 0),
  // S_SPOS_DIE1
  new State(SpriteNum.Spos, 7, 5, null, null, StateNum.SposDie2, 0, 0),
  // S_SPOS_DIE2
  new State(SpriteNum.Spos, 8, 5, Enemy, Enemy.prototype.scream, StateNum.SposDie3, 0, 0),
  // S_SPOS_DIE3
  new State(SpriteNum.Spos, 9, 5, Enemy, Enemy.prototype.fall, StateNum.SposDie4, 0, 0),
  // S_SPOS_DIE4
  new State(SpriteNum.Spos, 10, 5, null, null, StateNum.SposDie5, 0, 0),
  // S_SPOS_DIE5
  new State(SpriteNum.Spos, 11, -1, null, null, StateNum.Null, 0, 0),
  // S_SPOS_XDIE1
  new State(SpriteNum.Spos, 12, 5, null, null, StateNum.SposXdie2, 0, 0),
  // S_SPOS_XDIE2
  new State(SpriteNum.Spos, 13, 5, Enemy, Enemy.prototype.xScream, StateNum.SposXdie3, 0, 0),
  // S_SPOS_XDIE3
  new State(SpriteNum.Spos, 14, 5, Enemy, Enemy.prototype.fall, StateNum.SposXdie4, 0, 0),
  // S_SPOS_XDIE4
  new State(SpriteNum.Spos, 15, 5, null, null, StateNum.SposXdie5, 0, 0),
  // S_SPOS_XDIE5
  new State(SpriteNum.Spos, 16, 5, null, null, StateNum.SposXdie6, 0, 0),
  // S_SPOS_XDIE6
  new State(SpriteNum.Spos, 17, 5, null, null, StateNum.SposXdie7, 0, 0),
  // S_SPOS_XDIE7
  new State(SpriteNum.Spos, 18, 5, null, null, StateNum.SposXdie8, 0, 0),
  // S_SPOS_XDIE8
  new State(SpriteNum.Spos, 19, 5, null, null, StateNum.SposXdie9, 0, 0),
  // S_SPOS_XDIE9
  new State(SpriteNum.Spos, 20, -1, null, null, StateNum.Null, 0, 0),
  // S_SPOS_RAISE1
  new State(SpriteNum.Spos, 11, 5, null, null, StateNum.SposRaise2, 0, 0),
  // S_SPOS_RAISE2
  new State(SpriteNum.Spos, 10, 5, null, null, StateNum.SposRaise3, 0, 0),
  // S_SPOS_RAISE3
  new State(SpriteNum.Spos, 9, 5, null, null, StateNum.SposRaise4, 0, 0),
  // S_SPOS_RAISE4
  new State(SpriteNum.Spos, 8, 5, null, null, StateNum.SposRaise5, 0, 0),
  // S_SPOS_RAISE5
  new State(SpriteNum.Spos, 7, 5, null, null, StateNum.SposRun1, 0, 0),
  // S_VILE_STND
  new State(SpriteNum.Vile, 0, 10, Enemy, Enemy.prototype.look, StateNum.VileStnd2, 0, 0),
  // S_VILE_STND2
  new State(SpriteNum.Vile, 1, 10, Enemy, Enemy.prototype.look, StateNum.VileStnd, 0, 0),
  // S_VILE_RUN1
  new State(SpriteNum.Vile, 0, 2, Enemy, Enemy.prototype.vileChase, StateNum.VileRun2, 0, 0),
  // S_VILE_RUN2
  new State(SpriteNum.Vile, 0, 2, Enemy, Enemy.prototype.vileChase, StateNum.VileRun3, 0, 0),
  // S_VILE_RUN3
  new State(SpriteNum.Vile, 1, 2, Enemy, Enemy.prototype.vileChase, StateNum.VileRun4, 0, 0),
  // S_VILE_RUN4
  new State(SpriteNum.Vile, 1, 2, Enemy, Enemy.prototype.vileChase, StateNum.VileRun5, 0, 0),
  // S_VILE_RUN5
  new State(SpriteNum.Vile, 2, 2, Enemy, Enemy.prototype.vileChase, StateNum.VileRun6, 0, 0),
  // S_VILE_RUN6
  new State(SpriteNum.Vile, 2, 2, Enemy, Enemy.prototype.vileChase, StateNum.VileRun7, 0, 0),
  // S_VILE_RUN7
  new State(SpriteNum.Vile, 3, 2, Enemy, Enemy.prototype.vileChase, StateNum.VileRun8, 0, 0),
  // S_VILE_RUN8
  new State(SpriteNum.Vile, 3, 2, Enemy, Enemy.prototype.vileChase, StateNum.VileRun9, 0, 0),
  // S_VILE_RUN9
  new State(SpriteNum.Vile, 4, 2, Enemy, Enemy.prototype.vileChase, StateNum.VileRun10, 0, 0),
  // S_VILE_RUN10
  new State(SpriteNum.Vile, 4, 2, Enemy, Enemy.prototype.vileChase, StateNum.VileRun11, 0, 0),
  // S_VILE_RUN11
  new State(SpriteNum.Vile, 5, 2, Enemy, Enemy.prototype.vileChase, StateNum.VileRun12, 0, 0),
  // S_VILE_RUN12
  new State(SpriteNum.Vile, 5, 2, Enemy, Enemy.prototype.vileChase, StateNum.VileRun1, 0, 0),
  // S_VILE_ATK1
  new State(SpriteNum.Vile, 32774, 0, Enemy, Enemy.prototype.vileStart, StateNum.VileAtk2, 0, 0),
  // S_VILE_ATK2
  new State(SpriteNum.Vile, 32774, 10, Enemy, Enemy.prototype.faceTarget, StateNum.VileAtk3, 0, 0),
  // S_VILE_ATK3
  new State(SpriteNum.Vile, 32775, 8, Enemy, Enemy.prototype.vileTarget, StateNum.VileAtk4, 0, 0),
  // S_VILE_ATK4
  new State(SpriteNum.Vile, 32776, 8, Enemy, Enemy.prototype.faceTarget, StateNum.VileAtk5, 0, 0),
  // S_VILE_ATK5
  new State(SpriteNum.Vile, 32777, 8, Enemy, Enemy.prototype.faceTarget, StateNum.VileAtk6, 0, 0),
  // S_VILE_ATK6
  new State(SpriteNum.Vile, 32778, 8, Enemy, Enemy.prototype.faceTarget, StateNum.VileAtk7, 0, 0),
  // S_VILE_ATK7
  new State(SpriteNum.Vile, 32779, 8, Enemy, Enemy.prototype.faceTarget, StateNum.VileAtk8, 0, 0),
  // S_VILE_ATK8
  new State(SpriteNum.Vile, 32780, 8, Enemy, Enemy.prototype.faceTarget, StateNum.VileAtk9, 0, 0),
  // S_VILE_ATK9
  new State(SpriteNum.Vile, 32781, 8, Enemy, Enemy.prototype.faceTarget, StateNum.VileAtk10, 0, 0),
  // S_VILE_ATK10
  new State(SpriteNum.Vile, 32782, 8, Enemy, Enemy.prototype.vileAttack, StateNum.VileAtk11, 0, 0),
  // S_VILE_ATK11
  new State(SpriteNum.Vile, 32783, 20, null, null, StateNum.VileRun1, 0, 0),
  // S_VILE_HEAL1
  new State(SpriteNum.Vile, 32794, 10, null, null, StateNum.VileHeal2, 0, 0),
  // S_VILE_HEAL2
  new State(SpriteNum.Vile, 32795, 10, null, null, StateNum.VileHeal3, 0, 0),
  // S_VILE_HEAL3
  new State(SpriteNum.Vile, 32796, 10, null, null, StateNum.VileRun1, 0, 0),
  // S_VILE_PAIN
  new State(SpriteNum.Vile, 16, 5, null, null, StateNum.VilePain2, 0, 0),
  // S_VILE_PAIN2
  new State(SpriteNum.Vile, 16, 5, Enemy, Enemy.prototype.pain, StateNum.VileRun1, 0, 0),
  // S_VILE_DIE1
  new State(SpriteNum.Vile, 16, 7, null, null, StateNum.VileDie2, 0, 0),
  // S_VILE_DIE2
  new State(SpriteNum.Vile, 17, 7, Enemy, Enemy.prototype.scream, StateNum.VileDie3, 0, 0),
  // S_VILE_DIE3
  new State(SpriteNum.Vile, 18, 7, Enemy, Enemy.prototype.fall, StateNum.VileDie4, 0, 0),
  // S_VILE_DIE4
  new State(SpriteNum.Vile, 19, 7, null, null, StateNum.VileDie5, 0, 0),
  // S_VILE_DIE5
  new State(SpriteNum.Vile, 20, 7, null, null, StateNum.VileDie6, 0, 0),
  // S_VILE_DIE6
  new State(SpriteNum.Vile, 21, 7, null, null, StateNum.VileDie7, 0, 0),
  // S_VILE_DIE7
  new State(SpriteNum.Vile, 22, 7, null, null, StateNum.VileDie8, 0, 0),
  // S_VILE_DIE8
  new State(SpriteNum.Vile, 23, 5, null, null, StateNum.VileDie9, 0, 0),
  // S_VILE_DIE9
  new State(SpriteNum.Vile, 24, 5, null, null, StateNum.VileDie10, 0, 0),
  // S_VILE_DIE10
  new State(SpriteNum.Vile, 25, -1, null, null, StateNum.Null, 0, 0),
  // S_FIRE1
  new State(SpriteNum.Fire, 32768, 2, Enemy, Enemy.prototype.startFire, StateNum.Fire2, 0, 0),
  // S_FIRE2
  new State(SpriteNum.Fire, 32769, 2, Enemy, Enemy.prototype.fire, StateNum.Fire3, 0, 0),
  // S_FIRE3
  new State(SpriteNum.Fire, 32768, 2, Enemy, Enemy.prototype.fire, StateNum.Fire4, 0, 0),
  // S_FIRE4
  new State(SpriteNum.Fire, 32769, 2, Enemy, Enemy.prototype.fire, StateNum.Fire5, 0, 0),
  // S_FIRE5
  new State(SpriteNum.Fire, 32770, 2, Enemy, Enemy.prototype.fireCrackle, StateNum.Fire6, 0, 0),
  // S_FIRE6
  new State(SpriteNum.Fire, 32769, 2, Enemy, Enemy.prototype.fire, StateNum.Fire7, 0, 0),
  // S_FIRE7
  new State(SpriteNum.Fire, 32770, 2, Enemy, Enemy.prototype.fire, StateNum.Fire8, 0, 0),
  // S_FIRE8
  new State(SpriteNum.Fire, 32769, 2, Enemy, Enemy.prototype.fire, StateNum.Fire9, 0, 0),
  // S_FIRE9
  new State(SpriteNum.Fire, 32770, 2, Enemy, Enemy.prototype.fire, StateNum.Fire10, 0, 0),
  // S_FIRE10
  new State(SpriteNum.Fire, 32771, 2, Enemy, Enemy.prototype.fire, StateNum.Fire11, 0, 0),
  // S_FIRE11
  new State(SpriteNum.Fire, 32770, 2, Enemy, Enemy.prototype.fire, StateNum.Fire12, 0, 0),
  // S_FIRE12
  new State(SpriteNum.Fire, 32771, 2, Enemy, Enemy.prototype.fire, StateNum.Fire13, 0, 0),
  // S_FIRE13
  new State(SpriteNum.Fire, 32770, 2, Enemy, Enemy.prototype.fire, StateNum.Fire14, 0, 0),
  // S_FIRE14
  new State(SpriteNum.Fire, 32771, 2, Enemy, Enemy.prototype.fire, StateNum.Fire15, 0, 0),
  // S_FIRE15
  new State(SpriteNum.Fire, 32772, 2, Enemy, Enemy.prototype.fire, StateNum.Fire16, 0, 0),
  // S_FIRE16
  new State(SpriteNum.Fire, 32771, 2, Enemy, Enemy.prototype.fire, StateNum.Fire17, 0, 0),
  // S_FIRE17
  new State(SpriteNum.Fire, 32772, 2, Enemy, Enemy.prototype.fire, StateNum.Fire18, 0, 0),
  // S_FIRE18
  new State(SpriteNum.Fire, 32771, 2, Enemy, Enemy.prototype.fire, StateNum.Fire19, 0, 0),
  // S_FIRE19
  new State(SpriteNum.Fire, 32772, 2, Enemy, Enemy.prototype.fireCrackle, StateNum.Fire20, 0, 0),
  // S_FIRE20
  new State(SpriteNum.Fire, 32773, 2, Enemy, Enemy.prototype.fire, StateNum.Fire21, 0, 0),
  // S_FIRE21
  new State(SpriteNum.Fire, 32772, 2, Enemy, Enemy.prototype.fire, StateNum.Fire22, 0, 0),
  // S_FIRE22
  new State(SpriteNum.Fire, 32773, 2, Enemy, Enemy.prototype.fire, StateNum.Fire23, 0, 0),
  // S_FIRE23
  new State(SpriteNum.Fire, 32772, 2, Enemy, Enemy.prototype.fire, StateNum.Fire24, 0, 0),
  // S_FIRE24
  new State(SpriteNum.Fire, 32773, 2, Enemy, Enemy.prototype.fire, StateNum.Fire25, 0, 0),
  // S_FIRE25
  new State(SpriteNum.Fire, 32774, 2, Enemy, Enemy.prototype.fire, StateNum.Fire26, 0, 0),
  // S_FIRE26
  new State(SpriteNum.Fire, 32775, 2, Enemy, Enemy.prototype.fire, StateNum.Fire27, 0, 0),
  // S_FIRE27
  new State(SpriteNum.Fire, 32774, 2, Enemy, Enemy.prototype.fire, StateNum.Fire28, 0, 0),
  // S_FIRE28
  new State(SpriteNum.Fire, 32775, 2, Enemy, Enemy.prototype.fire, StateNum.Fire29, 0, 0),
  // S_FIRE29
  new State(SpriteNum.Fire, 32774, 2, Enemy, Enemy.prototype.fire, StateNum.Fire30, 0, 0),
  // S_FIRE30
  new State(SpriteNum.Fire, 32775, 2, Enemy, Enemy.prototype.fire, StateNum.Null, 0, 0),
  // S_SMOKE1
  new State(SpriteNum.Puff, 1, 4, null, null, StateNum.Smoke2, 0, 0),
  // S_SMOKE2
  new State(SpriteNum.Puff, 2, 4, null, null, StateNum.Smoke3, 0, 0),
  // S_SMOKE3
  new State(SpriteNum.Puff, 1, 4, null, null, StateNum.Smoke4, 0, 0),
  // S_SMOKE4
  new State(SpriteNum.Puff, 2, 4, null, null, StateNum.Smoke5, 0, 0),
  // S_SMOKE5
  new State(SpriteNum.Puff, 3, 4, null, null, StateNum.Null, 0, 0),
  // S_TRACER
  new State(SpriteNum.Fatb, 32768, 2, Enemy, Enemy.prototype.tracer, StateNum.Tracer2, 0, 0),
  // S_TRACER2
  new State(SpriteNum.Fatb, 32769, 2, Enemy, Enemy.prototype.tracer, StateNum.Tracer, 0, 0),
  // S_TRACEEXP1
  new State(SpriteNum.Fbxp, 32768, 8, null, null, StateNum.Traceexp2, 0, 0),
  // S_TRACEEXP2
  new State(SpriteNum.Fbxp, 32769, 6, null, null, StateNum.Traceexp3, 0, 0),
  // S_TRACEEXP3
  new State(SpriteNum.Fbxp, 32770, 4, null, null, StateNum.Null, 0, 0),
  // S_SKEL_STND
  new State(SpriteNum.Skel, 0, 10, Enemy, Enemy.prototype.look, StateNum.SkelStnd2, 0, 0),
  // S_SKEL_STND2
  new State(SpriteNum.Skel, 1, 10, Enemy, Enemy.prototype.look, StateNum.SkelStnd, 0, 0),
  // S_SKEL_RUN1
  new State(SpriteNum.Skel, 0, 2, Enemy, Enemy.prototype.chase, StateNum.SkelRun2, 0, 0),
  // S_SKEL_RUN2
  new State(SpriteNum.Skel, 0, 2, Enemy, Enemy.prototype.chase, StateNum.SkelRun3, 0, 0),
  // S_SKEL_RUN3
  new State(SpriteNum.Skel, 1, 2, Enemy, Enemy.prototype.chase, StateNum.SkelRun4, 0, 0),
  // S_SKEL_RUN4
  new State(SpriteNum.Skel, 1, 2, Enemy, Enemy.prototype.chase, StateNum.SkelRun5, 0, 0),
  // S_SKEL_RUN5
  new State(SpriteNum.Skel, 2, 2, Enemy, Enemy.prototype.chase, StateNum.SkelRun6, 0, 0),
  // S_SKEL_RUN6
  new State(SpriteNum.Skel, 2, 2, Enemy, Enemy.prototype.chase, StateNum.SkelRun7, 0, 0),
  // S_SKEL_RUN7
  new State(SpriteNum.Skel, 3, 2, Enemy, Enemy.prototype.chase, StateNum.SkelRun8, 0, 0),
  // S_SKEL_RUN8
  new State(SpriteNum.Skel, 3, 2, Enemy, Enemy.prototype.chase, StateNum.SkelRun9, 0, 0),
  // S_SKEL_RUN9
  new State(SpriteNum.Skel, 4, 2, Enemy, Enemy.prototype.chase, StateNum.SkelRun10, 0, 0),
  // S_SKEL_RUN10
  new State(SpriteNum.Skel, 4, 2, Enemy, Enemy.prototype.chase, StateNum.SkelRun11, 0, 0),
  // S_SKEL_RUN11
  new State(SpriteNum.Skel, 5, 2, Enemy, Enemy.prototype.chase, StateNum.SkelRun12, 0, 0),
  // S_SKEL_RUN12
  new State(SpriteNum.Skel, 5, 2, Enemy, Enemy.prototype.chase, StateNum.SkelRun1, 0, 0),
  // S_SKEL_FIST1
  new State(SpriteNum.Skel, 6, 0, Enemy, Enemy.prototype.faceTarget, StateNum.SkelFist2, 0, 0),
  // S_SKEL_FIST2
  new State(SpriteNum.Skel, 6, 6, Enemy, Enemy.prototype.skelWhoosh, StateNum.SkelFist3, 0, 0),
  // S_SKEL_FIST3
  new State(SpriteNum.Skel, 7, 6, Enemy, Enemy.prototype.faceTarget, StateNum.SkelFist4, 0, 0),
  // S_SKEL_FIST4
  new State(SpriteNum.Skel, 8, 6, Enemy, Enemy.prototype.skelFist, StateNum.SkelRun1, 0, 0),
  // S_SKEL_MISS1
  new State(SpriteNum.Skel, 32777, 0, Enemy, Enemy.prototype.faceTarget, StateNum.SkelMiss2, 0, 0),
  // S_SKEL_MISS2
  new State(SpriteNum.Skel, 32777, 10, Enemy, Enemy.prototype.faceTarget, StateNum.SkelMiss3, 0, 0),
  // S_SKEL_MISS3
  new State(SpriteNum.Skel, 10, 10, Enemy, Enemy.prototype.skelMissile, StateNum.SkelMiss4, 0, 0),
  // S_SKEL_MISS4
  new State(SpriteNum.Skel, 10, 10, Enemy, Enemy.prototype.faceTarget, StateNum.SkelRun1, 0, 0),
  // S_SKEL_PAIN
  new State(SpriteNum.Skel, 11, 5, null, null, StateNum.SkelPain2, 0, 0),
  // S_SKEL_PAIN2
  new State(SpriteNum.Skel, 11, 5, Enemy, Enemy.prototype.pain, StateNum.SkelRun1, 0, 0),
  // S_SKEL_DIE1
  new State(SpriteNum.Skel, 11, 7, null, null, StateNum.SkelDie2, 0, 0),
  // S_SKEL_DIE2
  new State(SpriteNum.Skel, 12, 7, null, null, StateNum.SkelDie3, 0, 0),
  // S_SKEL_DIE3
  new State(SpriteNum.Skel, 13, 7, Enemy, Enemy.prototype.scream, StateNum.SkelDie4, 0, 0),
  // S_SKEL_DIE4
  new State(SpriteNum.Skel, 14, 7, Enemy, Enemy.prototype.fall, StateNum.SkelDie5, 0, 0),
  // S_SKEL_DIE5
  new State(SpriteNum.Skel, 15, 7, null, null, StateNum.SkelDie6, 0, 0),
  // S_SKEL_DIE6
  new State(SpriteNum.Skel, 16, -1, null, null, StateNum.Null, 0, 0),
  // S_SKEL_RAISE1
  new State(SpriteNum.Skel, 16, 5, null, null, StateNum.SkelRaise2, 0, 0),
  // S_SKEL_RAISE2
  new State(SpriteNum.Skel, 15, 5, null, null, StateNum.SkelRaise3, 0, 0),
  // S_SKEL_RAISE3
  new State(SpriteNum.Skel, 14, 5, null, null, StateNum.SkelRaise4, 0, 0),
  // S_SKEL_RAISE4
  new State(SpriteNum.Skel, 13, 5, null, null, StateNum.SkelRaise5, 0, 0),
  // S_SKEL_RAISE5
  new State(SpriteNum.Skel, 12, 5, null, null, StateNum.SkelRaise6, 0, 0),
  // S_SKEL_RAISE6
  new State(SpriteNum.Skel, 11, 5, null, null, StateNum.SkelRun1, 0, 0),
  // S_FATSHOT1
  new State(SpriteNum.Manf, 32768, 4, null, null, StateNum.Fatshot2, 0, 0),
  // S_FATSHOT2
  new State(SpriteNum.Manf, 32769, 4, null, null, StateNum.Fatshot1, 0, 0),
  // S_FATSHOTX1
  new State(SpriteNum.Misl, 32769, 8, null, null, StateNum.Fatshotx2, 0, 0),
  // S_FATSHOTX2
  new State(SpriteNum.Misl, 32770, 6, null, null, StateNum.Fatshotx3, 0, 0),
  // S_FATSHOTX3
  new State(SpriteNum.Misl, 32771, 4, null, null, StateNum.Null, 0, 0),
  // S_FATT_STND
  new State(SpriteNum.Fatt, 0, 15, Enemy, Enemy.prototype.look, StateNum.FattStnd2, 0, 0),
  // S_FATT_STND2
  new State(SpriteNum.Fatt, 1, 15, Enemy, Enemy.prototype.look, StateNum.FattStnd, 0, 0),
  // S_FATT_RUN1
  new State(SpriteNum.Fatt, 0, 4, Enemy, Enemy.prototype.chase, StateNum.FattRun2, 0, 0),
  // S_FATT_RUN2
  new State(SpriteNum.Fatt, 0, 4, Enemy, Enemy.prototype.chase, StateNum.FattRun3, 0, 0),
  // S_FATT_RUN3
  new State(SpriteNum.Fatt, 1, 4, Enemy, Enemy.prototype.chase, StateNum.FattRun4, 0, 0),
  // S_FATT_RUN4
  new State(SpriteNum.Fatt, 1, 4, Enemy, Enemy.prototype.chase, StateNum.FattRun5, 0, 0),
  // S_FATT_RUN5
  new State(SpriteNum.Fatt, 2, 4, Enemy, Enemy.prototype.chase, StateNum.FattRun6, 0, 0),
  // S_FATT_RUN6
  new State(SpriteNum.Fatt, 2, 4, Enemy, Enemy.prototype.chase, StateNum.FattRun7, 0, 0),
  // S_FATT_RUN7
  new State(SpriteNum.Fatt, 3, 4, Enemy, Enemy.prototype.chase, StateNum.FattRun8, 0, 0),
  // S_FATT_RUN8
  new State(SpriteNum.Fatt, 3, 4, Enemy, Enemy.prototype.chase, StateNum.FattRun9, 0, 0),
  // S_FATT_RUN9
  new State(SpriteNum.Fatt, 4, 4, Enemy, Enemy.prototype.chase, StateNum.FattRun10, 0, 0),
  // S_FATT_RUN10
  new State(SpriteNum.Fatt, 4, 4, Enemy, Enemy.prototype.chase, StateNum.FattRun11, 0, 0),
  // S_FATT_RUN11
  new State(SpriteNum.Fatt, 5, 4, Enemy, Enemy.prototype.chase, StateNum.FattRun12, 0, 0),
  // S_FATT_RUN12
  new State(SpriteNum.Fatt, 5, 4, Enemy, Enemy.prototype.chase, StateNum.FattRun1, 0, 0),
  // S_FATT_ATK1
  new State(SpriteNum.Fatt, 6, 20, Enemy, Enemy.prototype.fatRaise, StateNum.FattAtk2, 0, 0),
  // S_FATT_ATK2
  new State(SpriteNum.Fatt, 32775, 10, Enemy, Enemy.prototype.fatAttack1, StateNum.FattAtk3, 0, 0),
  // S_FATT_ATK3
  new State(SpriteNum.Fatt, 8, 5, Enemy, Enemy.prototype.faceTarget, StateNum.FattAtk4, 0, 0),
  // S_FATT_ATK4
  new State(SpriteNum.Fatt, 6, 5, Enemy, Enemy.prototype.faceTarget, StateNum.FattAtk5, 0, 0),
  // S_FATT_ATK5
  new State(SpriteNum.Fatt, 32775, 10, Enemy, Enemy.prototype.fatAttack2, StateNum.FattAtk6, 0, 0),
  // S_FATT_ATK6
  new State(SpriteNum.Fatt, 8, 5, Enemy, Enemy.prototype.faceTarget, StateNum.FattAtk7, 0, 0),
  // S_FATT_ATK7
  new State(SpriteNum.Fatt, 6, 5, Enemy, Enemy.prototype.faceTarget, StateNum.FattAtk8, 0, 0),
  // S_FATT_ATK8
  new State(SpriteNum.Fatt, 32775, 10, Enemy, Enemy.prototype.fatAttack3, StateNum.FattAtk9, 0, 0),
  // S_FATT_ATK9
  new State(SpriteNum.Fatt, 8, 5, Enemy, Enemy.prototype.faceTarget, StateNum.FattAtk10, 0, 0),
  // S_FATT_ATK10
  new State(SpriteNum.Fatt, 6, 5, Enemy, Enemy.prototype.faceTarget, StateNum.FattRun1, 0, 0),
  // S_FATT_PAIN
  new State(SpriteNum.Fatt, 9, 3, null, null, StateNum.FattPain2, 0, 0),
  // S_FATT_PAIN2
  new State(SpriteNum.Fatt, 9, 3, Enemy, Enemy.prototype.pain, StateNum.FattRun1, 0, 0),
  // S_FATT_DIE1
  new State(SpriteNum.Fatt, 10, 6, null, null, StateNum.FattDie2, 0, 0),
  // S_FATT_DIE2
  new State(SpriteNum.Fatt, 11, 6, Enemy, Enemy.prototype.scream, StateNum.FattDie3, 0, 0),
  // S_FATT_DIE3
  new State(SpriteNum.Fatt, 12, 6, Enemy, Enemy.prototype.fall, StateNum.FattDie4, 0, 0),
  // S_FATT_DIE4
  new State(SpriteNum.Fatt, 13, 6, null, null, StateNum.FattDie5, 0, 0),
  // S_FATT_DIE5
  new State(SpriteNum.Fatt, 14, 6, null, null, StateNum.FattDie6, 0, 0),
  // S_FATT_DIE6
  new State(SpriteNum.Fatt, 15, 6, null, null, StateNum.FattDie7, 0, 0),
  // S_FATT_DIE7
  new State(SpriteNum.Fatt, 16, 6, null, null, StateNum.FattDie8, 0, 0),
  // S_FATT_DIE8
  new State(SpriteNum.Fatt, 17, 6, null, null, StateNum.FattDie9, 0, 0),
  // S_FATT_DIE9
  new State(SpriteNum.Fatt, 18, 6, null, null, StateNum.FattDie10, 0, 0),
  // S_FATT_DIE10
  new State(SpriteNum.Fatt, 19, -1, Enemy, Enemy.prototype.bossDeath, StateNum.Null, 0, 0),
  // S_FATT_RAISE1
  new State(SpriteNum.Fatt, 17, 5, null, null, StateNum.FattRaise2, 0, 0),
  // S_FATT_RAISE2
  new State(SpriteNum.Fatt, 16, 5, null, null, StateNum.FattRaise3, 0, 0),
  // S_FATT_RAISE3
  new State(SpriteNum.Fatt, 15, 5, null, null, StateNum.FattRaise4, 0, 0),
  // S_FATT_RAISE4
  new State(SpriteNum.Fatt, 14, 5, null, null, StateNum.FattRaise5, 0, 0),
  // S_FATT_RAISE5
  new State(SpriteNum.Fatt, 13, 5, null, null, StateNum.FattRaise6, 0, 0),
  // S_FATT_RAISE6
  new State(SpriteNum.Fatt, 12, 5, null, null, StateNum.FattRaise7, 0, 0),
  // S_FATT_RAISE7
  new State(SpriteNum.Fatt, 11, 5, null, null, StateNum.FattRaise8, 0, 0),
  // S_FATT_RAISE8
  new State(SpriteNum.Fatt, 10, 5, null, null, StateNum.FattRun1, 0, 0),
  // S_CPOS_STND
  new State(SpriteNum.Cpos, 0, 10, Enemy, Enemy.prototype.look, StateNum.CposStnd2, 0, 0),
  // S_CPOS_STND2
  new State(SpriteNum.Cpos, 1, 10, Enemy, Enemy.prototype.look, StateNum.CposStnd, 0, 0),
  // S_CPOS_RUN1
  new State(SpriteNum.Cpos, 0, 3, Enemy, Enemy.prototype.chase, StateNum.CposRun2, 0, 0),
  // S_CPOS_RUN2
  new State(SpriteNum.Cpos, 0, 3, Enemy, Enemy.prototype.chase, StateNum.CposRun3, 0, 0),
  // S_CPOS_RUN3
  new State(SpriteNum.Cpos, 1, 3, Enemy, Enemy.prototype.chase, StateNum.CposRun4, 0, 0),
  // S_CPOS_RUN4
  new State(SpriteNum.Cpos, 1, 3, Enemy, Enemy.prototype.chase, StateNum.CposRun5, 0, 0),
  // S_CPOS_RUN5
  new State(SpriteNum.Cpos, 2, 3, Enemy, Enemy.prototype.chase, StateNum.CposRun6, 0, 0),
  // S_CPOS_RUN6
  new State(SpriteNum.Cpos, 2, 3, Enemy, Enemy.prototype.chase, StateNum.CposRun7, 0, 0),
  // S_CPOS_RUN7
  new State(SpriteNum.Cpos, 3, 3, Enemy, Enemy.prototype.chase, StateNum.CposRun8, 0, 0),
  // S_CPOS_RUN8
  new State(SpriteNum.Cpos, 3, 3, Enemy, Enemy.prototype.chase, StateNum.CposRun1, 0, 0),
  // S_CPOS_ATK1
  new State(SpriteNum.Cpos, 4, 10, Enemy, Enemy.prototype.faceTarget, StateNum.CposAtk2, 0, 0),
  // S_CPOS_ATK2
  new State(SpriteNum.Cpos, 32773, 4, Enemy, Enemy.prototype.cPosAttack, StateNum.CposAtk3, 0, 0),
  // S_CPOS_ATK3
  new State(SpriteNum.Cpos, 32772, 4, Enemy, Enemy.prototype.cPosAttack, StateNum.CposAtk4, 0, 0),
  // S_CPOS_ATK4
  new State(SpriteNum.Cpos, 5, 1, Enemy, Enemy.prototype.cPosRefire, StateNum.CposAtk2, 0, 0),
  // S_CPOS_PAIN
  new State(SpriteNum.Cpos, 6, 3, null, null, StateNum.CposPain2, 0, 0),
  // S_CPOS_PAIN2
  new State(SpriteNum.Cpos, 6, 3, Enemy, Enemy.prototype.pain, StateNum.CposRun1, 0, 0),
  // S_CPOS_DIE1
  new State(SpriteNum.Cpos, 7, 5, null, null, StateNum.CposDie2, 0, 0),
  // S_CPOS_DIE2
  new State(SpriteNum.Cpos, 8, 5, Enemy, Enemy.prototype.scream, StateNum.CposDie3, 0, 0),
  // S_CPOS_DIE3
  new State(SpriteNum.Cpos, 9, 5, Enemy, Enemy.prototype.fall, StateNum.CposDie4, 0, 0),
  // S_CPOS_DIE4
  new State(SpriteNum.Cpos, 10, 5, null, null, StateNum.CposDie5, 0, 0),
  // S_CPOS_DIE5
  new State(SpriteNum.Cpos, 11, 5, null, null, StateNum.CposDie6, 0, 0),
  // S_CPOS_DIE6
  new State(SpriteNum.Cpos, 12, 5, null, null, StateNum.CposDie7, 0, 0),
  // S_CPOS_DIE7
  new State(SpriteNum.Cpos, 13, -1, null, null, StateNum.Null, 0, 0),
  // S_CPOS_XDIE1
  new State(SpriteNum.Cpos, 14, 5, null, null, StateNum.CposXdie2, 0, 0),
  // S_CPOS_XDIE2
  new State(SpriteNum.Cpos, 15, 5, Enemy, Enemy.prototype.xScream, StateNum.CposXdie3, 0, 0),
  // S_CPOS_XDIE3
  new State(SpriteNum.Cpos, 16, 5, Enemy, Enemy.prototype.fall, StateNum.CposXdie4, 0, 0),
  // S_CPOS_XDIE4
  new State(SpriteNum.Cpos, 17, 5, null, null, StateNum.CposXdie5, 0, 0),
  // S_CPOS_XDIE5
  new State(SpriteNum.Cpos, 18, 5, null, null, StateNum.CposXdie6, 0, 0),
  // S_CPOS_XDIE6
  new State(SpriteNum.Cpos, 19, -1, null, null, StateNum.Null, 0, 0),
  // S_CPOS_RAISE1
  new State(SpriteNum.Cpos, 13, 5, null, null, StateNum.CposRaise2, 0, 0),
  // S_CPOS_RAISE2
  new State(SpriteNum.Cpos, 12, 5, null, null, StateNum.CposRaise3, 0, 0),
  // S_CPOS_RAISE3
  new State(SpriteNum.Cpos, 11, 5, null, null, StateNum.CposRaise4, 0, 0),
  // S_CPOS_RAISE4
  new State(SpriteNum.Cpos, 10, 5, null, null, StateNum.CposRaise5, 0, 0),
  // S_CPOS_RAISE5
  new State(SpriteNum.Cpos, 9, 5, null, null, StateNum.CposRaise6, 0, 0),
  // S_CPOS_RAISE6
  new State(SpriteNum.Cpos, 8, 5, null, null, StateNum.CposRaise7, 0, 0),
  // S_CPOS_RAISE7
  new State(SpriteNum.Cpos, 7, 5, null, null, StateNum.CposRun1, 0, 0),
  // S_TROO_STND
  new State(SpriteNum.Troo, 0, 10, Enemy, Enemy.prototype.look, StateNum.TrooStnd2, 0, 0),
  // S_TROO_STND2
  new State(SpriteNum.Troo, 1, 10, Enemy, Enemy.prototype.look, StateNum.TrooStnd, 0, 0),
  // S_TROO_RUN1
  new State(SpriteNum.Troo, 0, 3, Enemy, Enemy.prototype.chase, StateNum.TrooRun2, 0, 0),
  // S_TROO_RUN2
  new State(SpriteNum.Troo, 0, 3, Enemy, Enemy.prototype.chase, StateNum.TrooRun3, 0, 0),
  // S_TROO_RUN3
  new State(SpriteNum.Troo, 1, 3, Enemy, Enemy.prototype.chase, StateNum.TrooRun4, 0, 0),
  // S_TROO_RUN4
  new State(SpriteNum.Troo, 1, 3, Enemy, Enemy.prototype.chase, StateNum.TrooRun5, 0, 0),
  // S_TROO_RUN5
  new State(SpriteNum.Troo, 2, 3, Enemy, Enemy.prototype.chase, StateNum.TrooRun6, 0, 0),
  // S_TROO_RUN6
  new State(SpriteNum.Troo, 2, 3, Enemy, Enemy.prototype.chase, StateNum.TrooRun7, 0, 0),
  // S_TROO_RUN7
  new State(SpriteNum.Troo, 3, 3, Enemy, Enemy.prototype.chase, StateNum.TrooRun8, 0, 0),
  // S_TROO_RUN8
  new State(SpriteNum.Troo, 3, 3, Enemy, Enemy.prototype.chase, StateNum.TrooRun1, 0, 0),
  // S_TROO_ATK1
  new State(SpriteNum.Troo, 4, 8, Enemy, Enemy.prototype.faceTarget, StateNum.TrooAtk2, 0, 0),
  // S_TROO_ATK2
  new State(SpriteNum.Troo, 5, 8, Enemy, Enemy.prototype.faceTarget, StateNum.TrooAtk3, 0, 0),
  // S_TROO_ATK3
  new State(SpriteNum.Troo, 6, 6, Enemy, Enemy.prototype.troopAttack, StateNum.TrooRun1, 0, 0),
  // S_TROO_PAIN
  new State(SpriteNum.Troo, 7, 2, null, null, StateNum.TrooPain2, 0, 0),
  // S_TROO_PAIN2
  new State(SpriteNum.Troo, 7, 2, Enemy, Enemy.prototype.pain, StateNum.TrooRun1, 0, 0),
  // S_TROO_DIE1
  new State(SpriteNum.Troo, 8, 8, null, null, StateNum.TrooDie2, 0, 0),
  // S_TROO_DIE2
  new State(SpriteNum.Troo, 9, 8, Enemy, Enemy.prototype.scream, StateNum.TrooDie3, 0, 0),
  // S_TROO_DIE3
  new State(SpriteNum.Troo, 10, 6, null, null, StateNum.TrooDie4, 0, 0),
  // S_TROO_DIE4
  new State(SpriteNum.Troo, 11, 6, Enemy, Enemy.prototype.fall, StateNum.TrooDie5, 0, 0),
  // S_TROO_DIE5
  new State(SpriteNum.Troo, 12, -1, null, null, StateNum.Null, 0, 0),
  // S_TROO_XDIE1
  new State(SpriteNum.Troo, 13, 5, null, null, StateNum.TrooXdie2, 0, 0),
  // S_TROO_XDIE2
  new State(SpriteNum.Troo, 14, 5, Enemy, Enemy.prototype.xScream, StateNum.TrooXdie3, 0, 0),
  // S_TROO_XDIE3
  new State(SpriteNum.Troo, 15, 5, null, null, StateNum.TrooXdie4, 0, 0),
  // S_TROO_XDIE4
  new State(SpriteNum.Troo, 16, 5, Enemy, Enemy.prototype.fall, StateNum.TrooXdie5, 0, 0),
  // S_TROO_XDIE5
  new State(SpriteNum.Troo, 17, 5, null, null, StateNum.TrooXdie6, 0, 0),
  // S_TROO_XDIE6
  new State(SpriteNum.Troo, 18, 5, null, null, StateNum.TrooXdie7, 0, 0),
  // S_TROO_XDIE7
  new State(SpriteNum.Troo, 19, 5, null, null, StateNum.TrooXdie8, 0, 0),
  // S_TROO_XDIE8
  new State(SpriteNum.Troo, 20, -1, null, null, StateNum.Null, 0, 0),
  // S_TROO_RAISE1
  new State(SpriteNum.Troo, 12, 8, null, null, StateNum.TrooRaise2, 0, 0),
  // S_TROO_RAISE2
  new State(SpriteNum.Troo, 11, 8, null, null, StateNum.TrooRaise3, 0, 0),
  // S_TROO_RAISE3
  new State(SpriteNum.Troo, 10, 6, null, null, StateNum.TrooRaise4, 0, 0),
  // S_TROO_RAISE4
  new State(SpriteNum.Troo, 9, 6, null, null, StateNum.TrooRaise5, 0, 0),
  // S_TROO_RAISE5
  new State(SpriteNum.Troo, 8, 6, null, null, StateNum.TrooRun1, 0, 0),
  // S_SARG_STND
  new State(SpriteNum.Sarg, 0, 10, Enemy, Enemy.prototype.look, StateNum.SargStnd2, 0, 0),
  // S_SARG_STND2
  new State(SpriteNum.Sarg, 1, 10, Enemy, Enemy.prototype.look, StateNum.SargStnd, 0, 0),
  // S_SARG_RUN1
  new State(SpriteNum.Sarg, 0, 2, Enemy, Enemy.prototype.chase, StateNum.SargRun2, 0, 0),
  // S_SARG_RUN2
  new State(SpriteNum.Sarg, 0, 2, Enemy, Enemy.prototype.chase, StateNum.SargRun3, 0, 0),
  // S_SARG_RUN3
  new State(SpriteNum.Sarg, 1, 2, Enemy, Enemy.prototype.chase, StateNum.SargRun4, 0, 0),
  // S_SARG_RUN4
  new State(SpriteNum.Sarg, 1, 2, Enemy, Enemy.prototype.chase, StateNum.SargRun5, 0, 0),
  // S_SARG_RUN5
  new State(SpriteNum.Sarg, 2, 2, Enemy, Enemy.prototype.chase, StateNum.SargRun6, 0, 0),
  // S_SARG_RUN6
  new State(SpriteNum.Sarg, 2, 2, Enemy, Enemy.prototype.chase, StateNum.SargRun7, 0, 0),
  // S_SARG_RUN7
  new State(SpriteNum.Sarg, 3, 2, Enemy, Enemy.prototype.chase, StateNum.SargRun8, 0, 0),
  // S_SARG_RUN8
  new State(SpriteNum.Sarg, 3, 2, Enemy, Enemy.prototype.chase, StateNum.SargRun1, 0, 0),
  // S_SARG_ATK1
  new State(SpriteNum.Sarg, 4, 8, Enemy, Enemy.prototype.faceTarget, StateNum.SargAtk2, 0, 0),
  // S_SARG_ATK2
  new State(SpriteNum.Sarg, 5, 8, Enemy, Enemy.prototype.faceTarget, StateNum.SargAtk3, 0, 0),
  // S_SARG_ATK3
  new State(SpriteNum.Sarg, 6, 8, Enemy, Enemy.prototype.sargAttack, StateNum.SargRun1, 0, 0),
  // S_SARG_PAIN
  new State(SpriteNum.Sarg, 7, 2, null, null, StateNum.SargPain2, 0, 0),
  // S_SARG_PAIN2
  new State(SpriteNum.Sarg, 7, 2, Enemy, Enemy.prototype.pain, StateNum.SargRun1, 0, 0),
  // S_SARG_DIE1
  new State(SpriteNum.Sarg, 8, 8, null, null, StateNum.SargDie2, 0, 0),
  // S_SARG_DIE2
  new State(SpriteNum.Sarg, 9, 8, Enemy, Enemy.prototype.scream, StateNum.SargDie3, 0, 0),
  // S_SARG_DIE3
  new State(SpriteNum.Sarg, 10, 4, null, null, StateNum.SargDie4, 0, 0),
  // S_SARG_DIE4
  new State(SpriteNum.Sarg, 11, 4, Enemy, Enemy.prototype.fall, StateNum.SargDie5, 0, 0),
  // S_SARG_DIE5
  new State(SpriteNum.Sarg, 12, 4, null, null, StateNum.SargDie6, 0, 0),
  // S_SARG_DIE6
  new State(SpriteNum.Sarg, 13, -1, null, null, StateNum.Null, 0, 0),
  // S_SARG_RAISE1
  new State(SpriteNum.Sarg, 13, 5, null, null, StateNum.SargRaise2, 0, 0),
  // S_SARG_RAISE2
  new State(SpriteNum.Sarg, 12, 5, null, null, StateNum.SargRaise3, 0, 0),
  // S_SARG_RAISE3
  new State(SpriteNum.Sarg, 11, 5, null, null, StateNum.SargRaise4, 0, 0),
  // S_SARG_RAISE4
  new State(SpriteNum.Sarg, 10, 5, null, null, StateNum.SargRaise5, 0, 0),
  // S_SARG_RAISE5
  new State(SpriteNum.Sarg, 9, 5, null, null, StateNum.SargRaise6, 0, 0),
  // S_SARG_RAISE6
  new State(SpriteNum.Sarg, 8, 5, null, null, StateNum.SargRun1, 0, 0),
  // S_HEAD_STND
  new State(SpriteNum.Head, 0, 10, Enemy, Enemy.prototype.look, StateNum.HeadStnd, 0, 0),
  // S_HEAD_RUN1
  new State(SpriteNum.Head, 0, 3, Enemy, Enemy.prototype.chase, StateNum.HeadRun1, 0, 0),
  // S_HEAD_ATK1
  new State(SpriteNum.Head, 1, 5, Enemy, Enemy.prototype.faceTarget, StateNum.HeadAtk2, 0, 0),
  // S_HEAD_ATK2
  new State(SpriteNum.Head, 2, 5, Enemy, Enemy.prototype.faceTarget, StateNum.HeadAtk3, 0, 0),
  // S_HEAD_ATK3
  new State(SpriteNum.Head, 32771, 5, Enemy, Enemy.prototype.headAttack, StateNum.HeadRun1, 0, 0),
  // S_HEAD_PAIN
  new State(SpriteNum.Head, 4, 3, null, null, StateNum.HeadPain2, 0, 0),
  // S_HEAD_PAIN2
  new State(SpriteNum.Head, 4, 3, Enemy, Enemy.prototype.pain, StateNum.HeadPain3, 0, 0),
  // S_HEAD_PAIN3
  new State(SpriteNum.Head, 5, 6, null, null, StateNum.HeadRun1, 0, 0),
  // S_HEAD_DIE1
  new State(SpriteNum.Head, 6, 8, null, null, StateNum.HeadDie2, 0, 0),
  // S_HEAD_DIE2
  new State(SpriteNum.Head, 7, 8, Enemy, Enemy.prototype.scream, StateNum.HeadDie3, 0, 0),
  // S_HEAD_DIE3
  new State(SpriteNum.Head, 8, 8, null, null, StateNum.HeadDie4, 0, 0),
  // S_HEAD_DIE4
  new State(SpriteNum.Head, 9, 8, null, null, StateNum.HeadDie5, 0, 0),
  // S_HEAD_DIE5
  new State(SpriteNum.Head, 10, 8, Enemy, Enemy.prototype.fall, StateNum.HeadDie6, 0, 0),
  // S_HEAD_DIE6
  new State(SpriteNum.Head, 11, -1, null, null, StateNum.Null, 0, 0),
  // S_HEAD_RAISE1
  new State(SpriteNum.Head, 11, 8, null, null, StateNum.HeadRaise2, 0, 0),
  // S_HEAD_RAISE2
  new State(SpriteNum.Head, 10, 8, null, null, StateNum.HeadRaise3, 0, 0),
  // S_HEAD_RAISE3
  new State(SpriteNum.Head, 9, 8, null, null, StateNum.HeadRaise4, 0, 0),
  // S_HEAD_RAISE4
  new State(SpriteNum.Head, 8, 8, null, null, StateNum.HeadRaise5, 0, 0),
  // S_HEAD_RAISE5
  new State(SpriteNum.Head, 7, 8, null, null, StateNum.HeadRaise6, 0, 0),
  // S_HEAD_RAISE6
  new State(SpriteNum.Head, 6, 8, null, null, StateNum.HeadRun1, 0, 0),
  // S_BRBALL1
  new State(SpriteNum.Bal7, 32768, 4, null, null, StateNum.Brball2, 0, 0),
  // S_BRBALL2
  new State(SpriteNum.Bal7, 32769, 4, null, null, StateNum.Brball1, 0, 0),
  // S_BRBALLX1
  new State(SpriteNum.Bal7, 32770, 6, null, null, StateNum.Brballx2, 0, 0),
  // S_BRBALLX2
  new State(SpriteNum.Bal7, 32771, 6, null, null, StateNum.Brballx3, 0, 0),
  // S_BRBALLX3
  new State(SpriteNum.Bal7, 32772, 6, null, null, StateNum.Null, 0, 0),
  // S_BOSS_STND
  new State(SpriteNum.Boss, 0, 10, Enemy, Enemy.prototype.look, StateNum.BossStnd2, 0, 0),
  // S_BOSS_STND2
  new State(SpriteNum.Boss, 1, 10, Enemy, Enemy.prototype.look, StateNum.BossStnd, 0, 0),
  // S_BOSS_RUN1
  new State(SpriteNum.Boss, 0, 3, Enemy, Enemy.prototype.chase, StateNum.BossRun2, 0, 0),
  // S_BOSS_RUN2
  new State(SpriteNum.Boss, 0, 3, Enemy, Enemy.prototype.chase, StateNum.BossRun3, 0, 0),
  // S_BOSS_RUN3
  new State(SpriteNum.Boss, 1, 3, Enemy, Enemy.prototype.chase, StateNum.BossRun4, 0, 0),
  // S_BOSS_RUN4
  new State(SpriteNum.Boss, 1, 3, Enemy, Enemy.prototype.chase, StateNum.BossRun5, 0, 0),
  // S_BOSS_RUN5
  new State(SpriteNum.Boss, 2, 3, Enemy, Enemy.prototype.chase, StateNum.BossRun6, 0, 0),
  // S_BOSS_RUN6
  new State(SpriteNum.Boss, 2, 3, Enemy, Enemy.prototype.chase, StateNum.BossRun7, 0, 0),
  // S_BOSS_RUN7
  new State(SpriteNum.Boss, 3, 3, Enemy, Enemy.prototype.chase, StateNum.BossRun8, 0, 0),
  // S_BOSS_RUN8
  new State(SpriteNum.Boss, 3, 3, Enemy, Enemy.prototype.chase, StateNum.BossRun1, 0, 0),
  // S_BOSS_ATK1
  new State(SpriteNum.Boss, 4, 8, Enemy, Enemy.prototype.faceTarget, StateNum.BossAtk2, 0, 0),
  // S_BOSS_ATK2
  new State(SpriteNum.Boss, 5, 8, Enemy, Enemy.prototype.faceTarget, StateNum.BossAtk3, 0, 0),
  // S_BOSS_ATK3
  new State(SpriteNum.Boss, 6, 8, Enemy, Enemy.prototype.bruisAttack, StateNum.BossRun1, 0, 0),
  // S_BOSS_PAIN
  new State(SpriteNum.Boss, 7, 2, null, null, StateNum.BossPain2, 0, 0),
  // S_BOSS_PAIN2
  new State(SpriteNum.Boss, 7, 2, Enemy, Enemy.prototype.pain, StateNum.BossRun1, 0, 0),
  // S_BOSS_DIE1
  new State(SpriteNum.Boss, 8, 8, null, null, StateNum.BossDie2, 0, 0),
  // S_BOSS_DIE2
  new State(SpriteNum.Boss, 9, 8, Enemy, Enemy.prototype.scream, StateNum.BossDie3, 0, 0),
  // S_BOSS_DIE3
  new State(SpriteNum.Boss, 10, 8, null, null, StateNum.BossDie4, 0, 0),
  // S_BOSS_DIE4
  new State(SpriteNum.Boss, 11, 8, Enemy, Enemy.prototype.fall, StateNum.BossDie5, 0, 0),
  // S_BOSS_DIE5
  new State(SpriteNum.Boss, 12, 8, null, null, StateNum.BossDie6, 0, 0),
  // S_BOSS_DIE6
  new State(SpriteNum.Boss, 13, 8, null, null, StateNum.BossDie7, 0, 0),
  // S_BOSS_DIE7
  new State(SpriteNum.Boss, 14, -1, Enemy, Enemy.prototype.bossDeath, StateNum.Null, 0, 0),
  // S_BOSS_RAISE1
  new State(SpriteNum.Boss, 14, 8, null, null, StateNum.BossRaise2, 0, 0),
  // S_BOSS_RAISE2
  new State(SpriteNum.Boss, 13, 8, null, null, StateNum.BossRaise3, 0, 0),
  // S_BOSS_RAISE3
  new State(SpriteNum.Boss, 12, 8, null, null, StateNum.BossRaise4, 0, 0),
  // S_BOSS_RAISE4
  new State(SpriteNum.Boss, 11, 8, null, null, StateNum.BossRaise5, 0, 0),
  // S_BOSS_RAISE5
  new State(SpriteNum.Boss, 10, 8, null, null, StateNum.BossRaise6, 0, 0),
  // S_BOSS_RAISE6
  new State(SpriteNum.Boss, 9, 8, null, null, StateNum.BossRaise7, 0, 0),
  // S_BOSS_RAISE7
  new State(SpriteNum.Boss, 8, 8, null, null, StateNum.BossRun1, 0, 0),
  // S_BOS2_STND
  new State(SpriteNum.Bos2, 0, 10, Enemy, Enemy.prototype.look, StateNum.Bos2Stnd2, 0, 0),
  // S_BOS2_STND2
  new State(SpriteNum.Bos2, 1, 10, Enemy, Enemy.prototype.look, StateNum.Bos2Stnd, 0, 0),
  // S_BOS2_RUN1
  new State(SpriteNum.Bos2, 0, 3, Enemy, Enemy.prototype.chase, StateNum.Bos2Run2, 0, 0),
  // S_BOS2_RUN2
  new State(SpriteNum.Bos2, 0, 3, Enemy, Enemy.prototype.chase, StateNum.Bos2Run3, 0, 0),
  // S_BOS2_RUN3
  new State(SpriteNum.Bos2, 1, 3, Enemy, Enemy.prototype.chase, StateNum.Bos2Run4, 0, 0),
  // S_BOS2_RUN4
  new State(SpriteNum.Bos2, 1, 3, Enemy, Enemy.prototype.chase, StateNum.Bos2Run5, 0, 0),
  // S_BOS2_RUN5
  new State(SpriteNum.Bos2, 2, 3, Enemy, Enemy.prototype.chase, StateNum.Bos2Run6, 0, 0),
  // S_BOS2_RUN6
  new State(SpriteNum.Bos2, 2, 3, Enemy, Enemy.prototype.chase, StateNum.Bos2Run7, 0, 0),
  // S_BOS2_RUN7
  new State(SpriteNum.Bos2, 3, 3, Enemy, Enemy.prototype.chase, StateNum.Bos2Run8, 0, 0),
  // S_BOS2_RUN8
  new State(SpriteNum.Bos2, 3, 3, Enemy, Enemy.prototype.chase, StateNum.Bos2Run1, 0, 0),
  // S_BOS2_ATK1
  new State(SpriteNum.Bos2, 4, 8, Enemy, Enemy.prototype.faceTarget, StateNum.Bos2Atk2, 0, 0),
  // S_BOS2_ATK2
  new State(SpriteNum.Bos2, 5, 8, Enemy, Enemy.prototype.faceTarget, StateNum.Bos2Atk3, 0, 0),
  // S_BOS2_ATK3
  new State(SpriteNum.Bos2, 6, 8, Enemy, Enemy.prototype.bruisAttack, StateNum.Bos2Run1, 0, 0),
  // S_BOS2_PAIN
  new State(SpriteNum.Bos2, 7, 2, null, null, StateNum.Bos2Pain2, 0, 0),
  // S_BOS2_PAIN2
  new State(SpriteNum.Bos2, 7, 2, Enemy, Enemy.prototype.pain, StateNum.Bos2Run1, 0, 0),
  // S_BOS2_DIE1
  new State(SpriteNum.Bos2, 8, 8, null, null, StateNum.Bos2Die2, 0, 0),
  // S_BOS2_DIE2
  new State(SpriteNum.Bos2, 9, 8, Enemy, Enemy.prototype.scream, StateNum.Bos2Die3, 0, 0),
  // S_BOS2_DIE3
  new State(SpriteNum.Bos2, 10, 8, null, null, StateNum.Bos2Die4, 0, 0),
  // S_BOS2_DIE4
  new State(SpriteNum.Bos2, 11, 8, Enemy, Enemy.prototype.fall, StateNum.Bos2Die5, 0, 0),
  // S_BOS2_DIE5
  new State(SpriteNum.Bos2, 12, 8, null, null, StateNum.Bos2Die6, 0, 0),
  // S_BOS2_DIE6
  new State(SpriteNum.Bos2, 13, 8, null, null, StateNum.Bos2Die7, 0, 0),
  // S_BOS2_DIE7
  new State(SpriteNum.Bos2, 14, -1, null, null, StateNum.Null, 0, 0),
  // S_BOS2_RAISE1
  new State(SpriteNum.Bos2, 14, 8, null, null, StateNum.Bos2Raise2, 0, 0),
  // S_BOS2_RAISE2
  new State(SpriteNum.Bos2, 13, 8, null, null, StateNum.Bos2Raise3, 0, 0),
  // S_BOS2_RAISE3
  new State(SpriteNum.Bos2, 12, 8, null, null, StateNum.Bos2Raise4, 0, 0),
  // S_BOS2_RAISE4
  new State(SpriteNum.Bos2, 11, 8, null, null, StateNum.Bos2Raise5, 0, 0),
  // S_BOS2_RAISE5
  new State(SpriteNum.Bos2, 10, 8, null, null, StateNum.Bos2Raise6, 0, 0),
  // S_BOS2_RAISE6
  new State(SpriteNum.Bos2, 9, 8, null, null, StateNum.Bos2Raise7, 0, 0),
  // S_BOS2_RAISE7
  new State(SpriteNum.Bos2, 8, 8, null, null, StateNum.Bos2Run1, 0, 0),
  // S_SKULL_STND
  new State(SpriteNum.Skul, 32768, 10, Enemy, Enemy.prototype.look, StateNum.SkullStnd2, 0, 0),
  // S_SKULL_STND2
  new State(SpriteNum.Skul, 32769, 10, Enemy, Enemy.prototype.look, StateNum.SkullStnd, 0, 0),
  // S_SKULL_RUN1
  new State(SpriteNum.Skul, 32768, 6, Enemy, Enemy.prototype.chase, StateNum.SkullRun2, 0, 0),
  // S_SKULL_RUN2
  new State(SpriteNum.Skul, 32769, 6, Enemy, Enemy.prototype.chase, StateNum.SkullRun1, 0, 0),
  // S_SKULL_ATK1
  new State(SpriteNum.Skul, 32770, 10, Enemy, Enemy.prototype.faceTarget, StateNum.SkullAtk2, 0, 0),
  // S_SKULL_ATK2
  new State(SpriteNum.Skul, 32771, 4, Enemy, Enemy.prototype.skullAttack, StateNum.SkullAtk3, 0, 0),
  // S_SKULL_ATK3
  new State(SpriteNum.Skul, 32770, 4, null, null, StateNum.SkullAtk4, 0, 0),
  // S_SKULL_ATK4
  new State(SpriteNum.Skul, 32771, 4, null, null, StateNum.SkullAtk3, 0, 0),
  // S_SKULL_PAIN
  new State(SpriteNum.Skul, 32772, 3, null, null, StateNum.SkullPain2, 0, 0),
  // S_SKULL_PAIN2
  new State(SpriteNum.Skul, 32772, 3, Enemy, Enemy.prototype.pain, StateNum.SkullRun1, 0, 0),
  // S_SKULL_DIE1
  new State(SpriteNum.Skul, 32773, 6, null, null, StateNum.SkullDie2, 0, 0),
  // S_SKULL_DIE2
  new State(SpriteNum.Skul, 32774, 6, Enemy, Enemy.prototype.scream, StateNum.SkullDie3, 0, 0),
  // S_SKULL_DIE3
  new State(SpriteNum.Skul, 32775, 6, null, null, StateNum.SkullDie4, 0, 0),
  // S_SKULL_DIE4
  new State(SpriteNum.Skul, 32776, 6, Enemy, Enemy.prototype.fall, StateNum.SkullDie5, 0, 0),
  // S_SKULL_DIE5
  new State(SpriteNum.Skul, 9, 6, null, null, StateNum.SkullDie6, 0, 0),
  // S_SKULL_DIE6
  new State(SpriteNum.Skul, 10, 6, null, null, StateNum.Null, 0, 0),
  // S_SPID_STND
  new State(SpriteNum.Spid, 0, 10, Enemy, Enemy.prototype.look, StateNum.SpidStnd2, 0, 0),
  // S_SPID_STND2
  new State(SpriteNum.Spid, 1, 10, Enemy, Enemy.prototype.look, StateNum.SpidStnd, 0, 0),
  // S_SPID_RUN1
  new State(SpriteNum.Spid, 0, 3, Enemy, Enemy.prototype.metal, StateNum.SpidRun2, 0, 0),
  // S_SPID_RUN2
  new State(SpriteNum.Spid, 0, 3, Enemy, Enemy.prototype.chase, StateNum.SpidRun3, 0, 0),
  // S_SPID_RUN3
  new State(SpriteNum.Spid, 1, 3, Enemy, Enemy.prototype.chase, StateNum.SpidRun4, 0, 0),
  // S_SPID_RUN4
  new State(SpriteNum.Spid, 1, 3, Enemy, Enemy.prototype.chase, StateNum.SpidRun5, 0, 0),
  // S_SPID_RUN5
  new State(SpriteNum.Spid, 2, 3, Enemy, Enemy.prototype.metal, StateNum.SpidRun6, 0, 0),
  // S_SPID_RUN6
  new State(SpriteNum.Spid, 2, 3, Enemy, Enemy.prototype.chase, StateNum.SpidRun7, 0, 0),
  // S_SPID_RUN7
  new State(SpriteNum.Spid, 3, 3, Enemy, Enemy.prototype.chase, StateNum.SpidRun8, 0, 0),
  // S_SPID_RUN8
  new State(SpriteNum.Spid, 3, 3, Enemy, Enemy.prototype.chase, StateNum.SpidRun9, 0, 0),
  // S_SPID_RUN9
  new State(SpriteNum.Spid, 4, 3, Enemy, Enemy.prototype.metal, StateNum.SpidRun10, 0, 0),
  // S_SPID_RUN10
  new State(SpriteNum.Spid, 4, 3, Enemy, Enemy.prototype.chase, StateNum.SpidRun11, 0, 0),
  // S_SPID_RUN11
  new State(SpriteNum.Spid, 5, 3, Enemy, Enemy.prototype.chase, StateNum.SpidRun12, 0, 0),
  // S_SPID_RUN12
  new State(SpriteNum.Spid, 5, 3, Enemy, Enemy.prototype.chase, StateNum.SpidRun1, 0, 0),
  // S_SPID_ATK1
  new State(SpriteNum.Spid, 32768, 20, Enemy, Enemy.prototype.faceTarget, StateNum.SpidAtk2, 0, 0),
  // S_SPID_ATK2
  new State(SpriteNum.Spid, 32774, 4, Enemy, Enemy.prototype.sPosAttack, StateNum.SpidAtk3, 0, 0),
  // S_SPID_ATK3
  new State(SpriteNum.Spid, 32775, 4, Enemy, Enemy.prototype.sPosAttack, StateNum.SpidAtk4, 0, 0),
  // S_SPID_ATK4
  new State(SpriteNum.Spid, 32775, 1, Enemy, Enemy.prototype.spidRefire, StateNum.SpidAtk2, 0, 0),
  // S_SPID_PAIN
  new State(SpriteNum.Spid, 8, 3, null, null, StateNum.SpidPain2, 0, 0),
  // S_SPID_PAIN2
  new State(SpriteNum.Spid, 8, 3, Enemy, Enemy.prototype.pain, StateNum.SpidRun1, 0, 0),
  // S_SPID_DIE1
  new State(SpriteNum.Spid, 9, 20, Enemy, Enemy.prototype.scream, StateNum.SpidDie2, 0, 0),
  // S_SPID_DIE2
  new State(SpriteNum.Spid, 10, 10, Enemy, Enemy.prototype.fall, StateNum.SpidDie3, 0, 0),
  // S_SPID_DIE3
  new State(SpriteNum.Spid, 11, 10, null, null, StateNum.SpidDie4, 0, 0),
  // S_SPID_DIE4
  new State(SpriteNum.Spid, 12, 10, null, null, StateNum.SpidDie5, 0, 0),
  // S_SPID_DIE5
  new State(SpriteNum.Spid, 13, 10, null, null, StateNum.SpidDie6, 0, 0),
  // S_SPID_DIE6
  new State(SpriteNum.Spid, 14, 10, null, null, StateNum.SpidDie7, 0, 0),
  // S_SPID_DIE7
  new State(SpriteNum.Spid, 15, 10, null, null, StateNum.SpidDie8, 0, 0),
  // S_SPID_DIE8
  new State(SpriteNum.Spid, 16, 10, null, null, StateNum.SpidDie9, 0, 0),
  // S_SPID_DIE9
  new State(SpriteNum.Spid, 17, 10, null, null, StateNum.SpidDie10, 0, 0),
  // S_SPID_DIE10
  new State(SpriteNum.Spid, 18, 30, null, null, StateNum.SpidDie11, 0, 0),
  // S_SPID_DIE11
  new State(SpriteNum.Spid, 18, -1, Enemy, Enemy.prototype.bossDeath, StateNum.Null, 0, 0),
  // S_BSPI_STND
  new State(SpriteNum.Bspi, 0, 10, Enemy, Enemy.prototype.look, StateNum.BspiStnd2, 0, 0),
  // S_BSPI_STND2
  new State(SpriteNum.Bspi, 1, 10, Enemy, Enemy.prototype.look, StateNum.BspiStnd, 0, 0),
  // S_BSPI_SIGHT
  new State(SpriteNum.Bspi, 0, 20, null, null, StateNum.BspiRun1, 0, 0),
  // S_BSPI_RUN1
  new State(SpriteNum.Bspi, 0, 3, Enemy, Enemy.prototype.babyMetal, StateNum.BspiRun2, 0, 0),
  // S_BSPI_RUN2
  new State(SpriteNum.Bspi, 0, 3, Enemy, Enemy.prototype.chase, StateNum.BspiRun3, 0, 0),
  // S_BSPI_RUN3
  new State(SpriteNum.Bspi, 1, 3, Enemy, Enemy.prototype.chase, StateNum.BspiRun4, 0, 0),
  // S_BSPI_RUN4
  new State(SpriteNum.Bspi, 1, 3, Enemy, Enemy.prototype.chase, StateNum.BspiRun5, 0, 0),
  // S_BSPI_RUN5
  new State(SpriteNum.Bspi, 2, 3, Enemy, Enemy.prototype.chase, StateNum.BspiRun6, 0, 0),
  // S_BSPI_RUN6
  new State(SpriteNum.Bspi, 2, 3, Enemy, Enemy.prototype.chase, StateNum.BspiRun7, 0, 0),
  // S_BSPI_RUN7
  new State(SpriteNum.Bspi, 3, 3, Enemy, Enemy.prototype.babyMetal, StateNum.BspiRun8, 0, 0),
  // S_BSPI_RUN8
  new State(SpriteNum.Bspi, 3, 3, Enemy, Enemy.prototype.chase, StateNum.BspiRun9, 0, 0),
  // S_BSPI_RUN9
  new State(SpriteNum.Bspi, 4, 3, Enemy, Enemy.prototype.chase, StateNum.BspiRun10, 0, 0),
  // S_BSPI_RUN10
  new State(SpriteNum.Bspi, 4, 3, Enemy, Enemy.prototype.chase, StateNum.BspiRun11, 0, 0),
  // S_BSPI_RUN11
  new State(SpriteNum.Bspi, 5, 3, Enemy, Enemy.prototype.chase, StateNum.BspiRun12, 0, 0),
  // S_BSPI_RUN12
  new State(SpriteNum.Bspi, 5, 3, Enemy, Enemy.prototype.chase, StateNum.BspiRun1, 0, 0),
  // S_BSPI_ATK1
  new State(SpriteNum.Bspi, 32768, 20, Enemy, Enemy.prototype.faceTarget, StateNum.BspiAtk2, 0, 0),
  // S_BSPI_ATK2
  new State(SpriteNum.Bspi, 32774, 4, Enemy, Enemy.prototype.bspiAttack, StateNum.BspiAtk3, 0, 0),
  // S_BSPI_ATK3
  new State(SpriteNum.Bspi, 32775, 4, null, null, StateNum.BspiAtk4, 0, 0),
  // S_BSPI_ATK4
  new State(SpriteNum.Bspi, 32775, 1, Enemy, Enemy.prototype.spidRefire, StateNum.BspiAtk2, 0, 0),
  // S_BSPI_PAIN
  new State(SpriteNum.Bspi, 8, 3, null, null, StateNum.BspiPain2, 0, 0),
  // S_BSPI_PAIN2
  new State(SpriteNum.Bspi, 8, 3, Enemy, Enemy.prototype.pain, StateNum.BspiRun1, 0, 0),
  // S_BSPI_DIE1
  new State(SpriteNum.Bspi, 9, 20, Enemy, Enemy.prototype.scream, StateNum.BspiDie2, 0, 0),
  // S_BSPI_DIE2
  new State(SpriteNum.Bspi, 10, 7, Enemy, Enemy.prototype.fall, StateNum.BspiDie3, 0, 0),
  // S_BSPI_DIE3
  new State(SpriteNum.Bspi, 11, 7, null, null, StateNum.BspiDie4, 0, 0),
  // S_BSPI_DIE4
  new State(SpriteNum.Bspi, 12, 7, null, null, StateNum.BspiDie5, 0, 0),
  // S_BSPI_DIE5
  new State(SpriteNum.Bspi, 13, 7, null, null, StateNum.BspiDie6, 0, 0),
  // S_BSPI_DIE6
  new State(SpriteNum.Bspi, 14, 7, null, null, StateNum.BspiDie7, 0, 0),
  // S_BSPI_DIE7
  new State(SpriteNum.Bspi, 15, -1, Enemy, Enemy.prototype.bossDeath, StateNum.Null, 0, 0),
  // S_BSPI_RAISE1
  new State(SpriteNum.Bspi, 15, 5, null, null, StateNum.BspiRaise2, 0, 0),
  // S_BSPI_RAISE2
  new State(SpriteNum.Bspi, 14, 5, null, null, StateNum.BspiRaise3, 0, 0),
  // S_BSPI_RAISE3
  new State(SpriteNum.Bspi, 13, 5, null, null, StateNum.BspiRaise4, 0, 0),
  // S_BSPI_RAISE4
  new State(SpriteNum.Bspi, 12, 5, null, null, StateNum.BspiRaise5, 0, 0),
  // S_BSPI_RAISE5
  new State(SpriteNum.Bspi, 11, 5, null, null, StateNum.BspiRaise6, 0, 0),
  // S_BSPI_RAISE6
  new State(SpriteNum.Bspi, 10, 5, null, null, StateNum.BspiRaise7, 0, 0),
  // S_BSPI_RAISE7
  new State(SpriteNum.Bspi, 9, 5, null, null, StateNum.BspiRun1, 0, 0),
  // S_ARACH_PLAZ
  new State(SpriteNum.Apls, 32768, 5, null, null, StateNum.ArachPlaz2, 0, 0),
  // S_ARACH_PLAZ2
  new State(SpriteNum.Apls, 32769, 5, null, null, StateNum.ArachPlaz, 0, 0),
  // S_ARACH_PLEX
  new State(SpriteNum.Apbx, 32768, 5, null, null, StateNum.ArachPlex2, 0, 0),
  // S_ARACH_PLEX2
  new State(SpriteNum.Apbx, 32769, 5, null, null, StateNum.ArachPlex3, 0, 0),
  // S_ARACH_PLEX3
  new State(SpriteNum.Apbx, 32770, 5, null, null, StateNum.ArachPlex4, 0, 0),
  // S_ARACH_PLEX4
  new State(SpriteNum.Apbx, 32771, 5, null, null, StateNum.ArachPlex5, 0, 0),
  // S_ARACH_PLEX5
  new State(SpriteNum.Apbx, 32772, 5, null, null, StateNum.Null, 0, 0),
  // S_CYBER_STND
  new State(SpriteNum.Cybr, 0, 10, Enemy, Enemy.prototype.look, StateNum.CyberStnd2, 0, 0),
  // S_CYBER_STND2
  new State(SpriteNum.Cybr, 1, 10, Enemy, Enemy.prototype.look, StateNum.CyberStnd, 0, 0),
  // S_CYBER_RUN1
  new State(SpriteNum.Cybr, 0, 3, Enemy, Enemy.prototype.hoof, StateNum.CyberRun2, 0, 0),
  // S_CYBER_RUN2
  new State(SpriteNum.Cybr, 0, 3, Enemy, Enemy.prototype.chase, StateNum.CyberRun3, 0, 0),
  // S_CYBER_RUN3
  new State(SpriteNum.Cybr, 1, 3, Enemy, Enemy.prototype.chase, StateNum.CyberRun4, 0, 0),
  // S_CYBER_RUN4
  new State(SpriteNum.Cybr, 1, 3, Enemy, Enemy.prototype.chase, StateNum.CyberRun5, 0, 0),
  // S_CYBER_RUN5
  new State(SpriteNum.Cybr, 2, 3, Enemy, Enemy.prototype.chase, StateNum.CyberRun6, 0, 0),
  // S_CYBER_RUN6
  new State(SpriteNum.Cybr, 2, 3, Enemy, Enemy.prototype.chase, StateNum.CyberRun7, 0, 0),
  // S_CYBER_RUN7
  new State(SpriteNum.Cybr, 3, 3, Enemy, Enemy.prototype.metal, StateNum.CyberRun8, 0, 0),
  // S_CYBER_RUN8
  new State(SpriteNum.Cybr, 3, 3, Enemy, Enemy.prototype.chase, StateNum.CyberRun1, 0, 0),
  // S_CYBER_ATK1
  new State(SpriteNum.Cybr, 4, 6, Enemy, Enemy.prototype.faceTarget, StateNum.CyberAtk2, 0, 0),
  // S_CYBER_ATK2
  new State(SpriteNum.Cybr, 5, 12, Enemy, Enemy.prototype.cyberAttack, StateNum.CyberAtk3, 0, 0),
  // S_CYBER_ATK3
  new State(SpriteNum.Cybr, 4, 12, Enemy, Enemy.prototype.faceTarget, StateNum.CyberAtk4, 0, 0),
  // S_CYBER_ATK4
  new State(SpriteNum.Cybr, 5, 12, Enemy, Enemy.prototype.cyberAttack, StateNum.CyberAtk5, 0, 0),
  // S_CYBER_ATK5
  new State(SpriteNum.Cybr, 4, 12, Enemy, Enemy.prototype.faceTarget, StateNum.CyberAtk6, 0, 0),
  // S_CYBER_ATK6
  new State(SpriteNum.Cybr, 5, 12, Enemy, Enemy.prototype.cyberAttack, StateNum.CyberRun1, 0, 0),
  // S_CYBER_PAIN
  new State(SpriteNum.Cybr, 6, 10, Enemy, Enemy.prototype.pain, StateNum.CyberRun1, 0, 0),
  // S_CYBER_DIE1
  new State(SpriteNum.Cybr, 7, 10, null, null, StateNum.CyberDie2, 0, 0),
  // S_CYBER_DIE2
  new State(SpriteNum.Cybr, 8, 10, Enemy, Enemy.prototype.scream, StateNum.CyberDie3, 0, 0),
  // S_CYBER_DIE3
  new State(SpriteNum.Cybr, 9, 10, null, null, StateNum.CyberDie4, 0, 0),
  // S_CYBER_DIE4
  new State(SpriteNum.Cybr, 10, 10, null, null, StateNum.CyberDie5, 0, 0),
  // S_CYBER_DIE5
  new State(SpriteNum.Cybr, 11, 10, null, null, StateNum.CyberDie6, 0, 0),
  // S_CYBER_DIE6
  new State(SpriteNum.Cybr, 12, 10, Enemy, Enemy.prototype.fall, StateNum.CyberDie7, 0, 0),
  // S_CYBER_DIE7
  new State(SpriteNum.Cybr, 13, 10, null, null, StateNum.CyberDie8, 0, 0),
  // S_CYBER_DIE8
  new State(SpriteNum.Cybr, 14, 10, null, null, StateNum.CyberDie9, 0, 0),
  // S_CYBER_DIE9
  new State(SpriteNum.Cybr, 15, 30, null, null, StateNum.CyberDie10, 0, 0),
  // S_CYBER_DIE10
  new State(SpriteNum.Cybr, 15, -1, Enemy, Enemy.prototype.bossDeath, StateNum.Null, 0, 0),
  // S_PAIN_STND
  new State(SpriteNum.Pain, 0, 10, Enemy, Enemy.prototype.look, StateNum.PainStnd, 0, 0),
  // S_PAIN_RUN1
  new State(SpriteNum.Pain, 0, 3, Enemy, Enemy.prototype.chase, StateNum.PainRun2, 0, 0),
  // S_PAIN_RUN2
  new State(SpriteNum.Pain, 0, 3, Enemy, Enemy.prototype.chase, StateNum.PainRun3, 0, 0),
  // S_PAIN_RUN3
  new State(SpriteNum.Pain, 1, 3, Enemy, Enemy.prototype.chase, StateNum.PainRun4, 0, 0),
  // S_PAIN_RUN4
  new State(SpriteNum.Pain, 1, 3, Enemy, Enemy.prototype.chase, StateNum.PainRun5, 0, 0),
  // S_PAIN_RUN5
  new State(SpriteNum.Pain, 2, 3, Enemy, Enemy.prototype.chase, StateNum.PainRun6, 0, 0),
  // S_PAIN_RUN6
  new State(SpriteNum.Pain, 2, 3, Enemy, Enemy.prototype.chase, StateNum.PainRun1, 0, 0),
  // S_PAIN_ATK1
  new State(SpriteNum.Pain, 3, 5, Enemy, Enemy.prototype.faceTarget, StateNum.PainAtk2, 0, 0),
  // S_PAIN_ATK2
  new State(SpriteNum.Pain, 4, 5, Enemy, Enemy.prototype.faceTarget, StateNum.PainAtk3, 0, 0),
  // S_PAIN_ATK3
  new State(SpriteNum.Pain, 32773, 5, Enemy, Enemy.prototype.faceTarget, StateNum.PainAtk4, 0, 0),
  // S_PAIN_ATK4
  new State(SpriteNum.Pain, 32773, 0, Enemy, Enemy.prototype.painAttack, StateNum.PainRun1, 0, 0),
  // S_PAIN_PAIN
  new State(SpriteNum.Pain, 6, 6, null, null, StateNum.PainPain2, 0, 0),
  // S_PAIN_PAIN2
  new State(SpriteNum.Pain, 6, 6, Enemy, Enemy.prototype.pain, StateNum.PainRun1, 0, 0),
  // S_PAIN_DIE1
  new State(SpriteNum.Pain, 32775, 8, null, null, StateNum.PainDie2, 0, 0),
  // S_PAIN_DIE2
  new State(SpriteNum.Pain, 32776, 8, Enemy, Enemy.prototype.scream, StateNum.PainDie3, 0, 0),
  // S_PAIN_DIE3
  new State(SpriteNum.Pain, 32777, 8, null, null, StateNum.PainDie4, 0, 0),
  // S_PAIN_DIE4
  new State(SpriteNum.Pain, 32778, 8, null, null, StateNum.PainDie5, 0, 0),
  // S_PAIN_DIE5
  new State(SpriteNum.Pain, 32779, 8, Enemy, Enemy.prototype.painDie, StateNum.PainDie6, 0, 0),
  // S_PAIN_DIE6
  new State(SpriteNum.Pain, 32780, 8, null, null, StateNum.Null, 0, 0),
  // S_PAIN_RAISE1
  new State(SpriteNum.Pain, 12, 8, null, null, StateNum.PainRaise2, 0, 0),
  // S_PAIN_RAISE2
  new State(SpriteNum.Pain, 11, 8, null, null, StateNum.PainRaise3, 0, 0),
  // S_PAIN_RAISE3
  new State(SpriteNum.Pain, 10, 8, null, null, StateNum.PainRaise4, 0, 0),
  // S_PAIN_RAISE4
  new State(SpriteNum.Pain, 9, 8, null, null, StateNum.PainRaise5, 0, 0),
  // S_PAIN_RAISE5
  new State(SpriteNum.Pain, 8, 8, null, null, StateNum.PainRaise6, 0, 0),
  // S_PAIN_RAISE6
  new State(SpriteNum.Pain, 7, 8, null, null, StateNum.PainRun1, 0, 0),
  // S_SSWV_STND
  new State(SpriteNum.Sswv, 0, 10, Enemy, Enemy.prototype.look, StateNum.SswvStnd2, 0, 0),
  // S_SSWV_STND2
  new State(SpriteNum.Sswv, 1, 10, Enemy, Enemy.prototype.look, StateNum.SswvStnd, 0, 0),
  // S_SSWV_RUN1
  new State(SpriteNum.Sswv, 0, 3, Enemy, Enemy.prototype.chase, StateNum.SswvRun2, 0, 0),
  // S_SSWV_RUN2
  new State(SpriteNum.Sswv, 0, 3, Enemy, Enemy.prototype.chase, StateNum.SswvRun3, 0, 0),
  // S_SSWV_RUN3
  new State(SpriteNum.Sswv, 1, 3, Enemy, Enemy.prototype.chase, StateNum.SswvRun4, 0, 0),
  // S_SSWV_RUN4
  new State(SpriteNum.Sswv, 1, 3, Enemy, Enemy.prototype.chase, StateNum.SswvRun5, 0, 0),
  // S_SSWV_RUN5
  new State(SpriteNum.Sswv, 2, 3, Enemy, Enemy.prototype.chase, StateNum.SswvRun6, 0, 0),
  // S_SSWV_RUN6
  new State(SpriteNum.Sswv, 2, 3, Enemy, Enemy.prototype.chase, StateNum.SswvRun7, 0, 0),
  // S_SSWV_RUN7
  new State(SpriteNum.Sswv, 3, 3, Enemy, Enemy.prototype.chase, StateNum.SswvRun8, 0, 0),
  // S_SSWV_RUN8
  new State(SpriteNum.Sswv, 3, 3, Enemy, Enemy.prototype.chase, StateNum.SswvRun1, 0, 0),
  // S_SSWV_ATK1
  new State(SpriteNum.Sswv, 4, 10, Enemy, Enemy.prototype.faceTarget, StateNum.SswvAtk2, 0, 0),
  // S_SSWV_ATK2
  new State(SpriteNum.Sswv, 5, 10, Enemy, Enemy.prototype.faceTarget, StateNum.SswvAtk3, 0, 0),
  // S_SSWV_ATK3
  new State(SpriteNum.Sswv, 32774, 4, Enemy, Enemy.prototype.cPosAttack, StateNum.SswvAtk4, 0, 0),
  // S_SSWV_ATK4
  new State(SpriteNum.Sswv, 5, 6, Enemy, Enemy.prototype.faceTarget, StateNum.SswvAtk5, 0, 0),
  // S_SSWV_ATK5
  new State(SpriteNum.Sswv, 32774, 4, Enemy, Enemy.prototype.cPosAttack, StateNum.SswvAtk6, 0, 0),
  // S_SSWV_ATK6
  new State(SpriteNum.Sswv, 5, 1, Enemy, Enemy.prototype.cPosRefire, StateNum.SswvAtk2, 0, 0),
  // S_SSWV_PAIN
  new State(SpriteNum.Sswv, 7, 3, null, null, StateNum.SswvPain2, 0, 0),
  // S_SSWV_PAIN2
  new State(SpriteNum.Sswv, 7, 3, Enemy, Enemy.prototype.pain, StateNum.SswvRun1, 0, 0),
  // S_SSWV_DIE1
  new State(SpriteNum.Sswv, 8, 5, null, null, StateNum.SswvDie2, 0, 0),
  // S_SSWV_DIE2
  new State(SpriteNum.Sswv, 9, 5, Enemy, Enemy.prototype.scream, StateNum.SswvDie3, 0, 0),
  // S_SSWV_DIE3
  new State(SpriteNum.Sswv, 10, 5, Enemy, Enemy.prototype.fall, StateNum.SswvDie4, 0, 0),
  // S_SSWV_DIE4
  new State(SpriteNum.Sswv, 11, 5, null, null, StateNum.SswvDie5, 0, 0),
  // S_SSWV_DIE5
  new State(SpriteNum.Sswv, 12, -1, null, null, StateNum.Null, 0, 0),
  // S_SSWV_XDIE1
  new State(SpriteNum.Sswv, 13, 5, null, null, StateNum.SswvXdie2, 0, 0),
  // S_SSWV_XDIE2
  new State(SpriteNum.Sswv, 14, 5, Enemy, Enemy.prototype.xScream, StateNum.SswvXdie3, 0, 0),
  // S_SSWV_XDIE3
  new State(SpriteNum.Sswv, 15, 5, Enemy, Enemy.prototype.fall, StateNum.SswvXdie4, 0, 0),
  // S_SSWV_XDIE4
  new State(SpriteNum.Sswv, 16, 5, null, null, StateNum.SswvXdie5, 0, 0),
  // S_SSWV_XDIE5
  new State(SpriteNum.Sswv, 17, 5, null, null, StateNum.SswvXdie6, 0, 0),
  // S_SSWV_XDIE6
  new State(SpriteNum.Sswv, 18, 5, null, null, StateNum.SswvXdie7, 0, 0),
  // S_SSWV_XDIE7
  new State(SpriteNum.Sswv, 19, 5, null, null, StateNum.SswvXdie8, 0, 0),
  // S_SSWV_XDIE8
  new State(SpriteNum.Sswv, 20, 5, null, null, StateNum.SswvXdie9, 0, 0),
  // S_SSWV_XDIE9
  new State(SpriteNum.Sswv, 21, -1, null, null, StateNum.Null, 0, 0),
  // S_SSWV_RAISE1
  new State(SpriteNum.Sswv, 12, 5, null, null, StateNum.SswvRaise2, 0, 0),
  // S_SSWV_RAISE2
  new State(SpriteNum.Sswv, 11, 5, null, null, StateNum.SswvRaise3, 0, 0),
  // S_SSWV_RAISE3
  new State(SpriteNum.Sswv, 10, 5, null, null, StateNum.SswvRaise4, 0, 0),
  // S_SSWV_RAISE4
  new State(SpriteNum.Sswv, 9, 5, null, null, StateNum.SswvRaise5, 0, 0),
  // S_SSWV_RAISE5
  new State(SpriteNum.Sswv, 8, 5, null, null, StateNum.SswvRun1, 0, 0),
  // S_KEENSTND
  new State(SpriteNum.Keen, 0, -1, null, null, StateNum.Keenstnd, 0, 0),
  // S_COMMKEEN
  new State(SpriteNum.Keen, 0, 6, null, null, StateNum.Commkeen2, 0, 0),
  // S_COMMKEEN2
  new State(SpriteNum.Keen, 1, 6, null, null, StateNum.Commkeen3, 0, 0),
  // S_COMMKEEN3
  new State(SpriteNum.Keen, 2, 6, Enemy, Enemy.prototype.scream, StateNum.Commkeen4, 0, 0),
  // S_COMMKEEN4
  new State(SpriteNum.Keen, 3, 6, null, null, StateNum.Commkeen5, 0, 0),
  // S_COMMKEEN5
  new State(SpriteNum.Keen, 4, 6, null, null, StateNum.Commkeen6, 0, 0),
  // S_COMMKEEN6
  new State(SpriteNum.Keen, 5, 6, null, null, StateNum.Commkeen7, 0, 0),
  // S_COMMKEEN7
  new State(SpriteNum.Keen, 6, 6, null, null, StateNum.Commkeen8, 0, 0),
  // S_COMMKEEN8
  new State(SpriteNum.Keen, 7, 6, null, null, StateNum.Commkeen9, 0, 0),
  // S_COMMKEEN9
  new State(SpriteNum.Keen, 8, 6, null, null, StateNum.Commkeen10, 0, 0),
  // S_COMMKEEN10
  new State(SpriteNum.Keen, 9, 6, null, null, StateNum.Commkeen11, 0, 0),
  // S_COMMKEEN11
  new State(SpriteNum.Keen, 10, 6, Enemy, Enemy.prototype.keenDie, StateNum.Commkeen12, 0, 0),
  // S_COMMKEEN12
  new State(SpriteNum.Keen, 11, -1, null, null, StateNum.Null, 0, 0),
  // S_KEENPAIN
  new State(SpriteNum.Keen, 12, 4, null, null, StateNum.Keenpain2, 0, 0),
  // S_KEENPAIN2
  new State(SpriteNum.Keen, 12, 8, Enemy, Enemy.prototype.pain, StateNum.Keenstnd, 0, 0),
  // S_BRAIN
  new State(SpriteNum.Bbrn, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_BRAIN_PAIN
  new State(SpriteNum.Bbrn, 1, 36, Enemy, Enemy.prototype.brainPain, StateNum.Brain, 0, 0),
  // S_BRAIN_DIE1
  new State(SpriteNum.Bbrn, 0, 100, Enemy, Enemy.prototype.brainScream, StateNum.BrainDie2, 0, 0),
  // S_BRAIN_DIE2
  new State(SpriteNum.Bbrn, 0, 10, null, null, StateNum.BrainDie3, 0, 0),
  // S_BRAIN_DIE3
  new State(SpriteNum.Bbrn, 0, 10, null, null, StateNum.BrainDie4, 0, 0),
  // S_BRAIN_DIE4
  new State(SpriteNum.Bbrn, 0, -1, Enemy, Enemy.prototype.brainDie, StateNum.Null, 0, 0),
  // S_BRAINEYE
  new State(SpriteNum.Sswv, 0, 10, Enemy, Enemy.prototype.look, StateNum.Braineye, 0, 0),
  // S_BRAINEYESEE
  new State(SpriteNum.Sswv, 0, 181, Enemy, Enemy.prototype.brainAwake, StateNum.Braineye1, 0, 0),
  // S_BRAINEYE1
  new State(SpriteNum.Sswv, 0, 150, Enemy, Enemy.prototype.brainSpit, StateNum.Braineye1, 0, 0),
  // S_SPAWN1
  new State(SpriteNum.Bosf, 32768, 3, Enemy, Enemy.prototype.spawnSound, StateNum.Spawn2, 0, 0),
  // S_SPAWN2
  new State(SpriteNum.Bosf, 32769, 3, Enemy, Enemy.prototype.spawnFly, StateNum.Spawn3, 0, 0),
  // S_SPAWN3
  new State(SpriteNum.Bosf, 32770, 3, Enemy, Enemy.prototype.spawnFly, StateNum.Spawn4, 0, 0),
  // S_SPAWN4
  new State(SpriteNum.Bosf, 32771, 3, Enemy, Enemy.prototype.spawnFly, StateNum.Spawn1, 0, 0),
  // S_SPAWNFIRE1
  new State(SpriteNum.Fire, 32768, 4, Enemy, Enemy.prototype.fire, StateNum.Spawnfire2, 0, 0),
  // S_SPAWNFIRE2
  new State(SpriteNum.Fire, 32769, 4, Enemy, Enemy.prototype.fire, StateNum.Spawnfire3, 0, 0),
  // S_SPAWNFIRE3
  new State(SpriteNum.Fire, 32770, 4, Enemy, Enemy.prototype.fire, StateNum.Spawnfire4, 0, 0),
  // S_SPAWNFIRE4
  new State(SpriteNum.Fire, 32771, 4, Enemy, Enemy.prototype.fire, StateNum.Spawnfire5, 0, 0),
  // S_SPAWNFIRE5
  new State(SpriteNum.Fire, 32772, 4, Enemy, Enemy.prototype.fire, StateNum.Spawnfire6, 0, 0),
  // S_SPAWNFIRE6
  new State(SpriteNum.Fire, 32773, 4, Enemy, Enemy.prototype.fire, StateNum.Spawnfire7, 0, 0),
  // S_SPAWNFIRE7
  new State(SpriteNum.Fire, 32774, 4, Enemy, Enemy.prototype.fire, StateNum.Spawnfire8, 0, 0),
  // S_SPAWNFIRE8
  new State(SpriteNum.Fire, 32775, 4, Enemy, Enemy.prototype.fire, StateNum.Null, 0, 0),
  // S_BRAINEXPLODE1
  new State(SpriteNum.Misl, 32769, 10, null, null, StateNum.Brainexplode2, 0, 0),
  // S_BRAINEXPLODE2
  new State(SpriteNum.Misl, 32770, 10, null, null, StateNum.Brainexplode3, 0, 0),
  // S_BRAINEXPLODE3
  new State(SpriteNum.Misl, 32771, 10, Enemy, Enemy.prototype.brainExplode, StateNum.Null, 0, 0),
  // S_ARM1
  new State(SpriteNum.Arm1, 0, 6, null, null, StateNum.Arm1a, 0, 0),
  // S_ARM1A
  new State(SpriteNum.Arm1, 32769, 7, null, null, StateNum.Arm1, 0, 0),
  // S_ARM2
  new State(SpriteNum.Arm2, 0, 6, null, null, StateNum.Arm2a, 0, 0),
  // S_ARM2A
  new State(SpriteNum.Arm2, 32769, 6, null, null, StateNum.Arm2, 0, 0),
  // S_BAR1
  new State(SpriteNum.Bar1, 0, 6, null, null, StateNum.Bar2, 0, 0),
  // S_BAR2
  new State(SpriteNum.Bar1, 1, 6, null, null, StateNum.Bar1, 0, 0),
  // S_BEXP
  new State(SpriteNum.Bexp, 32768, 5, null, null, StateNum.Bexp2, 0, 0),
  // S_BEXP2
  new State(SpriteNum.Bexp, 32769, 5, Enemy, Enemy.prototype.scream, StateNum.Bexp3, 0, 0),
  // S_BEXP3
  new State(SpriteNum.Bexp, 32770, 5, null, null, StateNum.Bexp4, 0, 0),
  // S_BEXP4
  new State(SpriteNum.Bexp, 32771, 10, Enemy, Enemy.prototype.explode, StateNum.Bexp5, 0, 0),
  // S_BEXP5
  new State(SpriteNum.Bexp, 32772, 10, null, null, StateNum.Null, 0, 0),
  // S_BBAR1
  new State(SpriteNum.Fcan, 32768, 4, null, null, StateNum.Bbar2, 0, 0),
  // S_BBAR2
  new State(SpriteNum.Fcan, 32769, 4, null, null, StateNum.Bbar3, 0, 0),
  // S_BBAR3
  new State(SpriteNum.Fcan, 32770, 4, null, null, StateNum.Bbar1, 0, 0),
  // S_BON1
  new State(SpriteNum.Bon1, 0, 6, null, null, StateNum.Bon1a, 0, 0),
  // S_BON1A
  new State(SpriteNum.Bon1, 1, 6, null, null, StateNum.Bon1b, 0, 0),
  // S_BON1B
  new State(SpriteNum.Bon1, 2, 6, null, null, StateNum.Bon1c, 0, 0),
  // S_BON1C
  new State(SpriteNum.Bon1, 3, 6, null, null, StateNum.Bon1d, 0, 0),
  // S_BON1D
  new State(SpriteNum.Bon1, 2, 6, null, null, StateNum.Bon1e, 0, 0),
  // S_BON1E
  new State(SpriteNum.Bon1, 1, 6, null, null, StateNum.Bon1, 0, 0),
  // S_BON2
  new State(SpriteNum.Bon2, 0, 6, null, null, StateNum.Bon2a, 0, 0),
  // S_BON2A
  new State(SpriteNum.Bon2, 1, 6, null, null, StateNum.Bon2b, 0, 0),
  // S_BON2B
  new State(SpriteNum.Bon2, 2, 6, null, null, StateNum.Bon2c, 0, 0),
  // S_BON2C
  new State(SpriteNum.Bon2, 3, 6, null, null, StateNum.Bon2d, 0, 0),
  // S_BON2D
  new State(SpriteNum.Bon2, 2, 6, null, null, StateNum.Bon2e, 0, 0),
  // S_BON2E
  new State(SpriteNum.Bon2, 1, 6, null, null, StateNum.Bon2, 0, 0),
  // S_BKEY
  new State(SpriteNum.Bkey, 0, 10, null, null, StateNum.Bkey2, 0, 0),
  // S_BKEY2
  new State(SpriteNum.Bkey, 32769, 10, null, null, StateNum.Bkey, 0, 0),
  // S_RKEY
  new State(SpriteNum.Rkey, 0, 10, null, null, StateNum.Rkey2, 0, 0),
  // S_RKEY2
  new State(SpriteNum.Rkey, 32769, 10, null, null, StateNum.Rkey, 0, 0),
  // S_YKEY
  new State(SpriteNum.Ykey, 0, 10, null, null, StateNum.Ykey2, 0, 0),
  // S_YKEY2
  new State(SpriteNum.Ykey, 32769, 10, null, null, StateNum.Ykey, 0, 0),
  // S_BSKULL
  new State(SpriteNum.Bsku, 0, 10, null, null, StateNum.Bskull2, 0, 0),
  // S_BSKULL2
  new State(SpriteNum.Bsku, 32769, 10, null, null, StateNum.Bskull, 0, 0),
  // S_RSKULL
  new State(SpriteNum.Rsku, 0, 10, null, null, StateNum.Rskull2, 0, 0),
  // S_RSKULL2
  new State(SpriteNum.Rsku, 32769, 10, null, null, StateNum.Rskull, 0, 0),
  // S_YSKULL
  new State(SpriteNum.Ysku, 0, 10, null, null, StateNum.Yskull2, 0, 0),
  // S_YSKULL2
  new State(SpriteNum.Ysku, 32769, 10, null, null, StateNum.Yskull, 0, 0),
  // S_STIM
  new State(SpriteNum.Stim, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_MEDI
  new State(SpriteNum.Medi, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_SOUL
  new State(SpriteNum.Soul, 32768, 6, null, null, StateNum.Soul2, 0, 0),
  // S_SOUL2
  new State(SpriteNum.Soul, 32769, 6, null, null, StateNum.Soul3, 0, 0),
  // S_SOUL3
  new State(SpriteNum.Soul, 32770, 6, null, null, StateNum.Soul4, 0, 0),
  // S_SOUL4
  new State(SpriteNum.Soul, 32771, 6, null, null, StateNum.Soul5, 0, 0),
  // S_SOUL5
  new State(SpriteNum.Soul, 32770, 6, null, null, StateNum.Soul6, 0, 0),
  // S_SOUL6
  new State(SpriteNum.Soul, 32769, 6, null, null, StateNum.Soul, 0, 0),
  // S_PINV
  new State(SpriteNum.Pinv, 32768, 6, null, null, StateNum.Pinv2, 0, 0),
  // S_PINV2
  new State(SpriteNum.Pinv, 32769, 6, null, null, StateNum.Pinv3, 0, 0),
  // S_PINV3
  new State(SpriteNum.Pinv, 32770, 6, null, null, StateNum.Pinv4, 0, 0),
  // S_PINV4
  new State(SpriteNum.Pinv, 32771, 6, null, null, StateNum.Pinv, 0, 0),
  // S_PSTR
  new State(SpriteNum.Pstr, 32768, -1, null, null, StateNum.Null, 0, 0),
  // S_PINS
  new State(SpriteNum.Pins, 32768, 6, null, null, StateNum.Pins2, 0, 0),
  // S_PINS2
  new State(SpriteNum.Pins, 32769, 6, null, null, StateNum.Pins3, 0, 0),
  // S_PINS3
  new State(SpriteNum.Pins, 32770, 6, null, null, StateNum.Pins4, 0, 0),
  // S_PINS4
  new State(SpriteNum.Pins, 32771, 6, null, null, StateNum.Pins, 0, 0),
  // S_MEGA
  new State(SpriteNum.Mega, 32768, 6, null, null, StateNum.Mega2, 0, 0),
  // S_MEGA2
  new State(SpriteNum.Mega, 32769, 6, null, null, StateNum.Mega3, 0, 0),
  // S_MEGA3
  new State(SpriteNum.Mega, 32770, 6, null, null, StateNum.Mega4, 0, 0),
  // S_MEGA4
  new State(SpriteNum.Mega, 32771, 6, null, null, StateNum.Mega, 0, 0),
  // S_SUIT
  new State(SpriteNum.Suit, 32768, -1, null, null, StateNum.Null, 0, 0),
  // S_PMAP
  new State(SpriteNum.Pmap, 32768, 6, null, null, StateNum.Pmap2, 0, 0),
  // S_PMAP2
  new State(SpriteNum.Pmap, 32769, 6, null, null, StateNum.Pmap3, 0, 0),
  // S_PMAP3
  new State(SpriteNum.Pmap, 32770, 6, null, null, StateNum.Pmap4, 0, 0),
  // S_PMAP4
  new State(SpriteNum.Pmap, 32771, 6, null, null, StateNum.Pmap5, 0, 0),
  // S_PMAP5
  new State(SpriteNum.Pmap, 32770, 6, null, null, StateNum.Pmap6, 0, 0),
  // S_PMAP6
  new State(SpriteNum.Pmap, 32769, 6, null, null, StateNum.Pmap, 0, 0),
  // S_PVIS
  new State(SpriteNum.Pvis, 32768, 6, null, null, StateNum.Pvis2, 0, 0),
  // S_PVIS2
  new State(SpriteNum.Pvis, 1, 6, null, null, StateNum.Pvis, 0, 0),
  // S_CLIP
  new State(SpriteNum.Clip, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_AMMO
  new State(SpriteNum.Ammo, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_ROCK
  new State(SpriteNum.Rock, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_BROK
  new State(SpriteNum.Brok, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_CELL
  new State(SpriteNum.Cell, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_CELP
  new State(SpriteNum.Celp, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_SHEL
  new State(SpriteNum.Shel, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_SBOX
  new State(SpriteNum.Sbox, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_BPAK
  new State(SpriteNum.Bpak, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_BFUG
  new State(SpriteNum.Bfug, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_MGUN
  new State(SpriteNum.Mgun, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_CSAW
  new State(SpriteNum.Csaw, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_LAUN
  new State(SpriteNum.Laun, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_PLAS
  new State(SpriteNum.Plas, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_SHOT
  new State(SpriteNum.Shot, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_SHOT2
  new State(SpriteNum.Sgn2, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_COLU
  new State(SpriteNum.Colu, 32768, -1, null, null, StateNum.Null, 0, 0),
  // S_STALAG
  new State(SpriteNum.Smt2, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_BLOODYTWITCH
  new State(SpriteNum.Gor1, 0, 10, null, null, StateNum.Bloodytwitch2, 0, 0),
  // S_BLOODYTWITCH2
  new State(SpriteNum.Gor1, 1, 15, null, null, StateNum.Bloodytwitch3, 0, 0),
  // S_BLOODYTWITCH3
  new State(SpriteNum.Gor1, 2, 8, null, null, StateNum.Bloodytwitch4, 0, 0),
  // S_BLOODYTWITCH4
  new State(SpriteNum.Gor1, 1, 6, null, null, StateNum.Bloodytwitch, 0, 0),
  // S_DEADTORSO
  new State(SpriteNum.Play, 13, -1, null, null, StateNum.Null, 0, 0),
  // S_DEADBOTTOM
  new State(SpriteNum.Play, 18, -1, null, null, StateNum.Null, 0, 0),
  // S_HEADSONSTICK
  new State(SpriteNum.Pol2, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_GIBS
  new State(SpriteNum.Pol5, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_HEADONASTICK
  new State(SpriteNum.Pol4, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_HEADCANDLES
  new State(SpriteNum.Pol3, 32768, 6, null, null, StateNum.Headcandles2, 0, 0),
  // S_HEADCANDLES2
  new State(SpriteNum.Pol3, 32769, 6, null, null, StateNum.Headcandles, 0, 0),
  // S_DEADSTICK
  new State(SpriteNum.Pol1, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_LIVESTICK
  new State(SpriteNum.Pol6, 0, 6, null, null, StateNum.Livestick2, 0, 0),
  // S_LIVESTICK2
  new State(SpriteNum.Pol6, 1, 8, null, null, StateNum.Livestick, 0, 0),
  // S_MEAT2
  new State(SpriteNum.Gor2, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_MEAT3
  new State(SpriteNum.Gor3, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_MEAT4
  new State(SpriteNum.Gor4, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_MEAT5
  new State(SpriteNum.Gor5, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_STALAGTITE
  new State(SpriteNum.Smit, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_TALLGRNCOL
  new State(SpriteNum.Col1, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_SHRTGRNCOL
  new State(SpriteNum.Col2, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_TALLREDCOL
  new State(SpriteNum.Col3, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_SHRTREDCOL
  new State(SpriteNum.Col4, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_CANDLESTIK
  new State(SpriteNum.Cand, 32768, -1, null, null, StateNum.Null, 0, 0),
  // S_CANDELABRA
  new State(SpriteNum.Cbra, 32768, -1, null, null, StateNum.Null, 0, 0),
  // S_SKULLCOL
  new State(SpriteNum.Col6, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_TORCHTREE
  new State(SpriteNum.Tre1, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_BIGTREE
  new State(SpriteNum.Tre2, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_TECHPILLAR
  new State(SpriteNum.Elec, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_EVILEYE
  new State(SpriteNum.Ceye, 32768, 6, null, null, StateNum.Evileye2, 0, 0),
  // S_EVILEYE2
  new State(SpriteNum.Ceye, 32769, 6, null, null, StateNum.Evileye3, 0, 0),
  // S_EVILEYE3
  new State(SpriteNum.Ceye, 32770, 6, null, null, StateNum.Evileye4, 0, 0),
  // S_EVILEYE4
  new State(SpriteNum.Ceye, 32769, 6, null, null, StateNum.Evileye, 0, 0),
  // S_FLOATSKULL
  new State(SpriteNum.Fsku, 32768, 6, null, null, StateNum.Floatskull2, 0, 0),
  // S_FLOATSKULL2
  new State(SpriteNum.Fsku, 32769, 6, null, null, StateNum.Floatskull3, 0, 0),
  // S_FLOATSKULL3
  new State(SpriteNum.Fsku, 32770, 6, null, null, StateNum.Floatskull, 0, 0),
  // S_HEARTCOL
  new State(SpriteNum.Col5, 0, 14, null, null, StateNum.Heartcol2, 0, 0),
  // S_HEARTCOL2
  new State(SpriteNum.Col5, 1, 14, null, null, StateNum.Heartcol, 0, 0),
  // S_BLUETORCH
  new State(SpriteNum.Tblu, 32768, 4, null, null, StateNum.Bluetorch2, 0, 0),
  // S_BLUETORCH2
  new State(SpriteNum.Tblu, 32769, 4, null, null, StateNum.Bluetorch3, 0, 0),
  // S_BLUETORCH3
  new State(SpriteNum.Tblu, 32770, 4, null, null, StateNum.Bluetorch4, 0, 0),
  // S_BLUETORCH4
  new State(SpriteNum.Tblu, 32771, 4, null, null, StateNum.Bluetorch, 0, 0),
  // S_GREENTORCH
  new State(SpriteNum.Tgrn, 32768, 4, null, null, StateNum.Greentorch2, 0, 0),
  // S_GREENTORCH2
  new State(SpriteNum.Tgrn, 32769, 4, null, null, StateNum.Greentorch3, 0, 0),
  // S_GREENTORCH3
  new State(SpriteNum.Tgrn, 32770, 4, null, null, StateNum.Greentorch4, 0, 0),
  // S_GREENTORCH4
  new State(SpriteNum.Tgrn, 32771, 4, null, null, StateNum.Greentorch, 0, 0),
  // S_REDTORCH
  new State(SpriteNum.Tred, 32768, 4, null, null, StateNum.Redtorch2, 0, 0),
  // S_REDTORCH2
  new State(SpriteNum.Tred, 32769, 4, null, null, StateNum.Redtorch3, 0, 0),
  // S_REDTORCH3
  new State(SpriteNum.Tred, 32770, 4, null, null, StateNum.Redtorch4, 0, 0),
  // S_REDTORCH4
  new State(SpriteNum.Tred, 32771, 4, null, null, StateNum.Redtorch, 0, 0),
  // S_BTORCHSHRT
  new State(SpriteNum.Smbt, 32768, 4, null, null, StateNum.Btorchshrt2, 0, 0),
  // S_BTORCHSHRT2
  new State(SpriteNum.Smbt, 32769, 4, null, null, StateNum.Btorchshrt3, 0, 0),
  // S_BTORCHSHRT3
  new State(SpriteNum.Smbt, 32770, 4, null, null, StateNum.Btorchshrt4, 0, 0),
  // S_BTORCHSHRT4
  new State(SpriteNum.Smbt, 32771, 4, null, null, StateNum.Btorchshrt, 0, 0),
  // S_GTORCHSHRT
  new State(SpriteNum.Smgt, 32768, 4, null, null, StateNum.Gtorchshrt2, 0, 0),
  // S_GTORCHSHRT2
  new State(SpriteNum.Smgt, 32769, 4, null, null, StateNum.Gtorchshrt3, 0, 0),
  // S_GTORCHSHRT3
  new State(SpriteNum.Smgt, 32770, 4, null, null, StateNum.Gtorchshrt4, 0, 0),
  // S_GTORCHSHRT4
  new State(SpriteNum.Smgt, 32771, 4, null, null, StateNum.Gtorchshrt, 0, 0),
  // S_RTORCHSHRT
  new State(SpriteNum.Smrt, 32768, 4, null, null, StateNum.Rtorchshrt2, 0, 0),
  // S_RTORCHSHRT2
  new State(SpriteNum.Smrt, 32769, 4, null, null, StateNum.Rtorchshrt3, 0, 0),
  // S_RTORCHSHRT3
  new State(SpriteNum.Smrt, 32770, 4, null, null, StateNum.Rtorchshrt4, 0, 0),
  // S_RTORCHSHRT4
  new State(SpriteNum.Smrt, 32771, 4, null, null, StateNum.Rtorchshrt, 0, 0),
  // S_HANGNOGUTS
  new State(SpriteNum.Hdb1, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_HANGBNOBRAIN
  new State(SpriteNum.Hdb2, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_HANGTLOOKDN
  new State(SpriteNum.Hdb3, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_HANGTSKULL
  new State(SpriteNum.Hdb4, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_HANGTLOOKUP
  new State(SpriteNum.Hdb5, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_HANGTNOBRAIN
  new State(SpriteNum.Hdb6, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_COLONGIBS
  new State(SpriteNum.Pob1, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_SMALLPOOL
  new State(SpriteNum.Pob2, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_BRAINSTEM
  new State(SpriteNum.Brs1, 0, -1, null, null, StateNum.Null, 0, 0),
  // S_TECHLAMP
  new State(SpriteNum.Tlmp, 32768, 4, null, null, StateNum.Techlamp2, 0, 0),
  // S_TECHLAMP2
  new State(SpriteNum.Tlmp, 32769, 4, null, null, StateNum.Techlamp3, 0, 0),
  // S_TECHLAMP3
  new State(SpriteNum.Tlmp, 32770, 4, null, null, StateNum.Techlamp4, 0, 0),
  // S_TECHLAMP4
  new State(SpriteNum.Tlmp, 32771, 4, null, null, StateNum.Techlamp, 0, 0),
  // S_TECH2LAMP
  new State(SpriteNum.Tlp2, 32768, 4, null, null, StateNum.Tech2lamp2, 0, 0),
  // S_TECH2LAMP2
  new State(SpriteNum.Tlp2, 32769, 4, null, null, StateNum.Tech2lamp3, 0, 0),
  // S_TECH2LAMP3
  new State(SpriteNum.Tlp2, 32770, 4, null, null, StateNum.Tech2lamp4, 0, 0),
  // S_TECH2LAMP4
  new State(SpriteNum.Tlp2, 32771, 4, null, null, StateNum.Tech2lamp, 0, 0),
]
