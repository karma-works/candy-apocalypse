import { Action } from './think'
import { FRACUNIT } from '../misc/fixed'
import { MObjFlag } from '../play/mobj'
import { Sfx } from './sounds'

export const enum SpriteNum {
  Troo,
  Shtg,
  Pung,
  Pisg,
  Pisf,
  Shtf,
  Sht2,
  Chgg,
  Chgf,
  Misg,
  Misf,
  Sawg,
  Plsg,
  Plsf,
  Bfgg,
  Bfgf,
  Blud,
  Puff,
  Bal1,
  Bal2,
  Plss,
  Plse,
  Misl,
  Bfs1,
  Bfe1,
  Bfe2,
  Tfog,
  Ifog,
  Play,
  Poss,
  Spos,
  Vile,
  Fire,
  Fatb,
  Fbxp,
  Skel,
  Manf,
  Fatt,
  Cpos,
  Sarg,
  Head,
  Bal7,
  Boss,
  Bos2,
  Skul,
  Spid,
  Bspi,
  Apls,
  Apbx,
  Cybr,
  Pain,
  Sswv,
  Keen,
  Bbrn,
  Bosf,
  Arm1,
  Arm2,
  Bar1,
  Bexp,
  Fcan,
  Bon1,
  Bon2,
  Bkey,
  Rkey,
  Ykey,
  Bsku,
  Rsku,
  Ysku,
  Stim,
  Medi,
  Soul,
  Pinv,
  Pstr,
  Pins,
  Mega,
  Suit,
  Pmap,
  Pvis,
  Clip,
  Ammo,
  Rock,
  Brok,
  Cell,
  Celp,
  Shel,
  Sbox,
  Bpak,
  Bfug,
  Mgun,
  Csaw,
  Laun,
  Plas,
  Shot,
  Sgn2,
  Colu,
  Smt2,
  Gor1,
  Pol2,
  Pol5,
  Pol4,
  Pol3,
  Pol1,
  Pol6,
  Gor2,
  Gor3,
  Gor4,
  Gor5,
  Smit,
  Col1,
  Col2,
  Col3,
  Col4,
  Cand,
  Cbra,
  Col6,
  Tre1,
  Tre2,
  Elec,
  Ceye,
  Fsku,
  Col5,
  Tblu,
  Tgrn,
  Tred,
  Smbt,
  Smgt,
  Smrt,
  Hdb1,
  Hdb2,
  Hdb3,
  Hdb4,
  Hdb5,
  Hdb6,
  Pob1,
  Pob2,
  Brs1,
  Tlmp,
  Tlp2,
  NUMSPRITES
}

export const enum StateNum {
  Null,
  Lightdone,
  Punch,
  PunchDown,
  PunchUp,
  Punch1,
  Punch2,
  Punch3,
  Punch4,
  Punch5,
  Pistol,
  PistolDown,
  PistolUp,
  Pistol1,
  Pistol2,
  Pistol3,
  Pistol4,
  PistolFlash,
  SGun,
  SGunDown,
  SGunup,
  SGun1,
  Sgun2,
  Sgun3,
  Sgun4,
  Sgun5,
  Sgun6,
  Sgun7,
  Sgun8,
  Sgun9,
  SGunFlash1,
  Sgunflash2,
  DSGun,
  DSGunDown,
  DSGunUp,
  DSGun1,
  Dsgun2,
  Dsgun3,
  Dsgun4,
  Dsgun5,
  Dsgun6,
  Dsgun7,
  Dsgun8,
  Dsgun9,
  Dsgun10,
  Dsnr1,
  Dsnr2,
  DSGunFlash1,
  Dsgunflash2,
  Chain,
  ChainDown,
  ChainUp,
  Chain1,
  Chain2,
  Chain3,
  ChainFlash1,
  Chainflash2,
  Missile,
  MissileDown,
  MissileUp,
  Missile1,
  Missile2,
  Missile3,
  MissileFlash1,
  Missileflash2,
  Missileflash3,
  Missileflash4,
  Saw,
  Sawb,
  SawDown,
  SawUp,
  Saw1,
  Saw2,
  Saw3,
  Plasma,
  PlasmaDown,
  PlasmaUp,
  Plasma1,
  Plasma2,
  PlasmaFlash1,
  Plasmaflash2,
  BFG,
  BFGDown,
  BFGUp,
  BFGg1,
  Bfg2,
  Bfg3,
  Bfg4,
  BFGFlash1,
  Bfgflash2,
  Blood1,
  Blood2,
  Blood3,
  Puff1,
  Puff2,
  Puff3,
  Puff4,
  Tball1,
  Tball2,
  Tballx1,
  Tballx2,
  Tballx3,
  Rball1,
  Rball2,
  Rballx1,
  Rballx2,
  Rballx3,
  Plasball,
  Plasball2,
  Plasexp,
  Plasexp2,
  Plasexp3,
  Plasexp4,
  Plasexp5,
  Rocket,
  Bfgshot,
  Bfgshot2,
  Bfgland,
  Bfgland2,
  Bfgland3,
  Bfgland4,
  Bfgland5,
  Bfgland6,
  Bfgexp,
  Bfgexp2,
  Bfgexp3,
  Bfgexp4,
  Explode1,
  Explode2,
  Explode3,
  Tfog,
  Tfog01,
  Tfog02,
  Tfog2,
  Tfog3,
  Tfog4,
  Tfog5,
  Tfog6,
  Tfog7,
  Tfog8,
  Tfog9,
  Tfog10,
  Ifog,
  Ifog01,
  Ifog02,
  Ifog2,
  Ifog3,
  Ifog4,
  Ifog5,
  Play,
  PlayRun1,
  PlayRun2,
  PlayRun3,
  PlayRun4,
  PlayAtk1,
  PlayAtk2,
  PlayPain,
  PlayPain2,
  PlayDie1,
  PlayDie2,
  PlayDie3,
  PlayDie4,
  PlayDie5,
  PlayDie6,
  PlayDie7,
  PlayXdie1,
  PlayXdie2,
  PlayXdie3,
  PlayXdie4,
  PlayXdie5,
  PlayXdie6,
  PlayXdie7,
  PlayXdie8,
  PlayXdie9,
  PossStnd,
  PossStnd2,
  PossRun1,
  PossRun2,
  PossRun3,
  PossRun4,
  PossRun5,
  PossRun6,
  PossRun7,
  PossRun8,
  PossAtk1,
  PossAtk2,
  PossAtk3,
  PossPain,
  PossPain2,
  PossDie1,
  PossDie2,
  PossDie3,
  PossDie4,
  PossDie5,
  PossXdie1,
  PossXdie2,
  PossXdie3,
  PossXdie4,
  PossXdie5,
  PossXdie6,
  PossXdie7,
  PossXdie8,
  PossXdie9,
  PossRaise1,
  PossRaise2,
  PossRaise3,
  PossRaise4,
  SposStnd,
  SposStnd2,
  SposRun1,
  SposRun2,
  SposRun3,
  SposRun4,
  SposRun5,
  SposRun6,
  SposRun7,
  SposRun8,
  SposAtk1,
  SposAtk2,
  SposAtk3,
  SposPain,
  SposPain2,
  SposDie1,
  SposDie2,
  SposDie3,
  SposDie4,
  SposDie5,
  SposXdie1,
  SposXdie2,
  SposXdie3,
  SposXdie4,
  SposXdie5,
  SposXdie6,
  SposXdie7,
  SposXdie8,
  SposXdie9,
  SposRaise1,
  SposRaise2,
  SposRaise3,
  SposRaise4,
  SposRaise5,
  VileStnd,
  VileStnd2,
  VileRun1,
  VileRun2,
  VileRun3,
  VileRun4,
  VileRun5,
  VileRun6,
  VileRun7,
  VileRun8,
  VileRun9,
  VileRun10,
  VileRun11,
  VileRun12,
  VileAtk1,
  VileAtk2,
  VileAtk3,
  VileAtk4,
  VileAtk5,
  VileAtk6,
  VileAtk7,
  VileAtk8,
  VileAtk9,
  VileAtk10,
  VileAtk11,
  VileHeal1,
  VileHeal2,
  VileHeal3,
  VilePain,
  VilePain2,
  VileDie1,
  VileDie2,
  VileDie3,
  VileDie4,
  VileDie5,
  VileDie6,
  VileDie7,
  VileDie8,
  VileDie9,
  VileDie10,
  Fire1,
  Fire2,
  Fire3,
  Fire4,
  Fire5,
  Fire6,
  Fire7,
  Fire8,
  Fire9,
  Fire10,
  Fire11,
  Fire12,
  Fire13,
  Fire14,
  Fire15,
  Fire16,
  Fire17,
  Fire18,
  Fire19,
  Fire20,
  Fire21,
  Fire22,
  Fire23,
  Fire24,
  Fire25,
  Fire26,
  Fire27,
  Fire28,
  Fire29,
  Fire30,
  Smoke1,
  Smoke2,
  Smoke3,
  Smoke4,
  Smoke5,
  Tracer,
  Tracer2,
  Traceexp1,
  Traceexp2,
  Traceexp3,
  SkelStnd,
  SkelStnd2,
  SkelRun1,
  SkelRun2,
  SkelRun3,
  SkelRun4,
  SkelRun5,
  SkelRun6,
  SkelRun7,
  SkelRun8,
  SkelRun9,
  SkelRun10,
  SkelRun11,
  SkelRun12,
  SkelFist1,
  SkelFist2,
  SkelFist3,
  SkelFist4,
  SkelMiss1,
  SkelMiss2,
  SkelMiss3,
  SkelMiss4,
  SkelPain,
  SkelPain2,
  SkelDie1,
  SkelDie2,
  SkelDie3,
  SkelDie4,
  SkelDie5,
  SkelDie6,
  SkelRaise1,
  SkelRaise2,
  SkelRaise3,
  SkelRaise4,
  SkelRaise5,
  SkelRaise6,
  Fatshot1,
  Fatshot2,
  Fatshotx1,
  Fatshotx2,
  Fatshotx3,
  FattStnd,
  FattStnd2,
  FattRun1,
  FattRun2,
  FattRun3,
  FattRun4,
  FattRun5,
  FattRun6,
  FattRun7,
  FattRun8,
  FattRun9,
  FattRun10,
  FattRun11,
  FattRun12,
  FattAtk1,
  FattAtk2,
  FattAtk3,
  FattAtk4,
  FattAtk5,
  FattAtk6,
  FattAtk7,
  FattAtk8,
  FattAtk9,
  FattAtk10,
  FattPain,
  FattPain2,
  FattDie1,
  FattDie2,
  FattDie3,
  FattDie4,
  FattDie5,
  FattDie6,
  FattDie7,
  FattDie8,
  FattDie9,
  FattDie10,
  FattRaise1,
  FattRaise2,
  FattRaise3,
  FattRaise4,
  FattRaise5,
  FattRaise6,
  FattRaise7,
  FattRaise8,
  CposStnd,
  CposStnd2,
  CposRun1,
  CposRun2,
  CposRun3,
  CposRun4,
  CposRun5,
  CposRun6,
  CposRun7,
  CposRun8,
  CposAtk1,
  CposAtk2,
  CposAtk3,
  CposAtk4,
  CposPain,
  CposPain2,
  CposDie1,
  CposDie2,
  CposDie3,
  CposDie4,
  CposDie5,
  CposDie6,
  CposDie7,
  CposXdie1,
  CposXdie2,
  CposXdie3,
  CposXdie4,
  CposXdie5,
  CposXdie6,
  CposRaise1,
  CposRaise2,
  CposRaise3,
  CposRaise4,
  CposRaise5,
  CposRaise6,
  CposRaise7,
  TrooStnd,
  TrooStnd2,
  TrooRun1,
  TrooRun2,
  TrooRun3,
  TrooRun4,
  TrooRun5,
  TrooRun6,
  TrooRun7,
  TrooRun8,
  TrooAtk1,
  TrooAtk2,
  TrooAtk3,
  TrooPain,
  TrooPain2,
  TrooDie1,
  TrooDie2,
  TrooDie3,
  TrooDie4,
  TrooDie5,
  TrooXdie1,
  TrooXdie2,
  TrooXdie3,
  TrooXdie4,
  TrooXdie5,
  TrooXdie6,
  TrooXdie7,
  TrooXdie8,
  TrooRaise1,
  TrooRaise2,
  TrooRaise3,
  TrooRaise4,
  TrooRaise5,
  SargStnd,
  SargStnd2,
  SargRun1,
  SargRun2,
  SargRun3,
  SargRun4,
  SargRun5,
  SargRun6,
  SargRun7,
  SargRun8,
  SargAtk1,
  SargAtk2,
  SargAtk3,
  SargPain,
  SargPain2,
  SargDie1,
  SargDie2,
  SargDie3,
  SargDie4,
  SargDie5,
  SargDie6,
  SargRaise1,
  SargRaise2,
  SargRaise3,
  SargRaise4,
  SargRaise5,
  SargRaise6,
  HeadStnd,
  HeadRun1,
  HeadAtk1,
  HeadAtk2,
  HeadAtk3,
  HeadPain,
  HeadPain2,
  HeadPain3,
  HeadDie1,
  HeadDie2,
  HeadDie3,
  HeadDie4,
  HeadDie5,
  HeadDie6,
  HeadRaise1,
  HeadRaise2,
  HeadRaise3,
  HeadRaise4,
  HeadRaise5,
  HeadRaise6,
  Brball1,
  Brball2,
  Brballx1,
  Brballx2,
  Brballx3,
  BossStnd,
  BossStnd2,
  BossRun1,
  BossRun2,
  BossRun3,
  BossRun4,
  BossRun5,
  BossRun6,
  BossRun7,
  BossRun8,
  BossAtk1,
  BossAtk2,
  BossAtk3,
  BossPain,
  BossPain2,
  BossDie1,
  BossDie2,
  BossDie3,
  BossDie4,
  BossDie5,
  BossDie6,
  BossDie7,
  BossRaise1,
  BossRaise2,
  BossRaise3,
  BossRaise4,
  BossRaise5,
  BossRaise6,
  BossRaise7,
  Bos2Stnd,
  Bos2Stnd2,
  Bos2Run1,
  Bos2Run2,
  Bos2Run3,
  Bos2Run4,
  Bos2Run5,
  Bos2Run6,
  Bos2Run7,
  Bos2Run8,
  Bos2Atk1,
  Bos2Atk2,
  Bos2Atk3,
  Bos2Pain,
  Bos2Pain2,
  Bos2Die1,
  Bos2Die2,
  Bos2Die3,
  Bos2Die4,
  Bos2Die5,
  Bos2Die6,
  Bos2Die7,
  Bos2Raise1,
  Bos2Raise2,
  Bos2Raise3,
  Bos2Raise4,
  Bos2Raise5,
  Bos2Raise6,
  Bos2Raise7,
  SkullStnd,
  SkullStnd2,
  SkullRun1,
  SkullRun2,
  SkullAtk1,
  SkullAtk2,
  SkullAtk3,
  SkullAtk4,
  SkullPain,
  SkullPain2,
  SkullDie1,
  SkullDie2,
  SkullDie3,
  SkullDie4,
  SkullDie5,
  SkullDie6,
  SpidStnd,
  SpidStnd2,
  SpidRun1,
  SpidRun2,
  SpidRun3,
  SpidRun4,
  SpidRun5,
  SpidRun6,
  SpidRun7,
  SpidRun8,
  SpidRun9,
  SpidRun10,
  SpidRun11,
  SpidRun12,
  SpidAtk1,
  SpidAtk2,
  SpidAtk3,
  SpidAtk4,
  SpidPain,
  SpidPain2,
  SpidDie1,
  SpidDie2,
  SpidDie3,
  SpidDie4,
  SpidDie5,
  SpidDie6,
  SpidDie7,
  SpidDie8,
  SpidDie9,
  SpidDie10,
  SpidDie11,
  BspiStnd,
  BspiStnd2,
  BspiSight,
  BspiRun1,
  BspiRun2,
  BspiRun3,
  BspiRun4,
  BspiRun5,
  BspiRun6,
  BspiRun7,
  BspiRun8,
  BspiRun9,
  BspiRun10,
  BspiRun11,
  BspiRun12,
  BspiAtk1,
  BspiAtk2,
  BspiAtk3,
  BspiAtk4,
  BspiPain,
  BspiPain2,
  BspiDie1,
  BspiDie2,
  BspiDie3,
  BspiDie4,
  BspiDie5,
  BspiDie6,
  BspiDie7,
  BspiRaise1,
  BspiRaise2,
  BspiRaise3,
  BspiRaise4,
  BspiRaise5,
  BspiRaise6,
  BspiRaise7,
  ArachPlaz,
  ArachPlaz2,
  ArachPlex,
  ArachPlex2,
  ArachPlex3,
  ArachPlex4,
  ArachPlex5,
  CyberStnd,
  CyberStnd2,
  CyberRun1,
  CyberRun2,
  CyberRun3,
  CyberRun4,
  CyberRun5,
  CyberRun6,
  CyberRun7,
  CyberRun8,
  CyberAtk1,
  CyberAtk2,
  CyberAtk3,
  CyberAtk4,
  CyberAtk5,
  CyberAtk6,
  CyberPain,
  CyberDie1,
  CyberDie2,
  CyberDie3,
  CyberDie4,
  CyberDie5,
  CyberDie6,
  CyberDie7,
  CyberDie8,
  CyberDie9,
  CyberDie10,
  PainStnd,
  PainRun1,
  PainRun2,
  PainRun3,
  PainRun4,
  PainRun5,
  PainRun6,
  PainAtk1,
  PainAtk2,
  PainAtk3,
  PainAtk4,
  PainPain,
  PainPain2,
  PainDie1,
  PainDie2,
  PainDie3,
  PainDie4,
  PainDie5,
  PainDie6,
  PainRaise1,
  PainRaise2,
  PainRaise3,
  PainRaise4,
  PainRaise5,
  PainRaise6,
  SswvStnd,
  SswvStnd2,
  SswvRun1,
  SswvRun2,
  SswvRun3,
  SswvRun4,
  SswvRun5,
  SswvRun6,
  SswvRun7,
  SswvRun8,
  SswvAtk1,
  SswvAtk2,
  SswvAtk3,
  SswvAtk4,
  SswvAtk5,
  SswvAtk6,
  SswvPain,
  SswvPain2,
  SswvDie1,
  SswvDie2,
  SswvDie3,
  SswvDie4,
  SswvDie5,
  SswvXdie1,
  SswvXdie2,
  SswvXdie3,
  SswvXdie4,
  SswvXdie5,
  SswvXdie6,
  SswvXdie7,
  SswvXdie8,
  SswvXdie9,
  SswvRaise1,
  SswvRaise2,
  SswvRaise3,
  SswvRaise4,
  SswvRaise5,
  Keenstnd,
  Commkeen,
  Commkeen2,
  Commkeen3,
  Commkeen4,
  Commkeen5,
  Commkeen6,
  Commkeen7,
  Commkeen8,
  Commkeen9,
  Commkeen10,
  Commkeen11,
  Commkeen12,
  Keenpain,
  Keenpain2,
  Brain,
  BrainPain,
  BrainDie1,
  BrainDie2,
  BrainDie3,
  BrainDie4,
  Braineye,
  Braineyesee,
  Braineye1,
  Spawn1,
  Spawn2,
  Spawn3,
  Spawn4,
  Spawnfire1,
  Spawnfire2,
  Spawnfire3,
  Spawnfire4,
  Spawnfire5,
  Spawnfire6,
  Spawnfire7,
  Spawnfire8,
  Brainexplode1,
  Brainexplode2,
  Brainexplode3,
  Arm1,
  Arm1a,
  Arm2,
  Arm2a,
  Bar1,
  Bar2,
  Bexp,
  Bexp2,
  Bexp3,
  Bexp4,
  Bexp5,
  Bbar1,
  Bbar2,
  Bbar3,
  Bon1,
  Bon1a,
  Bon1b,
  Bon1c,
  Bon1d,
  Bon1e,
  Bon2,
  Bon2a,
  Bon2b,
  Bon2c,
  Bon2d,
  Bon2e,
  Bkey,
  Bkey2,
  Rkey,
  Rkey2,
  Ykey,
  Ykey2,
  Bskull,
  Bskull2,
  Rskull,
  Rskull2,
  Yskull,
  Yskull2,
  Stim,
  Medi,
  Soul,
  Soul2,
  Soul3,
  Soul4,
  Soul5,
  Soul6,
  Pinv,
  Pinv2,
  Pinv3,
  Pinv4,
  Pstr,
  Pins,
  Pins2,
  Pins3,
  Pins4,
  Mega,
  Mega2,
  Mega3,
  Mega4,
  Suit,
  Pmap,
  Pmap2,
  Pmap3,
  Pmap4,
  Pmap5,
  Pmap6,
  Pvis,
  Pvis2,
  Clip,
  Ammo,
  Rock,
  Brok,
  Cell,
  Celp,
  Shel,
  Sbox,
  Bpak,
  Bfug,
  Mgun,
  Csaw,
  Laun,
  Plas,
  Shot,
  Shot2,
  Colu,
  Stalag,
  Bloodytwitch,
  Bloodytwitch2,
  Bloodytwitch3,
  Bloodytwitch4,
  Deadtorso,
  Deadbottom,
  Headsonstick,
  Gibs,
  Headonastick,
  Headcandles,
  Headcandles2,
  Deadstick,
  Livestick,
  Livestick2,
  Meat2,
  Meat3,
  Meat4,
  Meat5,
  Stalagtite,
  Tallgrncol,
  Shrtgrncol,
  Tallredcol,
  Shrtredcol,
  Candlestik,
  Candelabra,
  Skullcol,
  Torchtree,
  Bigtree,
  Techpillar,
  Evileye,
  Evileye2,
  Evileye3,
  Evileye4,
  Floatskull,
  Floatskull2,
  Floatskull3,
  Heartcol,
  Heartcol2,
  Bluetorch,
  Bluetorch2,
  Bluetorch3,
  Bluetorch4,
  Greentorch,
  Greentorch2,
  Greentorch3,
  Greentorch4,
  Redtorch,
  Redtorch2,
  Redtorch3,
  Redtorch4,
  Btorchshrt,
  Btorchshrt2,
  Btorchshrt3,
  Btorchshrt4,
  Gtorchshrt,
  Gtorchshrt2,
  Gtorchshrt3,
  Gtorchshrt4,
  Rtorchshrt,
  Rtorchshrt2,
  Rtorchshrt3,
  Rtorchshrt4,
  Hangnoguts,
  Hangbnobrain,
  Hangtlookdn,
  Hangtskull,
  Hangtlookup,
  Hangtnobrain,
  Colongibs,
  Smallpool,
  Brainstem,
  Techlamp,
  Techlamp2,
  Techlamp3,
  Techlamp4,
  Tech2lamp,
  Tech2lamp2,
  Tech2lamp3,
  Tech2lamp4,
  NUMSTATES
}

export class State {
  constructor(
    public sprite: SpriteNum,
    public frame: number,
    public tics: number,
    public action: Action | null,
    public nextState: StateNum,
    public misc1: number,
    public misc2: number,
  ) { }
}

export const enum MObjType {
  Player,
  Possessed,
  Shotguy,
  Vile,
  Fire,
  Undead,
  Tracer,
  Smoke,
  Fatso,
  Fatshot,
  Chainguy,
  Troop,
  Sergeant,
  Shadows,
  Head,
  Bruiser,
  Bruisershot,
  Knight,
  Skull,
  Spider,
  Baby,
  Cyborg,
  Pain,
  Wolfss,
  Keen,
  Bossbrain,
  Bossspit,
  Bosstarget,
  Spawnshot,
  Spawnfire,
  Barrel,
  Troopshot,
  Headshot,
  Rocket,
  Plasma,
  Bfg,
  Arachplaz,
  Puff,
  Blood,
  Tfog,
  Ifog,
  Teleportman,
  Extrabfg,
  Misc0,
  Misc1,
  Misc2,
  Misc3,
  Misc4,
  Misc5,
  Misc6,
  Misc7,
  Misc8,
  Misc9,
  Misc10,
  Misc11,
  Misc12,
  Inv,
  Misc13,
  Ins,
  Misc14,
  Misc15,
  Misc16,
  Mega,
  Clip,
  Misc17,
  Misc18,
  Misc19,
  Misc20,
  Misc21,
  Misc22,
  Misc23,
  Misc24,
  Misc25,
  Chaingun,
  Misc26,
  Misc27,
  Misc28,
  Shotgun,
  Supershotgun,
  Misc29,
  Misc30,
  Misc31,
  Misc32,
  Misc33,
  Misc34,
  Misc35,
  Misc36,
  Misc37,
  Misc38,
  Misc39,
  Misc40,
  Misc41,
  Misc42,
  Misc43,
  Misc44,
  Misc45,
  Misc46,
  Misc47,
  Misc48,
  Misc49,
  Misc50,
  Misc51,
  Misc52,
  Misc53,
  Misc54,
  Misc55,
  Misc56,
  Misc57,
  Misc58,
  Misc59,
  Misc60,
  Misc61,
  Misc62,
  Misc63,
  Misc64,
  Misc65,
  Misc66,
  Misc67,
  Misc68,
  Misc69,
  Misc70,
  Misc71,
  Misc72,
  Misc73,
  Misc74,
  Misc75,
  Misc76,
  Misc77,
  Misc78,
  Misc79,
  Misc80,
  Misc81,
  Misc82,
  Misc83,
  Misc84,
  Misc85,
  Misc86,
  NUMMOBJTYPES
}

export class MObjInfo {
  constructor(
    public doomedNum: number,
    public spawnState: StateNum,
    public spawnHealth: number,
    public seeState: StateNum,
    public seeSound: Sfx,
    public reactionTime: number,
    public attackSound: Sfx,
    public painState: StateNum,
    public painChance: number,
    public painSound: Sfx,
    public meleeState: StateNum,
    public missileState: StateNum,
    public deathState: StateNum,
    public xdeathState: StateNum,
    public deathSound: Sfx,
    public speed: number,
    public radius: number,
    public height: number,
    public mass: number,
    public damage: number,
    public activeSound: Sfx,
    public flags: number,
    public raiseState: StateNum,
  ) { }
}

export const sprNames = [
  'TROO', 'SHTG', 'PUNG', 'PISG', 'PISF', 'SHTF', 'SHT2', 'CHGG', 'CHGF', 'MISG',
  'MISF', 'SAWG', 'PLSG', 'PLSF', 'BFGG', 'BFGF', 'BLUD', 'PUFF', 'BAL1', 'BAL2',
  'PLSS', 'PLSE', 'MISL', 'BFS1', 'BFE1', 'BFE2', 'TFOG', 'IFOG', 'PLAY', 'POSS',
  'SPOS', 'VILE', 'FIRE', 'FATB', 'FBXP', 'SKEL', 'MANF', 'FATT', 'CPOS', 'SARG',
  'HEAD', 'BAL7', 'BOSS', 'BOS2', 'SKUL', 'SPID', 'BSPI', 'APLS', 'APBX', 'CYBR',
  'PAIN', 'SSWV', 'KEEN', 'BBRN', 'BOSF', 'ARM1', 'ARM2', 'BAR1', 'BEXP', 'FCAN',
  'BON1', 'BON2', 'BKEY', 'RKEY', 'YKEY', 'BSKU', 'RSKU', 'YSKU', 'STIM', 'MEDI',
  'SOUL', 'PINV', 'PSTR', 'PINS', 'MEGA', 'SUIT', 'PMAP', 'PVIS', 'CLIP', 'AMMO',
  'ROCK', 'BROK', 'CELL', 'CELP', 'SHEL', 'SBOX', 'BPAK', 'BFUG', 'MGUN', 'CSAW',
  'LAUN', 'PLAS', 'SHOT', 'SGN2', 'COLU', 'SMT2', 'GOR1', 'POL2', 'POL5', 'POL4',
  'POL3', 'POL1', 'POL6', 'GOR2', 'GOR3', 'GOR4', 'GOR5', 'SMIT', 'COL1', 'COL2',
  'COL3', 'COL4', 'CAND', 'CBRA', 'COL6', 'TRE1', 'TRE2', 'ELEC', 'CEYE', 'FSKU',
  'COL5', 'TBLU', 'TGRN', 'TRED', 'SMBT', 'SMGT', 'SMRT', 'HDB1', 'HDB2', 'HDB3',
  'HDB4', 'HDB5', 'HDB6', 'POB1', 'POB2', 'BRS1', 'TLMP', 'TLP2',
]

export const states = [
  // S_NULL
  new State(SpriteNum.Troo, 0, -1, null, StateNum.Null, 0, 0),
  // S_LIGHTDONE
  new State(SpriteNum.Shtg, 4, 0, null/* A_Light0 */, StateNum.Null, 0, 0),
  // S_PUNCH
  new State(SpriteNum.Pung, 0, 1, null/* A_WeaponReady */, StateNum.Punch, 0, 0),
  // S_PUNCHDOWN
  new State(SpriteNum.Pung, 0, 1, null/* A_Lower */, StateNum.PunchDown, 0, 0),
  // S_PUNCHUP
  new State(SpriteNum.Pung, 0, 1, null/* A_Raise */, StateNum.PunchUp, 0, 0),
  // S_PUNCH1
  new State(SpriteNum.Pung, 1, 4, null, StateNum.Punch2, 0, 0),
  // S_PUNCH2
  new State(SpriteNum.Pung, 2, 4, null/* A_Punch */, StateNum.Punch3, 0, 0),
  // S_PUNCH3
  new State(SpriteNum.Pung, 3, 5, null, StateNum.Punch4, 0, 0),
  // S_PUNCH4
  new State(SpriteNum.Pung, 2, 4, null, StateNum.Punch5, 0, 0),
  // S_PUNCH5
  new State(SpriteNum.Pung, 1, 5, null/* A_ReFire */, StateNum.Punch, 0, 0),
  // S_PISTOL
  new State(SpriteNum.Pisg, 0, 1, null/* A_WeaponReady */, StateNum.Pistol, 0, 0),
  // S_PISTOLDOWN
  new State(SpriteNum.Pisg, 0, 1, null/* A_Lower */, StateNum.PistolDown, 0, 0),
  // S_PISTOLUP
  new State(SpriteNum.Pisg, 0, 1, null/* A_Raise */, StateNum.PistolUp, 0, 0),
  // S_PISTOL1
  new State(SpriteNum.Pisg, 0, 4, null, StateNum.Pistol2, 0, 0),
  // S_PISTOL2
  new State(SpriteNum.Pisg, 1, 6, null/* A_FirePistol */, StateNum.Pistol3, 0, 0),
  // S_PISTOL3
  new State(SpriteNum.Pisg, 2, 4, null, StateNum.Pistol4, 0, 0),
  // S_PISTOL4
  new State(SpriteNum.Pisg, 1, 5, null/* A_ReFire */, StateNum.Pistol, 0, 0),
  // S_PISTOLFLASH
  new State(SpriteNum.Pisf, 32768, 7, null/* A_Light1 */, StateNum.Lightdone, 0, 0),
  // S_SGUN
  new State(SpriteNum.Shtg, 0, 1, null/* A_WeaponReady */, StateNum.SGun, 0, 0),
  // S_SGUNDOWN
  new State(SpriteNum.Shtg, 0, 1, null/* A_Lower */, StateNum.SGunDown, 0, 0),
  // S_SGUNUP
  new State(SpriteNum.Shtg, 0, 1, null/* A_Raise */, StateNum.SGunup, 0, 0),
  // S_SGUN1
  new State(SpriteNum.Shtg, 0, 3, null, StateNum.Sgun2, 0, 0),
  // S_SGUN2
  new State(SpriteNum.Shtg, 0, 7, null/* A_FireShotgun */, StateNum.Sgun3, 0, 0),
  // S_SGUN3
  new State(SpriteNum.Shtg, 1, 5, null, StateNum.Sgun4, 0, 0),
  // S_SGUN4
  new State(SpriteNum.Shtg, 2, 5, null, StateNum.Sgun5, 0, 0),
  // S_SGUN5
  new State(SpriteNum.Shtg, 3, 4, null, StateNum.Sgun6, 0, 0),
  // S_SGUN6
  new State(SpriteNum.Shtg, 2, 5, null, StateNum.Sgun7, 0, 0),
  // S_SGUN7
  new State(SpriteNum.Shtg, 1, 5, null, StateNum.Sgun8, 0, 0),
  // S_SGUN8
  new State(SpriteNum.Shtg, 0, 3, null, StateNum.Sgun9, 0, 0),
  // S_SGUN9
  new State(SpriteNum.Shtg, 0, 7, null/* A_ReFire */, StateNum.SGun, 0, 0),
  // S_SGUNFLASH1
  new State(SpriteNum.Shtf, 32768, 4, null/* A_Light1 */, StateNum.Sgunflash2, 0, 0),
  // S_SGUNFLASH2
  new State(SpriteNum.Shtf, 32769, 3, null/* A_Light2 */, StateNum.Lightdone, 0, 0),
  // S_DSGUN
  new State(SpriteNum.Sht2, 0, 1, null/* A_WeaponReady */, StateNum.DSGun, 0, 0),
  // S_DSGUNDOWN
  new State(SpriteNum.Sht2, 0, 1, null/* A_Lower */, StateNum.DSGunDown, 0, 0),
  // S_DSGUNUP
  new State(SpriteNum.Sht2, 0, 1, null/* A_Raise */, StateNum.DSGunUp, 0, 0),
  // S_DSGUN1
  new State(SpriteNum.Sht2, 0, 3, null, StateNum.Dsgun2, 0, 0),
  // S_DSGUN2
  new State(SpriteNum.Sht2, 0, 7, null/* A_FireShotgun2 */, StateNum.Dsgun3, 0, 0),
  // S_DSGUN3
  new State(SpriteNum.Sht2, 1, 7, null, StateNum.Dsgun4, 0, 0),
  // S_DSGUN4
  new State(SpriteNum.Sht2, 2, 7, null/* A_CheckReload */, StateNum.Dsgun5, 0, 0),
  // S_DSGUN5
  new State(SpriteNum.Sht2, 3, 7, null/* A_OpenShotgun2 */, StateNum.Dsgun6, 0, 0),
  // S_DSGUN6
  new State(SpriteNum.Sht2, 4, 7, null, StateNum.Dsgun7, 0, 0),
  // S_DSGUN7
  new State(SpriteNum.Sht2, 5, 7, null/* A_LoadShotgun2 */, StateNum.Dsgun8, 0, 0),
  // S_DSGUN8
  new State(SpriteNum.Sht2, 6, 6, null, StateNum.Dsgun9, 0, 0),
  // S_DSGUN9
  new State(SpriteNum.Sht2, 7, 6, null/* A_CloseShotgun2 */, StateNum.Dsgun10, 0, 0),
  // S_DSGUN10
  new State(SpriteNum.Sht2, 0, 5, null/* A_ReFire */, StateNum.DSGun, 0, 0),
  // S_DSNR1
  new State(SpriteNum.Sht2, 1, 7, null, StateNum.Dsnr2, 0, 0),
  // S_DSNR2
  new State(SpriteNum.Sht2, 0, 3, null, StateNum.DSGunDown, 0, 0),
  // S_DSGUNFLASH1
  new State(SpriteNum.Sht2, 32776, 5, null/* A_Light1 */, StateNum.Dsgunflash2, 0, 0),
  // S_DSGUNFLASH2
  new State(SpriteNum.Sht2, 32777, 4, null/* A_Light2 */, StateNum.Lightdone, 0, 0),
  // S_CHAIN
  new State(SpriteNum.Chgg, 0, 1, null/* A_WeaponReady */, StateNum.Chain, 0, 0),
  // S_CHAINDOWN
  new State(SpriteNum.Chgg, 0, 1, null/* A_Lower */, StateNum.ChainDown, 0, 0),
  // S_CHAINUP
  new State(SpriteNum.Chgg, 0, 1, null/* A_Raise */, StateNum.ChainUp, 0, 0),
  // S_CHAIN1
  new State(SpriteNum.Chgg, 0, 4, null/* A_FireCGun */, StateNum.Chain2, 0, 0),
  // S_CHAIN2
  new State(SpriteNum.Chgg, 1, 4, null/* A_FireCGun */, StateNum.Chain3, 0, 0),
  // S_CHAIN3
  new State(SpriteNum.Chgg, 1, 0, null/* A_ReFire */, StateNum.Chain, 0, 0),
  // S_CHAINFLASH1
  new State(SpriteNum.Chgf, 32768, 5, null/* A_Light1 */, StateNum.Lightdone, 0, 0),
  // S_CHAINFLASH2
  new State(SpriteNum.Chgf, 32769, 5, null/* A_Light2 */, StateNum.Lightdone, 0, 0),
  // S_MISSILE
  new State(SpriteNum.Misg, 0, 1, null/* A_WeaponReady */, StateNum.Missile, 0, 0),
  // S_MISSILEDOWN
  new State(SpriteNum.Misg, 0, 1, null/* A_Lower */, StateNum.MissileDown, 0, 0),
  // S_MISSILEUP
  new State(SpriteNum.Misg, 0, 1, null/* A_Raise */, StateNum.MissileUp, 0, 0),
  // S_MISSILE1
  new State(SpriteNum.Misg, 1, 8, null/* A_GunFlash */, StateNum.Missile2, 0, 0),
  // S_MISSILE2
  new State(SpriteNum.Misg, 1, 12, null/* A_FireMissile */, StateNum.Missile3, 0, 0),
  // S_MISSILE3
  new State(SpriteNum.Misg, 1, 0, null/* A_ReFire */, StateNum.Missile, 0, 0),
  // S_MISSILEFLASH1
  new State(SpriteNum.Misf, 32768, 3, null/* A_Light1 */, StateNum.Missileflash2, 0, 0),
  // S_MISSILEFLASH2
  new State(SpriteNum.Misf, 32769, 4, null, StateNum.Missileflash3, 0, 0),
  // S_MISSILEFLASH3
  new State(SpriteNum.Misf, 32770, 4, null/* A_Light2 */, StateNum.Missileflash4, 0, 0),
  // S_MISSILEFLASH4
  new State(SpriteNum.Misf, 32771, 4, null/* A_Light2 */, StateNum.Lightdone, 0, 0),
  // S_SAW
  new State(SpriteNum.Sawg, 2, 4, null/* A_WeaponReady */, StateNum.Sawb, 0, 0),
  // S_SAWB
  new State(SpriteNum.Sawg, 3, 4, null/* A_WeaponReady */, StateNum.Saw, 0, 0),
  // S_SAWDOWN
  new State(SpriteNum.Sawg, 2, 1, null/* A_Lower */, StateNum.SawDown, 0, 0),
  // S_SAWUP
  new State(SpriteNum.Sawg, 2, 1, null/* A_Raise */, StateNum.SawUp, 0, 0),
  // S_SAW1
  new State(SpriteNum.Sawg, 0, 4, null/* A_Saw */, StateNum.Saw2, 0, 0),
  // S_SAW2
  new State(SpriteNum.Sawg, 1, 4, null/* A_Saw */, StateNum.Saw3, 0, 0),
  // S_SAW3
  new State(SpriteNum.Sawg, 1, 0, null/* A_ReFire */, StateNum.Saw, 0, 0),
  // S_PLASMA
  new State(SpriteNum.Plsg, 0, 1, null/* A_WeaponReady */, StateNum.Plasma, 0, 0),
  // S_PLASMADOWN
  new State(SpriteNum.Plsg, 0, 1, null/* A_Lower */, StateNum.PlasmaDown, 0, 0),
  // S_PLASMAUP
  new State(SpriteNum.Plsg, 0, 1, null/* A_Raise */, StateNum.PlasmaUp, 0, 0),
  // S_PLASMA1
  new State(SpriteNum.Plsg, 0, 3, null/* A_FirePlasma */, StateNum.Plasma2, 0, 0),
  // S_PLASMA2
  new State(SpriteNum.Plsg, 1, 20, null/* A_ReFire */, StateNum.Plasma, 0, 0),
  // S_PLASMAFLASH1
  new State(SpriteNum.Plsf, 32768, 4, null/* A_Light1 */, StateNum.Lightdone, 0, 0),
  // S_PLASMAFLASH2
  new State(SpriteNum.Plsf, 32769, 4, null/* A_Light1 */, StateNum.Lightdone, 0, 0),
  // S_BFG
  new State(SpriteNum.Bfgg, 0, 1, null/* A_WeaponReady */, StateNum.BFG, 0, 0),
  // S_BFGDOWN
  new State(SpriteNum.Bfgg, 0, 1, null/* A_Lower */, StateNum.BFGDown, 0, 0),
  // S_BFGUP
  new State(SpriteNum.Bfgg, 0, 1, null/* A_Raise */, StateNum.BFGUp, 0, 0),
  // S_BFG1
  new State(SpriteNum.Bfgg, 0, 20, null/* A_BFGsound */, StateNum.Bfg2, 0, 0),
  // S_BFG2
  new State(SpriteNum.Bfgg, 1, 10, null/* A_GunFlash */, StateNum.Bfg3, 0, 0),
  // S_BFG3
  new State(SpriteNum.Bfgg, 1, 10, null/* A_FireBFG */, StateNum.Bfg4, 0, 0),
  // S_BFG4
  new State(SpriteNum.Bfgg, 1, 20, null/* A_ReFire */, StateNum.BFG, 0, 0),
  // S_BFGFLASH1
  new State(SpriteNum.Bfgf, 32768, 11, null/* A_Light1 */, StateNum.Bfgflash2, 0, 0),
  // S_BFGFLASH2
  new State(SpriteNum.Bfgf, 32769, 6, null/* A_Light2 */, StateNum.Lightdone, 0, 0),
  // S_BLOOD1
  new State(SpriteNum.Blud, 2, 8, null, StateNum.Blood2, 0, 0),
  // S_BLOOD2
  new State(SpriteNum.Blud, 1, 8, null, StateNum.Blood3, 0, 0),
  // S_BLOOD3
  new State(SpriteNum.Blud, 0, 8, null, StateNum.Null, 0, 0),
  // S_PUFF1
  new State(SpriteNum.Puff, 32768, 4, null, StateNum.Puff2, 0, 0),
  // S_PUFF2
  new State(SpriteNum.Puff, 1, 4, null, StateNum.Puff3, 0, 0),
  // S_PUFF3
  new State(SpriteNum.Puff, 2, 4, null, StateNum.Puff4, 0, 0),
  // S_PUFF4
  new State(SpriteNum.Puff, 3, 4, null, StateNum.Null, 0, 0),
  // S_TBALL1
  new State(SpriteNum.Bal1, 32768, 4, null, StateNum.Tball2, 0, 0),
  // S_TBALL2
  new State(SpriteNum.Bal1, 32769, 4, null, StateNum.Tball1, 0, 0),
  // S_TBALLX1
  new State(SpriteNum.Bal1, 32770, 6, null, StateNum.Tballx2, 0, 0),
  // S_TBALLX2
  new State(SpriteNum.Bal1, 32771, 6, null, StateNum.Tballx3, 0, 0),
  // S_TBALLX3
  new State(SpriteNum.Bal1, 32772, 6, null, StateNum.Null, 0, 0),
  // S_RBALL1
  new State(SpriteNum.Bal2, 32768, 4, null, StateNum.Rball2, 0, 0),
  // S_RBALL2
  new State(SpriteNum.Bal2, 32769, 4, null, StateNum.Rball1, 0, 0),
  // S_RBALLX1
  new State(SpriteNum.Bal2, 32770, 6, null, StateNum.Rballx2, 0, 0),
  // S_RBALLX2
  new State(SpriteNum.Bal2, 32771, 6, null, StateNum.Rballx3, 0, 0),
  // S_RBALLX3
  new State(SpriteNum.Bal2, 32772, 6, null, StateNum.Null, 0, 0),
  // S_PLASBALL
  new State(SpriteNum.Plss, 32768, 6, null, StateNum.Plasball2, 0, 0),
  // S_PLASBALL2
  new State(SpriteNum.Plss, 32769, 6, null, StateNum.Plasball, 0, 0),
  // S_PLASEXP
  new State(SpriteNum.Plse, 32768, 4, null, StateNum.Plasexp2, 0, 0),
  // S_PLASEXP2
  new State(SpriteNum.Plse, 32769, 4, null, StateNum.Plasexp3, 0, 0),
  // S_PLASEXP3
  new State(SpriteNum.Plse, 32770, 4, null, StateNum.Plasexp4, 0, 0),
  // S_PLASEXP4
  new State(SpriteNum.Plse, 32771, 4, null, StateNum.Plasexp5, 0, 0),
  // S_PLASEXP5
  new State(SpriteNum.Plse, 32772, 4, null, StateNum.Null, 0, 0),
  // S_ROCKET
  new State(SpriteNum.Misl, 32768, 1, null, StateNum.Rocket, 0, 0),
  // S_BFGSHOT
  new State(SpriteNum.Bfs1, 32768, 4, null, StateNum.Bfgshot2, 0, 0),
  // S_BFGSHOT2
  new State(SpriteNum.Bfs1, 32769, 4, null, StateNum.Bfgshot, 0, 0),
  // S_BFGLAND
  new State(SpriteNum.Bfe1, 32768, 8, null, StateNum.Bfgland2, 0, 0),
  // S_BFGLAND2
  new State(SpriteNum.Bfe1, 32769, 8, null, StateNum.Bfgland3, 0, 0),
  // S_BFGLAND3
  new State(SpriteNum.Bfe1, 32770, 8, null/* A_BFGSpray */, StateNum.Bfgland4, 0, 0),
  // S_BFGLAND4
  new State(SpriteNum.Bfe1, 32771, 8, null, StateNum.Bfgland5, 0, 0),
  // S_BFGLAND5
  new State(SpriteNum.Bfe1, 32772, 8, null, StateNum.Bfgland6, 0, 0),
  // S_BFGLAND6
  new State(SpriteNum.Bfe1, 32773, 8, null, StateNum.Null, 0, 0),
  // S_BFGEXP
  new State(SpriteNum.Bfe2, 32768, 8, null, StateNum.Bfgexp2, 0, 0),
  // S_BFGEXP2
  new State(SpriteNum.Bfe2, 32769, 8, null, StateNum.Bfgexp3, 0, 0),
  // S_BFGEXP3
  new State(SpriteNum.Bfe2, 32770, 8, null, StateNum.Bfgexp4, 0, 0),
  // S_BFGEXP4
  new State(SpriteNum.Bfe2, 32771, 8, null, StateNum.Null, 0, 0),
  // S_EXPLODE1
  new State(SpriteNum.Misl, 32769, 8, null/* A_Explode */, StateNum.Explode2, 0, 0),
  // S_EXPLODE2
  new State(SpriteNum.Misl, 32770, 6, null, StateNum.Explode3, 0, 0),
  // S_EXPLODE3
  new State(SpriteNum.Misl, 32771, 4, null, StateNum.Null, 0, 0),
  // S_TFOG
  new State(SpriteNum.Tfog, 32768, 6, null, StateNum.Tfog01, 0, 0),
  // S_TFOG01
  new State(SpriteNum.Tfog, 32769, 6, null, StateNum.Tfog02, 0, 0),
  // S_TFOG02
  new State(SpriteNum.Tfog, 32768, 6, null, StateNum.Tfog2, 0, 0),
  // S_TFOG2
  new State(SpriteNum.Tfog, 32769, 6, null, StateNum.Tfog3, 0, 0),
  // S_TFOG3
  new State(SpriteNum.Tfog, 32770, 6, null, StateNum.Tfog4, 0, 0),
  // S_TFOG4
  new State(SpriteNum.Tfog, 32771, 6, null, StateNum.Tfog5, 0, 0),
  // S_TFOG5
  new State(SpriteNum.Tfog, 32772, 6, null, StateNum.Tfog6, 0, 0),
  // S_TFOG6
  new State(SpriteNum.Tfog, 32773, 6, null, StateNum.Tfog7, 0, 0),
  // S_TFOG7
  new State(SpriteNum.Tfog, 32774, 6, null, StateNum.Tfog8, 0, 0),
  // S_TFOG8
  new State(SpriteNum.Tfog, 32775, 6, null, StateNum.Tfog9, 0, 0),
  // S_TFOG9
  new State(SpriteNum.Tfog, 32776, 6, null, StateNum.Tfog10, 0, 0),
  // S_TFOG10
  new State(SpriteNum.Tfog, 32777, 6, null, StateNum.Null, 0, 0),
  // S_IFOG
  new State(SpriteNum.Ifog, 32768, 6, null, StateNum.Ifog01, 0, 0),
  // S_IFOG01
  new State(SpriteNum.Ifog, 32769, 6, null, StateNum.Ifog02, 0, 0),
  // S_IFOG02
  new State(SpriteNum.Ifog, 32768, 6, null, StateNum.Ifog2, 0, 0),
  // S_IFOG2
  new State(SpriteNum.Ifog, 32769, 6, null, StateNum.Ifog3, 0, 0),
  // S_IFOG3
  new State(SpriteNum.Ifog, 32770, 6, null, StateNum.Ifog4, 0, 0),
  // S_IFOG4
  new State(SpriteNum.Ifog, 32771, 6, null, StateNum.Ifog5, 0, 0),
  // S_IFOG5
  new State(SpriteNum.Ifog, 32772, 6, null, StateNum.Null, 0, 0),
  // S_PLAY
  new State(SpriteNum.Play, 0, -1, null, StateNum.Null, 0, 0),
  // S_PLAY_RUN1
  new State(SpriteNum.Play, 0, 4, null, StateNum.PlayRun2, 0, 0),
  // S_PLAY_RUN2
  new State(SpriteNum.Play, 1, 4, null, StateNum.PlayRun3, 0, 0),
  // S_PLAY_RUN3
  new State(SpriteNum.Play, 2, 4, null, StateNum.PlayRun4, 0, 0),
  // S_PLAY_RUN4
  new State(SpriteNum.Play, 3, 4, null, StateNum.PlayRun1, 0, 0),
  // S_PLAY_ATK1
  new State(SpriteNum.Play, 4, 12, null, StateNum.Play, 0, 0),
  // S_PLAY_ATK2
  new State(SpriteNum.Play, 32773, 6, null, StateNum.PlayAtk1, 0, 0),
  // S_PLAY_PAIN
  new State(SpriteNum.Play, 6, 4, null, StateNum.PlayPain2, 0, 0),
  // S_PLAY_PAIN2
  new State(SpriteNum.Play, 6, 4, null/* A_Pain */, StateNum.Play, 0, 0),
  // S_PLAY_DIE1
  new State(SpriteNum.Play, 7, 10, null, StateNum.PlayDie2, 0, 0),
  // S_PLAY_DIE2
  new State(SpriteNum.Play, 8, 10, null/* A_PlayerScream */, StateNum.PlayDie3, 0, 0),
  // S_PLAY_DIE3
  new State(SpriteNum.Play, 9, 10, null/* A_Fall */, StateNum.PlayDie4, 0, 0),
  // S_PLAY_DIE4
  new State(SpriteNum.Play, 10, 10, null, StateNum.PlayDie5, 0, 0),
  // S_PLAY_DIE5
  new State(SpriteNum.Play, 11, 10, null, StateNum.PlayDie6, 0, 0),
  // S_PLAY_DIE6
  new State(SpriteNum.Play, 12, 10, null, StateNum.PlayDie7, 0, 0),
  // S_PLAY_DIE7
  new State(SpriteNum.Play, 13, -1, null, StateNum.Null, 0, 0),
  // S_PLAY_XDIE1
  new State(SpriteNum.Play, 14, 5, null, StateNum.PlayXdie2, 0, 0),
  // S_PLAY_XDIE2
  new State(SpriteNum.Play, 15, 5, null/* A_XScream */, StateNum.PlayXdie3, 0, 0),
  // S_PLAY_XDIE3
  new State(SpriteNum.Play, 16, 5, null/* A_Fall */, StateNum.PlayXdie4, 0, 0),
  // S_PLAY_XDIE4
  new State(SpriteNum.Play, 17, 5, null, StateNum.PlayXdie5, 0, 0),
  // S_PLAY_XDIE5
  new State(SpriteNum.Play, 18, 5, null, StateNum.PlayXdie6, 0, 0),
  // S_PLAY_XDIE6
  new State(SpriteNum.Play, 19, 5, null, StateNum.PlayXdie7, 0, 0),
  // S_PLAY_XDIE7
  new State(SpriteNum.Play, 20, 5, null, StateNum.PlayXdie8, 0, 0),
  // S_PLAY_XDIE8
  new State(SpriteNum.Play, 21, 5, null, StateNum.PlayXdie9, 0, 0),
  // S_PLAY_XDIE9
  new State(SpriteNum.Play, 22, -1, null, StateNum.Null, 0, 0),
  // S_POSS_STND
  new State(SpriteNum.Poss, 0, 10, null/* A_Look */, StateNum.PossStnd2, 0, 0),
  // S_POSS_STND2
  new State(SpriteNum.Poss, 1, 10, null/* A_Look */, StateNum.PossStnd, 0, 0),
  // S_POSS_RUN1
  new State(SpriteNum.Poss, 0, 4, null/* A_Chase */, StateNum.PossRun2, 0, 0),
  // S_POSS_RUN2
  new State(SpriteNum.Poss, 0, 4, null/* A_Chase */, StateNum.PossRun3, 0, 0),
  // S_POSS_RUN3
  new State(SpriteNum.Poss, 1, 4, null/* A_Chase */, StateNum.PossRun4, 0, 0),
  // S_POSS_RUN4
  new State(SpriteNum.Poss, 1, 4, null/* A_Chase */, StateNum.PossRun5, 0, 0),
  // S_POSS_RUN5
  new State(SpriteNum.Poss, 2, 4, null/* A_Chase */, StateNum.PossRun6, 0, 0),
  // S_POSS_RUN6
  new State(SpriteNum.Poss, 2, 4, null/* A_Chase */, StateNum.PossRun7, 0, 0),
  // S_POSS_RUN7
  new State(SpriteNum.Poss, 3, 4, null/* A_Chase */, StateNum.PossRun8, 0, 0),
  // S_POSS_RUN8
  new State(SpriteNum.Poss, 3, 4, null/* A_Chase */, StateNum.PossRun1, 0, 0),
  // S_POSS_ATK1
  new State(SpriteNum.Poss, 4, 10, null/* A_FaceTarget */, StateNum.PossAtk2, 0, 0),
  // S_POSS_ATK2
  new State(SpriteNum.Poss, 5, 8, null/* A_PosAttack */, StateNum.PossAtk3, 0, 0),
  // S_POSS_ATK3
  new State(SpriteNum.Poss, 4, 8, null, StateNum.PossRun1, 0, 0),
  // S_POSS_PAIN
  new State(SpriteNum.Poss, 6, 3, null, StateNum.PossPain2, 0, 0),
  // S_POSS_PAIN2
  new State(SpriteNum.Poss, 6, 3, null/* A_Pain */, StateNum.PossRun1, 0, 0),
  // S_POSS_DIE1
  new State(SpriteNum.Poss, 7, 5, null, StateNum.PossDie2, 0, 0),
  // S_POSS_DIE2
  new State(SpriteNum.Poss, 8, 5, null/* A_Scream */, StateNum.PossDie3, 0, 0),
  // S_POSS_DIE3
  new State(SpriteNum.Poss, 9, 5, null/* A_Fall */, StateNum.PossDie4, 0, 0),
  // S_POSS_DIE4
  new State(SpriteNum.Poss, 10, 5, null, StateNum.PossDie5, 0, 0),
  // S_POSS_DIE5
  new State(SpriteNum.Poss, 11, -1, null, StateNum.Null, 0, 0),
  // S_POSS_XDIE1
  new State(SpriteNum.Poss, 12, 5, null, StateNum.PossXdie2, 0, 0),
  // S_POSS_XDIE2
  new State(SpriteNum.Poss, 13, 5, null/* A_XScream */, StateNum.PossXdie3, 0, 0),
  // S_POSS_XDIE3
  new State(SpriteNum.Poss, 14, 5, null/* A_Fall */, StateNum.PossXdie4, 0, 0),
  // S_POSS_XDIE4
  new State(SpriteNum.Poss, 15, 5, null, StateNum.PossXdie5, 0, 0),
  // S_POSS_XDIE5
  new State(SpriteNum.Poss, 16, 5, null, StateNum.PossXdie6, 0, 0),
  // S_POSS_XDIE6
  new State(SpriteNum.Poss, 17, 5, null, StateNum.PossXdie7, 0, 0),
  // S_POSS_XDIE7
  new State(SpriteNum.Poss, 18, 5, null, StateNum.PossXdie8, 0, 0),
  // S_POSS_XDIE8
  new State(SpriteNum.Poss, 19, 5, null, StateNum.PossXdie9, 0, 0),
  // S_POSS_XDIE9
  new State(SpriteNum.Poss, 20, -1, null, StateNum.Null, 0, 0),
  // S_POSS_RAISE1
  new State(SpriteNum.Poss, 10, 5, null, StateNum.PossRaise2, 0, 0),
  // S_POSS_RAISE2
  new State(SpriteNum.Poss, 9, 5, null, StateNum.PossRaise3, 0, 0),
  // S_POSS_RAISE3
  new State(SpriteNum.Poss, 8, 5, null, StateNum.PossRaise4, 0, 0),
  // S_POSS_RAISE4
  new State(SpriteNum.Poss, 7, 5, null, StateNum.PossRun1, 0, 0),
  // S_SPOS_STND
  new State(SpriteNum.Spos, 0, 10, null/* A_Look */, StateNum.SposStnd2, 0, 0),
  // S_SPOS_STND2
  new State(SpriteNum.Spos, 1, 10, null/* A_Look */, StateNum.SposStnd, 0, 0),
  // S_SPOS_RUN1
  new State(SpriteNum.Spos, 0, 3, null/* A_Chase */, StateNum.SposRun2, 0, 0),
  // S_SPOS_RUN2
  new State(SpriteNum.Spos, 0, 3, null/* A_Chase */, StateNum.SposRun3, 0, 0),
  // S_SPOS_RUN3
  new State(SpriteNum.Spos, 1, 3, null/* A_Chase */, StateNum.SposRun4, 0, 0),
  // S_SPOS_RUN4
  new State(SpriteNum.Spos, 1, 3, null/* A_Chase */, StateNum.SposRun5, 0, 0),
  // S_SPOS_RUN5
  new State(SpriteNum.Spos, 2, 3, null/* A_Chase */, StateNum.SposRun6, 0, 0),
  // S_SPOS_RUN6
  new State(SpriteNum.Spos, 2, 3, null/* A_Chase */, StateNum.SposRun7, 0, 0),
  // S_SPOS_RUN7
  new State(SpriteNum.Spos, 3, 3, null/* A_Chase */, StateNum.SposRun8, 0, 0),
  // S_SPOS_RUN8
  new State(SpriteNum.Spos, 3, 3, null/* A_Chase */, StateNum.SposRun1, 0, 0),
  // S_SPOS_ATK1
  new State(SpriteNum.Spos, 4, 10, null/* A_FaceTarget */, StateNum.SposAtk2, 0, 0),
  // S_SPOS_ATK2
  new State(SpriteNum.Spos, 32773, 10, null/* A_SPosAttack */, StateNum.SposAtk3, 0, 0),
  // S_SPOS_ATK3
  new State(SpriteNum.Spos, 4, 10, null, StateNum.SposRun1, 0, 0),
  // S_SPOS_PAIN
  new State(SpriteNum.Spos, 6, 3, null, StateNum.SposPain2, 0, 0),
  // S_SPOS_PAIN2
  new State(SpriteNum.Spos, 6, 3, null/* A_Pain */, StateNum.SposRun1, 0, 0),
  // S_SPOS_DIE1
  new State(SpriteNum.Spos, 7, 5, null, StateNum.SposDie2, 0, 0),
  // S_SPOS_DIE2
  new State(SpriteNum.Spos, 8, 5, null/* A_Scream */, StateNum.SposDie3, 0, 0),
  // S_SPOS_DIE3
  new State(SpriteNum.Spos, 9, 5, null/* A_Fall */, StateNum.SposDie4, 0, 0),
  // S_SPOS_DIE4
  new State(SpriteNum.Spos, 10, 5, null, StateNum.SposDie5, 0, 0),
  // S_SPOS_DIE5
  new State(SpriteNum.Spos, 11, -1, null, StateNum.Null, 0, 0),
  // S_SPOS_XDIE1
  new State(SpriteNum.Spos, 12, 5, null, StateNum.SposXdie2, 0, 0),
  // S_SPOS_XDIE2
  new State(SpriteNum.Spos, 13, 5, null/* A_XScream */, StateNum.SposXdie3, 0, 0),
  // S_SPOS_XDIE3
  new State(SpriteNum.Spos, 14, 5, null/* A_Fall */, StateNum.SposXdie4, 0, 0),
  // S_SPOS_XDIE4
  new State(SpriteNum.Spos, 15, 5, null, StateNum.SposXdie5, 0, 0),
  // S_SPOS_XDIE5
  new State(SpriteNum.Spos, 16, 5, null, StateNum.SposXdie6, 0, 0),
  // S_SPOS_XDIE6
  new State(SpriteNum.Spos, 17, 5, null, StateNum.SposXdie7, 0, 0),
  // S_SPOS_XDIE7
  new State(SpriteNum.Spos, 18, 5, null, StateNum.SposXdie8, 0, 0),
  // S_SPOS_XDIE8
  new State(SpriteNum.Spos, 19, 5, null, StateNum.SposXdie9, 0, 0),
  // S_SPOS_XDIE9
  new State(SpriteNum.Spos, 20, -1, null, StateNum.Null, 0, 0),
  // S_SPOS_RAISE1
  new State(SpriteNum.Spos, 11, 5, null, StateNum.SposRaise2, 0, 0),
  // S_SPOS_RAISE2
  new State(SpriteNum.Spos, 10, 5, null, StateNum.SposRaise3, 0, 0),
  // S_SPOS_RAISE3
  new State(SpriteNum.Spos, 9, 5, null, StateNum.SposRaise4, 0, 0),
  // S_SPOS_RAISE4
  new State(SpriteNum.Spos, 8, 5, null, StateNum.SposRaise5, 0, 0),
  // S_SPOS_RAISE5
  new State(SpriteNum.Spos, 7, 5, null, StateNum.SposRun1, 0, 0),
  // S_VILE_STND
  new State(SpriteNum.Vile, 0, 10, null/* A_Look */, StateNum.VileStnd2, 0, 0),
  // S_VILE_STND2
  new State(SpriteNum.Vile, 1, 10, null/* A_Look */, StateNum.VileStnd, 0, 0),
  // S_VILE_RUN1
  new State(SpriteNum.Vile, 0, 2, null/* A_VileChase */, StateNum.VileRun2, 0, 0),
  // S_VILE_RUN2
  new State(SpriteNum.Vile, 0, 2, null/* A_VileChase */, StateNum.VileRun3, 0, 0),
  // S_VILE_RUN3
  new State(SpriteNum.Vile, 1, 2, null/* A_VileChase */, StateNum.VileRun4, 0, 0),
  // S_VILE_RUN4
  new State(SpriteNum.Vile, 1, 2, null/* A_VileChase */, StateNum.VileRun5, 0, 0),
  // S_VILE_RUN5
  new State(SpriteNum.Vile, 2, 2, null/* A_VileChase */, StateNum.VileRun6, 0, 0),
  // S_VILE_RUN6
  new State(SpriteNum.Vile, 2, 2, null/* A_VileChase */, StateNum.VileRun7, 0, 0),
  // S_VILE_RUN7
  new State(SpriteNum.Vile, 3, 2, null/* A_VileChase */, StateNum.VileRun8, 0, 0),
  // S_VILE_RUN8
  new State(SpriteNum.Vile, 3, 2, null/* A_VileChase */, StateNum.VileRun9, 0, 0),
  // S_VILE_RUN9
  new State(SpriteNum.Vile, 4, 2, null/* A_VileChase */, StateNum.VileRun10, 0, 0),
  // S_VILE_RUN10
  new State(SpriteNum.Vile, 4, 2, null/* A_VileChase */, StateNum.VileRun11, 0, 0),
  // S_VILE_RUN11
  new State(SpriteNum.Vile, 5, 2, null/* A_VileChase */, StateNum.VileRun12, 0, 0),
  // S_VILE_RUN12
  new State(SpriteNum.Vile, 5, 2, null/* A_VileChase */, StateNum.VileRun1, 0, 0),
  // S_VILE_ATK1
  new State(SpriteNum.Vile, 32774, 0, null/* A_VileStart */, StateNum.VileAtk2, 0, 0),
  // S_VILE_ATK2
  new State(SpriteNum.Vile, 32774, 10, null/* A_FaceTarget */, StateNum.VileAtk3, 0, 0),
  // S_VILE_ATK3
  new State(SpriteNum.Vile, 32775, 8, null/* A_VileTarget */, StateNum.VileAtk4, 0, 0),
  // S_VILE_ATK4
  new State(SpriteNum.Vile, 32776, 8, null/* A_FaceTarget */, StateNum.VileAtk5, 0, 0),
  // S_VILE_ATK5
  new State(SpriteNum.Vile, 32777, 8, null/* A_FaceTarget */, StateNum.VileAtk6, 0, 0),
  // S_VILE_ATK6
  new State(SpriteNum.Vile, 32778, 8, null/* A_FaceTarget */, StateNum.VileAtk7, 0, 0),
  // S_VILE_ATK7
  new State(SpriteNum.Vile, 32779, 8, null/* A_FaceTarget */, StateNum.VileAtk8, 0, 0),
  // S_VILE_ATK8
  new State(SpriteNum.Vile, 32780, 8, null/* A_FaceTarget */, StateNum.VileAtk9, 0, 0),
  // S_VILE_ATK9
  new State(SpriteNum.Vile, 32781, 8, null/* A_FaceTarget */, StateNum.VileAtk10, 0, 0),
  // S_VILE_ATK10
  new State(SpriteNum.Vile, 32782, 8, null/* A_VileAttack */, StateNum.VileAtk11, 0, 0),
  // S_VILE_ATK11
  new State(SpriteNum.Vile, 32783, 20, null, StateNum.VileRun1, 0, 0),
  // S_VILE_HEAL1
  new State(SpriteNum.Vile, 32794, 10, null, StateNum.VileHeal2, 0, 0),
  // S_VILE_HEAL2
  new State(SpriteNum.Vile, 32795, 10, null, StateNum.VileHeal3, 0, 0),
  // S_VILE_HEAL3
  new State(SpriteNum.Vile, 32796, 10, null, StateNum.VileRun1, 0, 0),
  // S_VILE_PAIN
  new State(SpriteNum.Vile, 16, 5, null, StateNum.VilePain2, 0, 0),
  // S_VILE_PAIN2
  new State(SpriteNum.Vile, 16, 5, null/* A_Pain */, StateNum.VileRun1, 0, 0),
  // S_VILE_DIE1
  new State(SpriteNum.Vile, 16, 7, null, StateNum.VileDie2, 0, 0),
  // S_VILE_DIE2
  new State(SpriteNum.Vile, 17, 7, null/* A_Scream */, StateNum.VileDie3, 0, 0),
  // S_VILE_DIE3
  new State(SpriteNum.Vile, 18, 7, null/* A_Fall */, StateNum.VileDie4, 0, 0),
  // S_VILE_DIE4
  new State(SpriteNum.Vile, 19, 7, null, StateNum.VileDie5, 0, 0),
  // S_VILE_DIE5
  new State(SpriteNum.Vile, 20, 7, null, StateNum.VileDie6, 0, 0),
  // S_VILE_DIE6
  new State(SpriteNum.Vile, 21, 7, null, StateNum.VileDie7, 0, 0),
  // S_VILE_DIE7
  new State(SpriteNum.Vile, 22, 7, null, StateNum.VileDie8, 0, 0),
  // S_VILE_DIE8
  new State(SpriteNum.Vile, 23, 5, null, StateNum.VileDie9, 0, 0),
  // S_VILE_DIE9
  new State(SpriteNum.Vile, 24, 5, null, StateNum.VileDie10, 0, 0),
  // S_VILE_DIE10
  new State(SpriteNum.Vile, 25, -1, null, StateNum.Null, 0, 0),
  // S_FIRE1
  new State(SpriteNum.Fire, 32768, 2, null/* A_StartFire */, StateNum.Fire2, 0, 0),
  // S_FIRE2
  new State(SpriteNum.Fire, 32769, 2, null/* A_Fire */, StateNum.Fire3, 0, 0),
  // S_FIRE3
  new State(SpriteNum.Fire, 32768, 2, null/* A_Fire */, StateNum.Fire4, 0, 0),
  // S_FIRE4
  new State(SpriteNum.Fire, 32769, 2, null/* A_Fire */, StateNum.Fire5, 0, 0),
  // S_FIRE5
  new State(SpriteNum.Fire, 32770, 2, null/* A_FireCrackle */, StateNum.Fire6, 0, 0),
  // S_FIRE6
  new State(SpriteNum.Fire, 32769, 2, null/* A_Fire */, StateNum.Fire7, 0, 0),
  // S_FIRE7
  new State(SpriteNum.Fire, 32770, 2, null/* A_Fire */, StateNum.Fire8, 0, 0),
  // S_FIRE8
  new State(SpriteNum.Fire, 32769, 2, null/* A_Fire */, StateNum.Fire9, 0, 0),
  // S_FIRE9
  new State(SpriteNum.Fire, 32770, 2, null/* A_Fire */, StateNum.Fire10, 0, 0),
  // S_FIRE10
  new State(SpriteNum.Fire, 32771, 2, null/* A_Fire */, StateNum.Fire11, 0, 0),
  // S_FIRE11
  new State(SpriteNum.Fire, 32770, 2, null/* A_Fire */, StateNum.Fire12, 0, 0),
  // S_FIRE12
  new State(SpriteNum.Fire, 32771, 2, null/* A_Fire */, StateNum.Fire13, 0, 0),
  // S_FIRE13
  new State(SpriteNum.Fire, 32770, 2, null/* A_Fire */, StateNum.Fire14, 0, 0),
  // S_FIRE14
  new State(SpriteNum.Fire, 32771, 2, null/* A_Fire */, StateNum.Fire15, 0, 0),
  // S_FIRE15
  new State(SpriteNum.Fire, 32772, 2, null/* A_Fire */, StateNum.Fire16, 0, 0),
  // S_FIRE16
  new State(SpriteNum.Fire, 32771, 2, null/* A_Fire */, StateNum.Fire17, 0, 0),
  // S_FIRE17
  new State(SpriteNum.Fire, 32772, 2, null/* A_Fire */, StateNum.Fire18, 0, 0),
  // S_FIRE18
  new State(SpriteNum.Fire, 32771, 2, null/* A_Fire */, StateNum.Fire19, 0, 0),
  // S_FIRE19
  new State(SpriteNum.Fire, 32772, 2, null/* A_FireCrackle */, StateNum.Fire20, 0, 0),
  // S_FIRE20
  new State(SpriteNum.Fire, 32773, 2, null/* A_Fire */, StateNum.Fire21, 0, 0),
  // S_FIRE21
  new State(SpriteNum.Fire, 32772, 2, null/* A_Fire */, StateNum.Fire22, 0, 0),
  // S_FIRE22
  new State(SpriteNum.Fire, 32773, 2, null/* A_Fire */, StateNum.Fire23, 0, 0),
  // S_FIRE23
  new State(SpriteNum.Fire, 32772, 2, null/* A_Fire */, StateNum.Fire24, 0, 0),
  // S_FIRE24
  new State(SpriteNum.Fire, 32773, 2, null/* A_Fire */, StateNum.Fire25, 0, 0),
  // S_FIRE25
  new State(SpriteNum.Fire, 32774, 2, null/* A_Fire */, StateNum.Fire26, 0, 0),
  // S_FIRE26
  new State(SpriteNum.Fire, 32775, 2, null/* A_Fire */, StateNum.Fire27, 0, 0),
  // S_FIRE27
  new State(SpriteNum.Fire, 32774, 2, null/* A_Fire */, StateNum.Fire28, 0, 0),
  // S_FIRE28
  new State(SpriteNum.Fire, 32775, 2, null/* A_Fire */, StateNum.Fire29, 0, 0),
  // S_FIRE29
  new State(SpriteNum.Fire, 32774, 2, null/* A_Fire */, StateNum.Fire30, 0, 0),
  // S_FIRE30
  new State(SpriteNum.Fire, 32775, 2, null/* A_Fire */, StateNum.Null, 0, 0),
  // S_SMOKE1
  new State(SpriteNum.Puff, 1, 4, null, StateNum.Smoke2, 0, 0),
  // S_SMOKE2
  new State(SpriteNum.Puff, 2, 4, null, StateNum.Smoke3, 0, 0),
  // S_SMOKE3
  new State(SpriteNum.Puff, 1, 4, null, StateNum.Smoke4, 0, 0),
  // S_SMOKE4
  new State(SpriteNum.Puff, 2, 4, null, StateNum.Smoke5, 0, 0),
  // S_SMOKE5
  new State(SpriteNum.Puff, 3, 4, null, StateNum.Null, 0, 0),
  // S_TRACER
  new State(SpriteNum.Fatb, 32768, 2, null/* A_Tracer */, StateNum.Tracer2, 0, 0),
  // S_TRACER2
  new State(SpriteNum.Fatb, 32769, 2, null/* A_Tracer */, StateNum.Tracer, 0, 0),
  // S_TRACEEXP1
  new State(SpriteNum.Fbxp, 32768, 8, null, StateNum.Traceexp2, 0, 0),
  // S_TRACEEXP2
  new State(SpriteNum.Fbxp, 32769, 6, null, StateNum.Traceexp3, 0, 0),
  // S_TRACEEXP3
  new State(SpriteNum.Fbxp, 32770, 4, null, StateNum.Null, 0, 0),
  // S_SKEL_STND
  new State(SpriteNum.Skel, 0, 10, null/* A_Look */, StateNum.SkelStnd2, 0, 0),
  // S_SKEL_STND2
  new State(SpriteNum.Skel, 1, 10, null/* A_Look */, StateNum.SkelStnd, 0, 0),
  // S_SKEL_RUN1
  new State(SpriteNum.Skel, 0, 2, null/* A_Chase */, StateNum.SkelRun2, 0, 0),
  // S_SKEL_RUN2
  new State(SpriteNum.Skel, 0, 2, null/* A_Chase */, StateNum.SkelRun3, 0, 0),
  // S_SKEL_RUN3
  new State(SpriteNum.Skel, 1, 2, null/* A_Chase */, StateNum.SkelRun4, 0, 0),
  // S_SKEL_RUN4
  new State(SpriteNum.Skel, 1, 2, null/* A_Chase */, StateNum.SkelRun5, 0, 0),
  // S_SKEL_RUN5
  new State(SpriteNum.Skel, 2, 2, null/* A_Chase */, StateNum.SkelRun6, 0, 0),
  // S_SKEL_RUN6
  new State(SpriteNum.Skel, 2, 2, null/* A_Chase */, StateNum.SkelRun7, 0, 0),
  // S_SKEL_RUN7
  new State(SpriteNum.Skel, 3, 2, null/* A_Chase */, StateNum.SkelRun8, 0, 0),
  // S_SKEL_RUN8
  new State(SpriteNum.Skel, 3, 2, null/* A_Chase */, StateNum.SkelRun9, 0, 0),
  // S_SKEL_RUN9
  new State(SpriteNum.Skel, 4, 2, null/* A_Chase */, StateNum.SkelRun10, 0, 0),
  // S_SKEL_RUN10
  new State(SpriteNum.Skel, 4, 2, null/* A_Chase */, StateNum.SkelRun11, 0, 0),
  // S_SKEL_RUN11
  new State(SpriteNum.Skel, 5, 2, null/* A_Chase */, StateNum.SkelRun12, 0, 0),
  // S_SKEL_RUN12
  new State(SpriteNum.Skel, 5, 2, null/* A_Chase */, StateNum.SkelRun1, 0, 0),
  // S_SKEL_FIST1
  new State(SpriteNum.Skel, 6, 0, null/* A_FaceTarget */, StateNum.SkelFist2, 0, 0),
  // S_SKEL_FIST2
  new State(SpriteNum.Skel, 6, 6, null/* A_SkelWhoosh */, StateNum.SkelFist3, 0, 0),
  // S_SKEL_FIST3
  new State(SpriteNum.Skel, 7, 6, null/* A_FaceTarget */, StateNum.SkelFist4, 0, 0),
  // S_SKEL_FIST4
  new State(SpriteNum.Skel, 8, 6, null/* A_SkelFist */, StateNum.SkelRun1, 0, 0),
  // S_SKEL_MISS1
  new State(SpriteNum.Skel, 32777, 0, null/* A_FaceTarget */, StateNum.SkelMiss2, 0, 0),
  // S_SKEL_MISS2
  new State(SpriteNum.Skel, 32777, 10, null/* A_FaceTarget */, StateNum.SkelMiss3, 0, 0),
  // S_SKEL_MISS3
  new State(SpriteNum.Skel, 10, 10, null/* A_SkelMissile */, StateNum.SkelMiss4, 0, 0),
  // S_SKEL_MISS4
  new State(SpriteNum.Skel, 10, 10, null/* A_FaceTarget */, StateNum.SkelRun1, 0, 0),
  // S_SKEL_PAIN
  new State(SpriteNum.Skel, 11, 5, null, StateNum.SkelPain2, 0, 0),
  // S_SKEL_PAIN2
  new State(SpriteNum.Skel, 11, 5, null/* A_Pain */, StateNum.SkelRun1, 0, 0),
  // S_SKEL_DIE1
  new State(SpriteNum.Skel, 11, 7, null, StateNum.SkelDie2, 0, 0),
  // S_SKEL_DIE2
  new State(SpriteNum.Skel, 12, 7, null, StateNum.SkelDie3, 0, 0),
  // S_SKEL_DIE3
  new State(SpriteNum.Skel, 13, 7, null/* A_Scream */, StateNum.SkelDie4, 0, 0),
  // S_SKEL_DIE4
  new State(SpriteNum.Skel, 14, 7, null/* A_Fall */, StateNum.SkelDie5, 0, 0),
  // S_SKEL_DIE5
  new State(SpriteNum.Skel, 15, 7, null, StateNum.SkelDie6, 0, 0),
  // S_SKEL_DIE6
  new State(SpriteNum.Skel, 16, -1, null, StateNum.Null, 0, 0),
  // S_SKEL_RAISE1
  new State(SpriteNum.Skel, 16, 5, null, StateNum.SkelRaise2, 0, 0),
  // S_SKEL_RAISE2
  new State(SpriteNum.Skel, 15, 5, null, StateNum.SkelRaise3, 0, 0),
  // S_SKEL_RAISE3
  new State(SpriteNum.Skel, 14, 5, null, StateNum.SkelRaise4, 0, 0),
  // S_SKEL_RAISE4
  new State(SpriteNum.Skel, 13, 5, null, StateNum.SkelRaise5, 0, 0),
  // S_SKEL_RAISE5
  new State(SpriteNum.Skel, 12, 5, null, StateNum.SkelRaise6, 0, 0),
  // S_SKEL_RAISE6
  new State(SpriteNum.Skel, 11, 5, null, StateNum.SkelRun1, 0, 0),
  // S_FATSHOT1
  new State(SpriteNum.Manf, 32768, 4, null, StateNum.Fatshot2, 0, 0),
  // S_FATSHOT2
  new State(SpriteNum.Manf, 32769, 4, null, StateNum.Fatshot1, 0, 0),
  // S_FATSHOTX1
  new State(SpriteNum.Misl, 32769, 8, null, StateNum.Fatshotx2, 0, 0),
  // S_FATSHOTX2
  new State(SpriteNum.Misl, 32770, 6, null, StateNum.Fatshotx3, 0, 0),
  // S_FATSHOTX3
  new State(SpriteNum.Misl, 32771, 4, null, StateNum.Null, 0, 0),
  // S_FATT_STND
  new State(SpriteNum.Fatt, 0, 15, null/* A_Look */, StateNum.FattStnd2, 0, 0),
  // S_FATT_STND2
  new State(SpriteNum.Fatt, 1, 15, null/* A_Look */, StateNum.FattStnd, 0, 0),
  // S_FATT_RUN1
  new State(SpriteNum.Fatt, 0, 4, null/* A_Chase */, StateNum.FattRun2, 0, 0),
  // S_FATT_RUN2
  new State(SpriteNum.Fatt, 0, 4, null/* A_Chase */, StateNum.FattRun3, 0, 0),
  // S_FATT_RUN3
  new State(SpriteNum.Fatt, 1, 4, null/* A_Chase */, StateNum.FattRun4, 0, 0),
  // S_FATT_RUN4
  new State(SpriteNum.Fatt, 1, 4, null/* A_Chase */, StateNum.FattRun5, 0, 0),
  // S_FATT_RUN5
  new State(SpriteNum.Fatt, 2, 4, null/* A_Chase */, StateNum.FattRun6, 0, 0),
  // S_FATT_RUN6
  new State(SpriteNum.Fatt, 2, 4, null/* A_Chase */, StateNum.FattRun7, 0, 0),
  // S_FATT_RUN7
  new State(SpriteNum.Fatt, 3, 4, null/* A_Chase */, StateNum.FattRun8, 0, 0),
  // S_FATT_RUN8
  new State(SpriteNum.Fatt, 3, 4, null/* A_Chase */, StateNum.FattRun9, 0, 0),
  // S_FATT_RUN9
  new State(SpriteNum.Fatt, 4, 4, null/* A_Chase */, StateNum.FattRun10, 0, 0),
  // S_FATT_RUN10
  new State(SpriteNum.Fatt, 4, 4, null/* A_Chase */, StateNum.FattRun11, 0, 0),
  // S_FATT_RUN11
  new State(SpriteNum.Fatt, 5, 4, null/* A_Chase */, StateNum.FattRun12, 0, 0),
  // S_FATT_RUN12
  new State(SpriteNum.Fatt, 5, 4, null/* A_Chase */, StateNum.FattRun1, 0, 0),
  // S_FATT_ATK1
  new State(SpriteNum.Fatt, 6, 20, null/* A_FatRaise */, StateNum.FattAtk2, 0, 0),
  // S_FATT_ATK2
  new State(SpriteNum.Fatt, 32775, 10, null/* A_FatAttack1 */, StateNum.FattAtk3, 0, 0),
  // S_FATT_ATK3
  new State(SpriteNum.Fatt, 8, 5, null/* A_FaceTarget */, StateNum.FattAtk4, 0, 0),
  // S_FATT_ATK4
  new State(SpriteNum.Fatt, 6, 5, null/* A_FaceTarget */, StateNum.FattAtk5, 0, 0),
  // S_FATT_ATK5
  new State(SpriteNum.Fatt, 32775, 10, null/* A_FatAttack2 */, StateNum.FattAtk6, 0, 0),
  // S_FATT_ATK6
  new State(SpriteNum.Fatt, 8, 5, null/* A_FaceTarget */, StateNum.FattAtk7, 0, 0),
  // S_FATT_ATK7
  new State(SpriteNum.Fatt, 6, 5, null/* A_FaceTarget */, StateNum.FattAtk8, 0, 0),
  // S_FATT_ATK8
  new State(SpriteNum.Fatt, 32775, 10, null/* A_FatAttack3 */, StateNum.FattAtk9, 0, 0),
  // S_FATT_ATK9
  new State(SpriteNum.Fatt, 8, 5, null/* A_FaceTarget */, StateNum.FattAtk10, 0, 0),
  // S_FATT_ATK10
  new State(SpriteNum.Fatt, 6, 5, null/* A_FaceTarget */, StateNum.FattRun1, 0, 0),
  // S_FATT_PAIN
  new State(SpriteNum.Fatt, 9, 3, null, StateNum.FattPain2, 0, 0),
  // S_FATT_PAIN2
  new State(SpriteNum.Fatt, 9, 3, null/* A_Pain */, StateNum.FattRun1, 0, 0),
  // S_FATT_DIE1
  new State(SpriteNum.Fatt, 10, 6, null, StateNum.FattDie2, 0, 0),
  // S_FATT_DIE2
  new State(SpriteNum.Fatt, 11, 6, null/* A_Scream */, StateNum.FattDie3, 0, 0),
  // S_FATT_DIE3
  new State(SpriteNum.Fatt, 12, 6, null/* A_Fall */, StateNum.FattDie4, 0, 0),
  // S_FATT_DIE4
  new State(SpriteNum.Fatt, 13, 6, null, StateNum.FattDie5, 0, 0),
  // S_FATT_DIE5
  new State(SpriteNum.Fatt, 14, 6, null, StateNum.FattDie6, 0, 0),
  // S_FATT_DIE6
  new State(SpriteNum.Fatt, 15, 6, null, StateNum.FattDie7, 0, 0),
  // S_FATT_DIE7
  new State(SpriteNum.Fatt, 16, 6, null, StateNum.FattDie8, 0, 0),
  // S_FATT_DIE8
  new State(SpriteNum.Fatt, 17, 6, null, StateNum.FattDie9, 0, 0),
  // S_FATT_DIE9
  new State(SpriteNum.Fatt, 18, 6, null, StateNum.FattDie10, 0, 0),
  // S_FATT_DIE10
  new State(SpriteNum.Fatt, 19, -1, null/* A_BossDeath */, StateNum.Null, 0, 0),
  // S_FATT_RAISE1
  new State(SpriteNum.Fatt, 17, 5, null, StateNum.FattRaise2, 0, 0),
  // S_FATT_RAISE2
  new State(SpriteNum.Fatt, 16, 5, null, StateNum.FattRaise3, 0, 0),
  // S_FATT_RAISE3
  new State(SpriteNum.Fatt, 15, 5, null, StateNum.FattRaise4, 0, 0),
  // S_FATT_RAISE4
  new State(SpriteNum.Fatt, 14, 5, null, StateNum.FattRaise5, 0, 0),
  // S_FATT_RAISE5
  new State(SpriteNum.Fatt, 13, 5, null, StateNum.FattRaise6, 0, 0),
  // S_FATT_RAISE6
  new State(SpriteNum.Fatt, 12, 5, null, StateNum.FattRaise7, 0, 0),
  // S_FATT_RAISE7
  new State(SpriteNum.Fatt, 11, 5, null, StateNum.FattRaise8, 0, 0),
  // S_FATT_RAISE8
  new State(SpriteNum.Fatt, 10, 5, null, StateNum.FattRun1, 0, 0),
  // S_CPOS_STND
  new State(SpriteNum.Cpos, 0, 10, null/* A_Look */, StateNum.CposStnd2, 0, 0),
  // S_CPOS_STND2
  new State(SpriteNum.Cpos, 1, 10, null/* A_Look */, StateNum.CposStnd, 0, 0),
  // S_CPOS_RUN1
  new State(SpriteNum.Cpos, 0, 3, null/* A_Chase */, StateNum.CposRun2, 0, 0),
  // S_CPOS_RUN2
  new State(SpriteNum.Cpos, 0, 3, null/* A_Chase */, StateNum.CposRun3, 0, 0),
  // S_CPOS_RUN3
  new State(SpriteNum.Cpos, 1, 3, null/* A_Chase */, StateNum.CposRun4, 0, 0),
  // S_CPOS_RUN4
  new State(SpriteNum.Cpos, 1, 3, null/* A_Chase */, StateNum.CposRun5, 0, 0),
  // S_CPOS_RUN5
  new State(SpriteNum.Cpos, 2, 3, null/* A_Chase */, StateNum.CposRun6, 0, 0),
  // S_CPOS_RUN6
  new State(SpriteNum.Cpos, 2, 3, null/* A_Chase */, StateNum.CposRun7, 0, 0),
  // S_CPOS_RUN7
  new State(SpriteNum.Cpos, 3, 3, null/* A_Chase */, StateNum.CposRun8, 0, 0),
  // S_CPOS_RUN8
  new State(SpriteNum.Cpos, 3, 3, null/* A_Chase */, StateNum.CposRun1, 0, 0),
  // S_CPOS_ATK1
  new State(SpriteNum.Cpos, 4, 10, null/* A_FaceTarget */, StateNum.CposAtk2, 0, 0),
  // S_CPOS_ATK2
  new State(SpriteNum.Cpos, 32773, 4, null/* A_CPosAttack */, StateNum.CposAtk3, 0, 0),
  // S_CPOS_ATK3
  new State(SpriteNum.Cpos, 32772, 4, null/* A_CPosAttack */, StateNum.CposAtk4, 0, 0),
  // S_CPOS_ATK4
  new State(SpriteNum.Cpos, 5, 1, null/* A_CPosRefire */, StateNum.CposAtk2, 0, 0),
  // S_CPOS_PAIN
  new State(SpriteNum.Cpos, 6, 3, null, StateNum.CposPain2, 0, 0),
  // S_CPOS_PAIN2
  new State(SpriteNum.Cpos, 6, 3, null/* A_Pain */, StateNum.CposRun1, 0, 0),
  // S_CPOS_DIE1
  new State(SpriteNum.Cpos, 7, 5, null, StateNum.CposDie2, 0, 0),
  // S_CPOS_DIE2
  new State(SpriteNum.Cpos, 8, 5, null/* A_Scream */, StateNum.CposDie3, 0, 0),
  // S_CPOS_DIE3
  new State(SpriteNum.Cpos, 9, 5, null/* A_Fall */, StateNum.CposDie4, 0, 0),
  // S_CPOS_DIE4
  new State(SpriteNum.Cpos, 10, 5, null, StateNum.CposDie5, 0, 0),
  // S_CPOS_DIE5
  new State(SpriteNum.Cpos, 11, 5, null, StateNum.CposDie6, 0, 0),
  // S_CPOS_DIE6
  new State(SpriteNum.Cpos, 12, 5, null, StateNum.CposDie7, 0, 0),
  // S_CPOS_DIE7
  new State(SpriteNum.Cpos, 13, -1, null, StateNum.Null, 0, 0),
  // S_CPOS_XDIE1
  new State(SpriteNum.Cpos, 14, 5, null, StateNum.CposXdie2, 0, 0),
  // S_CPOS_XDIE2
  new State(SpriteNum.Cpos, 15, 5, null/* A_XScream */, StateNum.CposXdie3, 0, 0),
  // S_CPOS_XDIE3
  new State(SpriteNum.Cpos, 16, 5, null/* A_Fall */, StateNum.CposXdie4, 0, 0),
  // S_CPOS_XDIE4
  new State(SpriteNum.Cpos, 17, 5, null, StateNum.CposXdie5, 0, 0),
  // S_CPOS_XDIE5
  new State(SpriteNum.Cpos, 18, 5, null, StateNum.CposXdie6, 0, 0),
  // S_CPOS_XDIE6
  new State(SpriteNum.Cpos, 19, -1, null, StateNum.Null, 0, 0),
  // S_CPOS_RAISE1
  new State(SpriteNum.Cpos, 13, 5, null, StateNum.CposRaise2, 0, 0),
  // S_CPOS_RAISE2
  new State(SpriteNum.Cpos, 12, 5, null, StateNum.CposRaise3, 0, 0),
  // S_CPOS_RAISE3
  new State(SpriteNum.Cpos, 11, 5, null, StateNum.CposRaise4, 0, 0),
  // S_CPOS_RAISE4
  new State(SpriteNum.Cpos, 10, 5, null, StateNum.CposRaise5, 0, 0),
  // S_CPOS_RAISE5
  new State(SpriteNum.Cpos, 9, 5, null, StateNum.CposRaise6, 0, 0),
  // S_CPOS_RAISE6
  new State(SpriteNum.Cpos, 8, 5, null, StateNum.CposRaise7, 0, 0),
  // S_CPOS_RAISE7
  new State(SpriteNum.Cpos, 7, 5, null, StateNum.CposRun1, 0, 0),
  // S_TROO_STND
  new State(SpriteNum.Troo, 0, 10, null/* A_Look */, StateNum.TrooStnd2, 0, 0),
  // S_TROO_STND2
  new State(SpriteNum.Troo, 1, 10, null/* A_Look */, StateNum.TrooStnd, 0, 0),
  // S_TROO_RUN1
  new State(SpriteNum.Troo, 0, 3, null/* A_Chase */, StateNum.TrooRun2, 0, 0),
  // S_TROO_RUN2
  new State(SpriteNum.Troo, 0, 3, null/* A_Chase */, StateNum.TrooRun3, 0, 0),
  // S_TROO_RUN3
  new State(SpriteNum.Troo, 1, 3, null/* A_Chase */, StateNum.TrooRun4, 0, 0),
  // S_TROO_RUN4
  new State(SpriteNum.Troo, 1, 3, null/* A_Chase */, StateNum.TrooRun5, 0, 0),
  // S_TROO_RUN5
  new State(SpriteNum.Troo, 2, 3, null/* A_Chase */, StateNum.TrooRun6, 0, 0),
  // S_TROO_RUN6
  new State(SpriteNum.Troo, 2, 3, null/* A_Chase */, StateNum.TrooRun7, 0, 0),
  // S_TROO_RUN7
  new State(SpriteNum.Troo, 3, 3, null/* A_Chase */, StateNum.TrooRun8, 0, 0),
  // S_TROO_RUN8
  new State(SpriteNum.Troo, 3, 3, null/* A_Chase */, StateNum.TrooRun1, 0, 0),
  // S_TROO_ATK1
  new State(SpriteNum.Troo, 4, 8, null/* A_FaceTarget */, StateNum.TrooAtk2, 0, 0),
  // S_TROO_ATK2
  new State(SpriteNum.Troo, 5, 8, null/* A_FaceTarget */, StateNum.TrooAtk3, 0, 0),
  // S_TROO_ATK3
  new State(SpriteNum.Troo, 6, 6, null/* A_TroopAttack */, StateNum.TrooRun1, 0, 0),
  // S_TROO_PAIN
  new State(SpriteNum.Troo, 7, 2, null, StateNum.TrooPain2, 0, 0),
  // S_TROO_PAIN2
  new State(SpriteNum.Troo, 7, 2, null/* A_Pain */, StateNum.TrooRun1, 0, 0),
  // S_TROO_DIE1
  new State(SpriteNum.Troo, 8, 8, null, StateNum.TrooDie2, 0, 0),
  // S_TROO_DIE2
  new State(SpriteNum.Troo, 9, 8, null/* A_Scream */, StateNum.TrooDie3, 0, 0),
  // S_TROO_DIE3
  new State(SpriteNum.Troo, 10, 6, null, StateNum.TrooDie4, 0, 0),
  // S_TROO_DIE4
  new State(SpriteNum.Troo, 11, 6, null/* A_Fall */, StateNum.TrooDie5, 0, 0),
  // S_TROO_DIE5
  new State(SpriteNum.Troo, 12, -1, null, StateNum.Null, 0, 0),
  // S_TROO_XDIE1
  new State(SpriteNum.Troo, 13, 5, null, StateNum.TrooXdie2, 0, 0),
  // S_TROO_XDIE2
  new State(SpriteNum.Troo, 14, 5, null/* A_XScream */, StateNum.TrooXdie3, 0, 0),
  // S_TROO_XDIE3
  new State(SpriteNum.Troo, 15, 5, null, StateNum.TrooXdie4, 0, 0),
  // S_TROO_XDIE4
  new State(SpriteNum.Troo, 16, 5, null/* A_Fall */, StateNum.TrooXdie5, 0, 0),
  // S_TROO_XDIE5
  new State(SpriteNum.Troo, 17, 5, null, StateNum.TrooXdie6, 0, 0),
  // S_TROO_XDIE6
  new State(SpriteNum.Troo, 18, 5, null, StateNum.TrooXdie7, 0, 0),
  // S_TROO_XDIE7
  new State(SpriteNum.Troo, 19, 5, null, StateNum.TrooXdie8, 0, 0),
  // S_TROO_XDIE8
  new State(SpriteNum.Troo, 20, -1, null, StateNum.Null, 0, 0),
  // S_TROO_RAISE1
  new State(SpriteNum.Troo, 12, 8, null, StateNum.TrooRaise2, 0, 0),
  // S_TROO_RAISE2
  new State(SpriteNum.Troo, 11, 8, null, StateNum.TrooRaise3, 0, 0),
  // S_TROO_RAISE3
  new State(SpriteNum.Troo, 10, 6, null, StateNum.TrooRaise4, 0, 0),
  // S_TROO_RAISE4
  new State(SpriteNum.Troo, 9, 6, null, StateNum.TrooRaise5, 0, 0),
  // S_TROO_RAISE5
  new State(SpriteNum.Troo, 8, 6, null, StateNum.TrooRun1, 0, 0),
  // S_SARG_STND
  new State(SpriteNum.Sarg, 0, 10, null/* A_Look */, StateNum.SargStnd2, 0, 0),
  // S_SARG_STND2
  new State(SpriteNum.Sarg, 1, 10, null/* A_Look */, StateNum.SargStnd, 0, 0),
  // S_SARG_RUN1
  new State(SpriteNum.Sarg, 0, 2, null/* A_Chase */, StateNum.SargRun2, 0, 0),
  // S_SARG_RUN2
  new State(SpriteNum.Sarg, 0, 2, null/* A_Chase */, StateNum.SargRun3, 0, 0),
  // S_SARG_RUN3
  new State(SpriteNum.Sarg, 1, 2, null/* A_Chase */, StateNum.SargRun4, 0, 0),
  // S_SARG_RUN4
  new State(SpriteNum.Sarg, 1, 2, null/* A_Chase */, StateNum.SargRun5, 0, 0),
  // S_SARG_RUN5
  new State(SpriteNum.Sarg, 2, 2, null/* A_Chase */, StateNum.SargRun6, 0, 0),
  // S_SARG_RUN6
  new State(SpriteNum.Sarg, 2, 2, null/* A_Chase */, StateNum.SargRun7, 0, 0),
  // S_SARG_RUN7
  new State(SpriteNum.Sarg, 3, 2, null/* A_Chase */, StateNum.SargRun8, 0, 0),
  // S_SARG_RUN8
  new State(SpriteNum.Sarg, 3, 2, null/* A_Chase */, StateNum.SargRun1, 0, 0),
  // S_SARG_ATK1
  new State(SpriteNum.Sarg, 4, 8, null/* A_FaceTarget */, StateNum.SargAtk2, 0, 0),
  // S_SARG_ATK2
  new State(SpriteNum.Sarg, 5, 8, null/* A_FaceTarget */, StateNum.SargAtk3, 0, 0),
  // S_SARG_ATK3
  new State(SpriteNum.Sarg, 6, 8, null/* A_SargAttack */, StateNum.SargRun1, 0, 0),
  // S_SARG_PAIN
  new State(SpriteNum.Sarg, 7, 2, null, StateNum.SargPain2, 0, 0),
  // S_SARG_PAIN2
  new State(SpriteNum.Sarg, 7, 2, null/* A_Pain */, StateNum.SargRun1, 0, 0),
  // S_SARG_DIE1
  new State(SpriteNum.Sarg, 8, 8, null, StateNum.SargDie2, 0, 0),
  // S_SARG_DIE2
  new State(SpriteNum.Sarg, 9, 8, null/* A_Scream */, StateNum.SargDie3, 0, 0),
  // S_SARG_DIE3
  new State(SpriteNum.Sarg, 10, 4, null, StateNum.SargDie4, 0, 0),
  // S_SARG_DIE4
  new State(SpriteNum.Sarg, 11, 4, null/* A_Fall */, StateNum.SargDie5, 0, 0),
  // S_SARG_DIE5
  new State(SpriteNum.Sarg, 12, 4, null, StateNum.SargDie6, 0, 0),
  // S_SARG_DIE6
  new State(SpriteNum.Sarg, 13, -1, null, StateNum.Null, 0, 0),
  // S_SARG_RAISE1
  new State(SpriteNum.Sarg, 13, 5, null, StateNum.SargRaise2, 0, 0),
  // S_SARG_RAISE2
  new State(SpriteNum.Sarg, 12, 5, null, StateNum.SargRaise3, 0, 0),
  // S_SARG_RAISE3
  new State(SpriteNum.Sarg, 11, 5, null, StateNum.SargRaise4, 0, 0),
  // S_SARG_RAISE4
  new State(SpriteNum.Sarg, 10, 5, null, StateNum.SargRaise5, 0, 0),
  // S_SARG_RAISE5
  new State(SpriteNum.Sarg, 9, 5, null, StateNum.SargRaise6, 0, 0),
  // S_SARG_RAISE6
  new State(SpriteNum.Sarg, 8, 5, null, StateNum.SargRun1, 0, 0),
  // S_HEAD_STND
  new State(SpriteNum.Head, 0, 10, null/* A_Look */, StateNum.HeadStnd, 0, 0),
  // S_HEAD_RUN1
  new State(SpriteNum.Head, 0, 3, null/* A_Chase */, StateNum.HeadRun1, 0, 0),
  // S_HEAD_ATK1
  new State(SpriteNum.Head, 1, 5, null/* A_FaceTarget */, StateNum.HeadAtk2, 0, 0),
  // S_HEAD_ATK2
  new State(SpriteNum.Head, 2, 5, null/* A_FaceTarget */, StateNum.HeadAtk3, 0, 0),
  // S_HEAD_ATK3
  new State(SpriteNum.Head, 32771, 5, null/* A_HeadAttack */, StateNum.HeadRun1, 0, 0),
  // S_HEAD_PAIN
  new State(SpriteNum.Head, 4, 3, null, StateNum.HeadPain2, 0, 0),
  // S_HEAD_PAIN2
  new State(SpriteNum.Head, 4, 3, null/* A_Pain */, StateNum.HeadPain3, 0, 0),
  // S_HEAD_PAIN3
  new State(SpriteNum.Head, 5, 6, null, StateNum.HeadRun1, 0, 0),
  // S_HEAD_DIE1
  new State(SpriteNum.Head, 6, 8, null, StateNum.HeadDie2, 0, 0),
  // S_HEAD_DIE2
  new State(SpriteNum.Head, 7, 8, null/* A_Scream */, StateNum.HeadDie3, 0, 0),
  // S_HEAD_DIE3
  new State(SpriteNum.Head, 8, 8, null, StateNum.HeadDie4, 0, 0),
  // S_HEAD_DIE4
  new State(SpriteNum.Head, 9, 8, null, StateNum.HeadDie5, 0, 0),
  // S_HEAD_DIE5
  new State(SpriteNum.Head, 10, 8, null/* A_Fall */, StateNum.HeadDie6, 0, 0),
  // S_HEAD_DIE6
  new State(SpriteNum.Head, 11, -1, null, StateNum.Null, 0, 0),
  // S_HEAD_RAISE1
  new State(SpriteNum.Head, 11, 8, null, StateNum.HeadRaise2, 0, 0),
  // S_HEAD_RAISE2
  new State(SpriteNum.Head, 10, 8, null, StateNum.HeadRaise3, 0, 0),
  // S_HEAD_RAISE3
  new State(SpriteNum.Head, 9, 8, null, StateNum.HeadRaise4, 0, 0),
  // S_HEAD_RAISE4
  new State(SpriteNum.Head, 8, 8, null, StateNum.HeadRaise5, 0, 0),
  // S_HEAD_RAISE5
  new State(SpriteNum.Head, 7, 8, null, StateNum.HeadRaise6, 0, 0),
  // S_HEAD_RAISE6
  new State(SpriteNum.Head, 6, 8, null, StateNum.HeadRun1, 0, 0),
  // S_BRBALL1
  new State(SpriteNum.Bal7, 32768, 4, null, StateNum.Brball2, 0, 0),
  // S_BRBALL2
  new State(SpriteNum.Bal7, 32769, 4, null, StateNum.Brball1, 0, 0),
  // S_BRBALLX1
  new State(SpriteNum.Bal7, 32770, 6, null, StateNum.Brballx2, 0, 0),
  // S_BRBALLX2
  new State(SpriteNum.Bal7, 32771, 6, null, StateNum.Brballx3, 0, 0),
  // S_BRBALLX3
  new State(SpriteNum.Bal7, 32772, 6, null, StateNum.Null, 0, 0),
  // S_BOSS_STND
  new State(SpriteNum.Boss, 0, 10, null/* A_Look */, StateNum.BossStnd2, 0, 0),
  // S_BOSS_STND2
  new State(SpriteNum.Boss, 1, 10, null/* A_Look */, StateNum.BossStnd, 0, 0),
  // S_BOSS_RUN1
  new State(SpriteNum.Boss, 0, 3, null/* A_Chase */, StateNum.BossRun2, 0, 0),
  // S_BOSS_RUN2
  new State(SpriteNum.Boss, 0, 3, null/* A_Chase */, StateNum.BossRun3, 0, 0),
  // S_BOSS_RUN3
  new State(SpriteNum.Boss, 1, 3, null/* A_Chase */, StateNum.BossRun4, 0, 0),
  // S_BOSS_RUN4
  new State(SpriteNum.Boss, 1, 3, null/* A_Chase */, StateNum.BossRun5, 0, 0),
  // S_BOSS_RUN5
  new State(SpriteNum.Boss, 2, 3, null/* A_Chase */, StateNum.BossRun6, 0, 0),
  // S_BOSS_RUN6
  new State(SpriteNum.Boss, 2, 3, null/* A_Chase */, StateNum.BossRun7, 0, 0),
  // S_BOSS_RUN7
  new State(SpriteNum.Boss, 3, 3, null/* A_Chase */, StateNum.BossRun8, 0, 0),
  // S_BOSS_RUN8
  new State(SpriteNum.Boss, 3, 3, null/* A_Chase */, StateNum.BossRun1, 0, 0),
  // S_BOSS_ATK1
  new State(SpriteNum.Boss, 4, 8, null/* A_FaceTarget */, StateNum.BossAtk2, 0, 0),
  // S_BOSS_ATK2
  new State(SpriteNum.Boss, 5, 8, null/* A_FaceTarget */, StateNum.BossAtk3, 0, 0),
  // S_BOSS_ATK3
  new State(SpriteNum.Boss, 6, 8, null/* A_BruisAttack */, StateNum.BossRun1, 0, 0),
  // S_BOSS_PAIN
  new State(SpriteNum.Boss, 7, 2, null, StateNum.BossPain2, 0, 0),
  // S_BOSS_PAIN2
  new State(SpriteNum.Boss, 7, 2, null/* A_Pain */, StateNum.BossRun1, 0, 0),
  // S_BOSS_DIE1
  new State(SpriteNum.Boss, 8, 8, null, StateNum.BossDie2, 0, 0),
  // S_BOSS_DIE2
  new State(SpriteNum.Boss, 9, 8, null/* A_Scream */, StateNum.BossDie3, 0, 0),
  // S_BOSS_DIE3
  new State(SpriteNum.Boss, 10, 8, null, StateNum.BossDie4, 0, 0),
  // S_BOSS_DIE4
  new State(SpriteNum.Boss, 11, 8, null/* A_Fall */, StateNum.BossDie5, 0, 0),
  // S_BOSS_DIE5
  new State(SpriteNum.Boss, 12, 8, null, StateNum.BossDie6, 0, 0),
  // S_BOSS_DIE6
  new State(SpriteNum.Boss, 13, 8, null, StateNum.BossDie7, 0, 0),
  // S_BOSS_DIE7
  new State(SpriteNum.Boss, 14, -1, null/* A_BossDeath */, StateNum.Null, 0, 0),
  // S_BOSS_RAISE1
  new State(SpriteNum.Boss, 14, 8, null, StateNum.BossRaise2, 0, 0),
  // S_BOSS_RAISE2
  new State(SpriteNum.Boss, 13, 8, null, StateNum.BossRaise3, 0, 0),
  // S_BOSS_RAISE3
  new State(SpriteNum.Boss, 12, 8, null, StateNum.BossRaise4, 0, 0),
  // S_BOSS_RAISE4
  new State(SpriteNum.Boss, 11, 8, null, StateNum.BossRaise5, 0, 0),
  // S_BOSS_RAISE5
  new State(SpriteNum.Boss, 10, 8, null, StateNum.BossRaise6, 0, 0),
  // S_BOSS_RAISE6
  new State(SpriteNum.Boss, 9, 8, null, StateNum.BossRaise7, 0, 0),
  // S_BOSS_RAISE7
  new State(SpriteNum.Boss, 8, 8, null, StateNum.BossRun1, 0, 0),
  // S_BOS2_STND
  new State(SpriteNum.Bos2, 0, 10, null/* A_Look */, StateNum.Bos2Stnd2, 0, 0),
  // S_BOS2_STND2
  new State(SpriteNum.Bos2, 1, 10, null/* A_Look */, StateNum.Bos2Stnd, 0, 0),
  // S_BOS2_RUN1
  new State(SpriteNum.Bos2, 0, 3, null/* A_Chase */, StateNum.Bos2Run2, 0, 0),
  // S_BOS2_RUN2
  new State(SpriteNum.Bos2, 0, 3, null/* A_Chase */, StateNum.Bos2Run3, 0, 0),
  // S_BOS2_RUN3
  new State(SpriteNum.Bos2, 1, 3, null/* A_Chase */, StateNum.Bos2Run4, 0, 0),
  // S_BOS2_RUN4
  new State(SpriteNum.Bos2, 1, 3, null/* A_Chase */, StateNum.Bos2Run5, 0, 0),
  // S_BOS2_RUN5
  new State(SpriteNum.Bos2, 2, 3, null/* A_Chase */, StateNum.Bos2Run6, 0, 0),
  // S_BOS2_RUN6
  new State(SpriteNum.Bos2, 2, 3, null/* A_Chase */, StateNum.Bos2Run7, 0, 0),
  // S_BOS2_RUN7
  new State(SpriteNum.Bos2, 3, 3, null/* A_Chase */, StateNum.Bos2Run8, 0, 0),
  // S_BOS2_RUN8
  new State(SpriteNum.Bos2, 3, 3, null/* A_Chase */, StateNum.Bos2Run1, 0, 0),
  // S_BOS2_ATK1
  new State(SpriteNum.Bos2, 4, 8, null/* A_FaceTarget */, StateNum.Bos2Atk2, 0, 0),
  // S_BOS2_ATK2
  new State(SpriteNum.Bos2, 5, 8, null/* A_FaceTarget */, StateNum.Bos2Atk3, 0, 0),
  // S_BOS2_ATK3
  new State(SpriteNum.Bos2, 6, 8, null/* A_BruisAttack */, StateNum.Bos2Run1, 0, 0),
  // S_BOS2_PAIN
  new State(SpriteNum.Bos2, 7, 2, null, StateNum.Bos2Pain2, 0, 0),
  // S_BOS2_PAIN2
  new State(SpriteNum.Bos2, 7, 2, null/* A_Pain */, StateNum.Bos2Run1, 0, 0),
  // S_BOS2_DIE1
  new State(SpriteNum.Bos2, 8, 8, null, StateNum.Bos2Die2, 0, 0),
  // S_BOS2_DIE2
  new State(SpriteNum.Bos2, 9, 8, null/* A_Scream */, StateNum.Bos2Die3, 0, 0),
  // S_BOS2_DIE3
  new State(SpriteNum.Bos2, 10, 8, null, StateNum.Bos2Die4, 0, 0),
  // S_BOS2_DIE4
  new State(SpriteNum.Bos2, 11, 8, null/* A_Fall */, StateNum.Bos2Die5, 0, 0),
  // S_BOS2_DIE5
  new State(SpriteNum.Bos2, 12, 8, null, StateNum.Bos2Die6, 0, 0),
  // S_BOS2_DIE6
  new State(SpriteNum.Bos2, 13, 8, null, StateNum.Bos2Die7, 0, 0),
  // S_BOS2_DIE7
  new State(SpriteNum.Bos2, 14, -1, null, StateNum.Null, 0, 0),
  // S_BOS2_RAISE1
  new State(SpriteNum.Bos2, 14, 8, null, StateNum.Bos2Raise2, 0, 0),
  // S_BOS2_RAISE2
  new State(SpriteNum.Bos2, 13, 8, null, StateNum.Bos2Raise3, 0, 0),
  // S_BOS2_RAISE3
  new State(SpriteNum.Bos2, 12, 8, null, StateNum.Bos2Raise4, 0, 0),
  // S_BOS2_RAISE4
  new State(SpriteNum.Bos2, 11, 8, null, StateNum.Bos2Raise5, 0, 0),
  // S_BOS2_RAISE5
  new State(SpriteNum.Bos2, 10, 8, null, StateNum.Bos2Raise6, 0, 0),
  // S_BOS2_RAISE6
  new State(SpriteNum.Bos2, 9, 8, null, StateNum.Bos2Raise7, 0, 0),
  // S_BOS2_RAISE7
  new State(SpriteNum.Bos2, 8, 8, null, StateNum.Bos2Run1, 0, 0),
  // S_SKULL_STND
  new State(SpriteNum.Skul, 32768, 10, null/* A_Look */, StateNum.SkullStnd2, 0, 0),
  // S_SKULL_STND2
  new State(SpriteNum.Skul, 32769, 10, null/* A_Look */, StateNum.SkullStnd, 0, 0),
  // S_SKULL_RUN1
  new State(SpriteNum.Skul, 32768, 6, null/* A_Chase */, StateNum.SkullRun2, 0, 0),
  // S_SKULL_RUN2
  new State(SpriteNum.Skul, 32769, 6, null/* A_Chase */, StateNum.SkullRun1, 0, 0),
  // S_SKULL_ATK1
  new State(SpriteNum.Skul, 32770, 10, null/* A_FaceTarget */, StateNum.SkullAtk2, 0, 0),
  // S_SKULL_ATK2
  new State(SpriteNum.Skul, 32771, 4, null/* A_SkullAttack */, StateNum.SkullAtk3, 0, 0),
  // S_SKULL_ATK3
  new State(SpriteNum.Skul, 32770, 4, null, StateNum.SkullAtk4, 0, 0),
  // S_SKULL_ATK4
  new State(SpriteNum.Skul, 32771, 4, null, StateNum.SkullAtk3, 0, 0),
  // S_SKULL_PAIN
  new State(SpriteNum.Skul, 32772, 3, null, StateNum.SkullPain2, 0, 0),
  // S_SKULL_PAIN2
  new State(SpriteNum.Skul, 32772, 3, null/* A_Pain */, StateNum.SkullRun1, 0, 0),
  // S_SKULL_DIE1
  new State(SpriteNum.Skul, 32773, 6, null, StateNum.SkullDie2, 0, 0),
  // S_SKULL_DIE2
  new State(SpriteNum.Skul, 32774, 6, null/* A_Scream */, StateNum.SkullDie3, 0, 0),
  // S_SKULL_DIE3
  new State(SpriteNum.Skul, 32775, 6, null, StateNum.SkullDie4, 0, 0),
  // S_SKULL_DIE4
  new State(SpriteNum.Skul, 32776, 6, null/* A_Fall */, StateNum.SkullDie5, 0, 0),
  // S_SKULL_DIE5
  new State(SpriteNum.Skul, 9, 6, null, StateNum.SkullDie6, 0, 0),
  // S_SKULL_DIE6
  new State(SpriteNum.Skul, 10, 6, null, StateNum.Null, 0, 0),
  // S_SPID_STND
  new State(SpriteNum.Spid, 0, 10, null/* A_Look */, StateNum.SpidStnd2, 0, 0),
  // S_SPID_STND2
  new State(SpriteNum.Spid, 1, 10, null/* A_Look */, StateNum.SpidStnd, 0, 0),
  // S_SPID_RUN1
  new State(SpriteNum.Spid, 0, 3, null/* A_Metal */, StateNum.SpidRun2, 0, 0),
  // S_SPID_RUN2
  new State(SpriteNum.Spid, 0, 3, null/* A_Chase */, StateNum.SpidRun3, 0, 0),
  // S_SPID_RUN3
  new State(SpriteNum.Spid, 1, 3, null/* A_Chase */, StateNum.SpidRun4, 0, 0),
  // S_SPID_RUN4
  new State(SpriteNum.Spid, 1, 3, null/* A_Chase */, StateNum.SpidRun5, 0, 0),
  // S_SPID_RUN5
  new State(SpriteNum.Spid, 2, 3, null/* A_Metal */, StateNum.SpidRun6, 0, 0),
  // S_SPID_RUN6
  new State(SpriteNum.Spid, 2, 3, null/* A_Chase */, StateNum.SpidRun7, 0, 0),
  // S_SPID_RUN7
  new State(SpriteNum.Spid, 3, 3, null/* A_Chase */, StateNum.SpidRun8, 0, 0),
  // S_SPID_RUN8
  new State(SpriteNum.Spid, 3, 3, null/* A_Chase */, StateNum.SpidRun9, 0, 0),
  // S_SPID_RUN9
  new State(SpriteNum.Spid, 4, 3, null/* A_Metal */, StateNum.SpidRun10, 0, 0),
  // S_SPID_RUN10
  new State(SpriteNum.Spid, 4, 3, null/* A_Chase */, StateNum.SpidRun11, 0, 0),
  // S_SPID_RUN11
  new State(SpriteNum.Spid, 5, 3, null/* A_Chase */, StateNum.SpidRun12, 0, 0),
  // S_SPID_RUN12
  new State(SpriteNum.Spid, 5, 3, null/* A_Chase */, StateNum.SpidRun1, 0, 0),
  // S_SPID_ATK1
  new State(SpriteNum.Spid, 32768, 20, null/* A_FaceTarget */, StateNum.SpidAtk2, 0, 0),
  // S_SPID_ATK2
  new State(SpriteNum.Spid, 32774, 4, null/* A_SPosAttack */, StateNum.SpidAtk3, 0, 0),
  // S_SPID_ATK3
  new State(SpriteNum.Spid, 32775, 4, null/* A_SPosAttack */, StateNum.SpidAtk4, 0, 0),
  // S_SPID_ATK4
  new State(SpriteNum.Spid, 32775, 1, null/* A_SpidRefire */, StateNum.SpidAtk2, 0, 0),
  // S_SPID_PAIN
  new State(SpriteNum.Spid, 8, 3, null, StateNum.SpidPain2, 0, 0),
  // S_SPID_PAIN2
  new State(SpriteNum.Spid, 8, 3, null/* A_Pain */, StateNum.SpidRun1, 0, 0),
  // S_SPID_DIE1
  new State(SpriteNum.Spid, 9, 20, null/* A_Scream */, StateNum.SpidDie2, 0, 0),
  // S_SPID_DIE2
  new State(SpriteNum.Spid, 10, 10, null/* A_Fall */, StateNum.SpidDie3, 0, 0),
  // S_SPID_DIE3
  new State(SpriteNum.Spid, 11, 10, null, StateNum.SpidDie4, 0, 0),
  // S_SPID_DIE4
  new State(SpriteNum.Spid, 12, 10, null, StateNum.SpidDie5, 0, 0),
  // S_SPID_DIE5
  new State(SpriteNum.Spid, 13, 10, null, StateNum.SpidDie6, 0, 0),
  // S_SPID_DIE6
  new State(SpriteNum.Spid, 14, 10, null, StateNum.SpidDie7, 0, 0),
  // S_SPID_DIE7
  new State(SpriteNum.Spid, 15, 10, null, StateNum.SpidDie8, 0, 0),
  // S_SPID_DIE8
  new State(SpriteNum.Spid, 16, 10, null, StateNum.SpidDie9, 0, 0),
  // S_SPID_DIE9
  new State(SpriteNum.Spid, 17, 10, null, StateNum.SpidDie10, 0, 0),
  // S_SPID_DIE10
  new State(SpriteNum.Spid, 18, 30, null, StateNum.SpidDie11, 0, 0),
  // S_SPID_DIE11
  new State(SpriteNum.Spid, 18, -1, null/* A_BossDeath */, StateNum.Null, 0, 0),
  // S_BSPI_STND
  new State(SpriteNum.Bspi, 0, 10, null/* A_Look */, StateNum.BspiStnd2, 0, 0),
  // S_BSPI_STND2
  new State(SpriteNum.Bspi, 1, 10, null/* A_Look */, StateNum.BspiStnd, 0, 0),
  // S_BSPI_SIGHT
  new State(SpriteNum.Bspi, 0, 20, null, StateNum.BspiRun1, 0, 0),
  // S_BSPI_RUN1
  new State(SpriteNum.Bspi, 0, 3, null/* A_BabyMetal */, StateNum.BspiRun2, 0, 0),
  // S_BSPI_RUN2
  new State(SpriteNum.Bspi, 0, 3, null/* A_Chase */, StateNum.BspiRun3, 0, 0),
  // S_BSPI_RUN3
  new State(SpriteNum.Bspi, 1, 3, null/* A_Chase */, StateNum.BspiRun4, 0, 0),
  // S_BSPI_RUN4
  new State(SpriteNum.Bspi, 1, 3, null/* A_Chase */, StateNum.BspiRun5, 0, 0),
  // S_BSPI_RUN5
  new State(SpriteNum.Bspi, 2, 3, null/* A_Chase */, StateNum.BspiRun6, 0, 0),
  // S_BSPI_RUN6
  new State(SpriteNum.Bspi, 2, 3, null/* A_Chase */, StateNum.BspiRun7, 0, 0),
  // S_BSPI_RUN7
  new State(SpriteNum.Bspi, 3, 3, null/* A_BabyMetal */, StateNum.BspiRun8, 0, 0),
  // S_BSPI_RUN8
  new State(SpriteNum.Bspi, 3, 3, null/* A_Chase */, StateNum.BspiRun9, 0, 0),
  // S_BSPI_RUN9
  new State(SpriteNum.Bspi, 4, 3, null/* A_Chase */, StateNum.BspiRun10, 0, 0),
  // S_BSPI_RUN10
  new State(SpriteNum.Bspi, 4, 3, null/* A_Chase */, StateNum.BspiRun11, 0, 0),
  // S_BSPI_RUN11
  new State(SpriteNum.Bspi, 5, 3, null/* A_Chase */, StateNum.BspiRun12, 0, 0),
  // S_BSPI_RUN12
  new State(SpriteNum.Bspi, 5, 3, null/* A_Chase */, StateNum.BspiRun1, 0, 0),
  // S_BSPI_ATK1
  new State(SpriteNum.Bspi, 32768, 20, null/* A_FaceTarget */, StateNum.BspiAtk2, 0, 0),
  // S_BSPI_ATK2
  new State(SpriteNum.Bspi, 32774, 4, null/* A_BspiAttack */, StateNum.BspiAtk3, 0, 0),
  // S_BSPI_ATK3
  new State(SpriteNum.Bspi, 32775, 4, null, StateNum.BspiAtk4, 0, 0),
  // S_BSPI_ATK4
  new State(SpriteNum.Bspi, 32775, 1, null/* A_SpidRefire */, StateNum.BspiAtk2, 0, 0),
  // S_BSPI_PAIN
  new State(SpriteNum.Bspi, 8, 3, null, StateNum.BspiPain2, 0, 0),
  // S_BSPI_PAIN2
  new State(SpriteNum.Bspi, 8, 3, null/* A_Pain */, StateNum.BspiRun1, 0, 0),
  // S_BSPI_DIE1
  new State(SpriteNum.Bspi, 9, 20, null/* A_Scream */, StateNum.BspiDie2, 0, 0),
  // S_BSPI_DIE2
  new State(SpriteNum.Bspi, 10, 7, null/* A_Fall */, StateNum.BspiDie3, 0, 0),
  // S_BSPI_DIE3
  new State(SpriteNum.Bspi, 11, 7, null, StateNum.BspiDie4, 0, 0),
  // S_BSPI_DIE4
  new State(SpriteNum.Bspi, 12, 7, null, StateNum.BspiDie5, 0, 0),
  // S_BSPI_DIE5
  new State(SpriteNum.Bspi, 13, 7, null, StateNum.BspiDie6, 0, 0),
  // S_BSPI_DIE6
  new State(SpriteNum.Bspi, 14, 7, null, StateNum.BspiDie7, 0, 0),
  // S_BSPI_DIE7
  new State(SpriteNum.Bspi, 15, -1, null/* A_BossDeath */, StateNum.Null, 0, 0),
  // S_BSPI_RAISE1
  new State(SpriteNum.Bspi, 15, 5, null, StateNum.BspiRaise2, 0, 0),
  // S_BSPI_RAISE2
  new State(SpriteNum.Bspi, 14, 5, null, StateNum.BspiRaise3, 0, 0),
  // S_BSPI_RAISE3
  new State(SpriteNum.Bspi, 13, 5, null, StateNum.BspiRaise4, 0, 0),
  // S_BSPI_RAISE4
  new State(SpriteNum.Bspi, 12, 5, null, StateNum.BspiRaise5, 0, 0),
  // S_BSPI_RAISE5
  new State(SpriteNum.Bspi, 11, 5, null, StateNum.BspiRaise6, 0, 0),
  // S_BSPI_RAISE6
  new State(SpriteNum.Bspi, 10, 5, null, StateNum.BspiRaise7, 0, 0),
  // S_BSPI_RAISE7
  new State(SpriteNum.Bspi, 9, 5, null, StateNum.BspiRun1, 0, 0),
  // S_ARACH_PLAZ
  new State(SpriteNum.Apls, 32768, 5, null, StateNum.ArachPlaz2, 0, 0),
  // S_ARACH_PLAZ2
  new State(SpriteNum.Apls, 32769, 5, null, StateNum.ArachPlaz, 0, 0),
  // S_ARACH_PLEX
  new State(SpriteNum.Apbx, 32768, 5, null, StateNum.ArachPlex2, 0, 0),
  // S_ARACH_PLEX2
  new State(SpriteNum.Apbx, 32769, 5, null, StateNum.ArachPlex3, 0, 0),
  // S_ARACH_PLEX3
  new State(SpriteNum.Apbx, 32770, 5, null, StateNum.ArachPlex4, 0, 0),
  // S_ARACH_PLEX4
  new State(SpriteNum.Apbx, 32771, 5, null, StateNum.ArachPlex5, 0, 0),
  // S_ARACH_PLEX5
  new State(SpriteNum.Apbx, 32772, 5, null, StateNum.Null, 0, 0),
  // S_CYBER_STND
  new State(SpriteNum.Cybr, 0, 10, null/* A_Look */, StateNum.CyberStnd2, 0, 0),
  // S_CYBER_STND2
  new State(SpriteNum.Cybr, 1, 10, null/* A_Look */, StateNum.CyberStnd, 0, 0),
  // S_CYBER_RUN1
  new State(SpriteNum.Cybr, 0, 3, null/* A_Hoof */, StateNum.CyberRun2, 0, 0),
  // S_CYBER_RUN2
  new State(SpriteNum.Cybr, 0, 3, null/* A_Chase */, StateNum.CyberRun3, 0, 0),
  // S_CYBER_RUN3
  new State(SpriteNum.Cybr, 1, 3, null/* A_Chase */, StateNum.CyberRun4, 0, 0),
  // S_CYBER_RUN4
  new State(SpriteNum.Cybr, 1, 3, null/* A_Chase */, StateNum.CyberRun5, 0, 0),
  // S_CYBER_RUN5
  new State(SpriteNum.Cybr, 2, 3, null/* A_Chase */, StateNum.CyberRun6, 0, 0),
  // S_CYBER_RUN6
  new State(SpriteNum.Cybr, 2, 3, null/* A_Chase */, StateNum.CyberRun7, 0, 0),
  // S_CYBER_RUN7
  new State(SpriteNum.Cybr, 3, 3, null/* A_Metal */, StateNum.CyberRun8, 0, 0),
  // S_CYBER_RUN8
  new State(SpriteNum.Cybr, 3, 3, null/* A_Chase */, StateNum.CyberRun1, 0, 0),
  // S_CYBER_ATK1
  new State(SpriteNum.Cybr, 4, 6, null/* A_FaceTarget */, StateNum.CyberAtk2, 0, 0),
  // S_CYBER_ATK2
  new State(SpriteNum.Cybr, 5, 12, null/* A_CyberAttack */, StateNum.CyberAtk3, 0, 0),
  // S_CYBER_ATK3
  new State(SpriteNum.Cybr, 4, 12, null/* A_FaceTarget */, StateNum.CyberAtk4, 0, 0),
  // S_CYBER_ATK4
  new State(SpriteNum.Cybr, 5, 12, null/* A_CyberAttack */, StateNum.CyberAtk5, 0, 0),
  // S_CYBER_ATK5
  new State(SpriteNum.Cybr, 4, 12, null/* A_FaceTarget */, StateNum.CyberAtk6, 0, 0),
  // S_CYBER_ATK6
  new State(SpriteNum.Cybr, 5, 12, null/* A_CyberAttack */, StateNum.CyberRun1, 0, 0),
  // S_CYBER_PAIN
  new State(SpriteNum.Cybr, 6, 10, null/* A_Pain */, StateNum.CyberRun1, 0, 0),
  // S_CYBER_DIE1
  new State(SpriteNum.Cybr, 7, 10, null, StateNum.CyberDie2, 0, 0),
  // S_CYBER_DIE2
  new State(SpriteNum.Cybr, 8, 10, null/* A_Scream */, StateNum.CyberDie3, 0, 0),
  // S_CYBER_DIE3
  new State(SpriteNum.Cybr, 9, 10, null, StateNum.CyberDie4, 0, 0),
  // S_CYBER_DIE4
  new State(SpriteNum.Cybr, 10, 10, null, StateNum.CyberDie5, 0, 0),
  // S_CYBER_DIE5
  new State(SpriteNum.Cybr, 11, 10, null, StateNum.CyberDie6, 0, 0),
  // S_CYBER_DIE6
  new State(SpriteNum.Cybr, 12, 10, null/* A_Fall */, StateNum.CyberDie7, 0, 0),
  // S_CYBER_DIE7
  new State(SpriteNum.Cybr, 13, 10, null, StateNum.CyberDie8, 0, 0),
  // S_CYBER_DIE8
  new State(SpriteNum.Cybr, 14, 10, null, StateNum.CyberDie9, 0, 0),
  // S_CYBER_DIE9
  new State(SpriteNum.Cybr, 15, 30, null, StateNum.CyberDie10, 0, 0),
  // S_CYBER_DIE10
  new State(SpriteNum.Cybr, 15, -1, null/* A_BossDeath */, StateNum.Null, 0, 0),
  // S_PAIN_STND
  new State(SpriteNum.Pain, 0, 10, null/* A_Look */, StateNum.PainStnd, 0, 0),
  // S_PAIN_RUN1
  new State(SpriteNum.Pain, 0, 3, null/* A_Chase */, StateNum.PainRun2, 0, 0),
  // S_PAIN_RUN2
  new State(SpriteNum.Pain, 0, 3, null/* A_Chase */, StateNum.PainRun3, 0, 0),
  // S_PAIN_RUN3
  new State(SpriteNum.Pain, 1, 3, null/* A_Chase */, StateNum.PainRun4, 0, 0),
  // S_PAIN_RUN4
  new State(SpriteNum.Pain, 1, 3, null/* A_Chase */, StateNum.PainRun5, 0, 0),
  // S_PAIN_RUN5
  new State(SpriteNum.Pain, 2, 3, null/* A_Chase */, StateNum.PainRun6, 0, 0),
  // S_PAIN_RUN6
  new State(SpriteNum.Pain, 2, 3, null/* A_Chase */, StateNum.PainRun1, 0, 0),
  // S_PAIN_ATK1
  new State(SpriteNum.Pain, 3, 5, null/* A_FaceTarget */, StateNum.PainAtk2, 0, 0),
  // S_PAIN_ATK2
  new State(SpriteNum.Pain, 4, 5, null/* A_FaceTarget */, StateNum.PainAtk3, 0, 0),
  // S_PAIN_ATK3
  new State(SpriteNum.Pain, 32773, 5, null/* A_FaceTarget */, StateNum.PainAtk4, 0, 0),
  // S_PAIN_ATK4
  new State(SpriteNum.Pain, 32773, 0, null/* A_PainAttack */, StateNum.PainRun1, 0, 0),
  // S_PAIN_PAIN
  new State(SpriteNum.Pain, 6, 6, null, StateNum.PainPain2, 0, 0),
  // S_PAIN_PAIN2
  new State(SpriteNum.Pain, 6, 6, null/* A_Pain */, StateNum.PainRun1, 0, 0),
  // S_PAIN_DIE1
  new State(SpriteNum.Pain, 32775, 8, null, StateNum.PainDie2, 0, 0),
  // S_PAIN_DIE2
  new State(SpriteNum.Pain, 32776, 8, null/* A_Scream */, StateNum.PainDie3, 0, 0),
  // S_PAIN_DIE3
  new State(SpriteNum.Pain, 32777, 8, null, StateNum.PainDie4, 0, 0),
  // S_PAIN_DIE4
  new State(SpriteNum.Pain, 32778, 8, null, StateNum.PainDie5, 0, 0),
  // S_PAIN_DIE5
  new State(SpriteNum.Pain, 32779, 8, null/* A_PainDie */, StateNum.PainDie6, 0, 0),
  // S_PAIN_DIE6
  new State(SpriteNum.Pain, 32780, 8, null, StateNum.Null, 0, 0),
  // S_PAIN_RAISE1
  new State(SpriteNum.Pain, 12, 8, null, StateNum.PainRaise2, 0, 0),
  // S_PAIN_RAISE2
  new State(SpriteNum.Pain, 11, 8, null, StateNum.PainRaise3, 0, 0),
  // S_PAIN_RAISE3
  new State(SpriteNum.Pain, 10, 8, null, StateNum.PainRaise4, 0, 0),
  // S_PAIN_RAISE4
  new State(SpriteNum.Pain, 9, 8, null, StateNum.PainRaise5, 0, 0),
  // S_PAIN_RAISE5
  new State(SpriteNum.Pain, 8, 8, null, StateNum.PainRaise6, 0, 0),
  // S_PAIN_RAISE6
  new State(SpriteNum.Pain, 7, 8, null, StateNum.PainRun1, 0, 0),
  // S_SSWV_STND
  new State(SpriteNum.Sswv, 0, 10, null/* A_Look */, StateNum.SswvStnd2, 0, 0),
  // S_SSWV_STND2
  new State(SpriteNum.Sswv, 1, 10, null/* A_Look */, StateNum.SswvStnd, 0, 0),
  // S_SSWV_RUN1
  new State(SpriteNum.Sswv, 0, 3, null/* A_Chase */, StateNum.SswvRun2, 0, 0),
  // S_SSWV_RUN2
  new State(SpriteNum.Sswv, 0, 3, null/* A_Chase */, StateNum.SswvRun3, 0, 0),
  // S_SSWV_RUN3
  new State(SpriteNum.Sswv, 1, 3, null/* A_Chase */, StateNum.SswvRun4, 0, 0),
  // S_SSWV_RUN4
  new State(SpriteNum.Sswv, 1, 3, null/* A_Chase */, StateNum.SswvRun5, 0, 0),
  // S_SSWV_RUN5
  new State(SpriteNum.Sswv, 2, 3, null/* A_Chase */, StateNum.SswvRun6, 0, 0),
  // S_SSWV_RUN6
  new State(SpriteNum.Sswv, 2, 3, null/* A_Chase */, StateNum.SswvRun7, 0, 0),
  // S_SSWV_RUN7
  new State(SpriteNum.Sswv, 3, 3, null/* A_Chase */, StateNum.SswvRun8, 0, 0),
  // S_SSWV_RUN8
  new State(SpriteNum.Sswv, 3, 3, null/* A_Chase */, StateNum.SswvRun1, 0, 0),
  // S_SSWV_ATK1
  new State(SpriteNum.Sswv, 4, 10, null/* A_FaceTarget */, StateNum.SswvAtk2, 0, 0),
  // S_SSWV_ATK2
  new State(SpriteNum.Sswv, 5, 10, null/* A_FaceTarget */, StateNum.SswvAtk3, 0, 0),
  // S_SSWV_ATK3
  new State(SpriteNum.Sswv, 32774, 4, null/* A_CPosAttack */, StateNum.SswvAtk4, 0, 0),
  // S_SSWV_ATK4
  new State(SpriteNum.Sswv, 5, 6, null/* A_FaceTarget */, StateNum.SswvAtk5, 0, 0),
  // S_SSWV_ATK5
  new State(SpriteNum.Sswv, 32774, 4, null/* A_CPosAttack */, StateNum.SswvAtk6, 0, 0),
  // S_SSWV_ATK6
  new State(SpriteNum.Sswv, 5, 1, null/* A_CPosRefire */, StateNum.SswvAtk2, 0, 0),
  // S_SSWV_PAIN
  new State(SpriteNum.Sswv, 7, 3, null, StateNum.SswvPain2, 0, 0),
  // S_SSWV_PAIN2
  new State(SpriteNum.Sswv, 7, 3, null/* A_Pain */, StateNum.SswvRun1, 0, 0),
  // S_SSWV_DIE1
  new State(SpriteNum.Sswv, 8, 5, null, StateNum.SswvDie2, 0, 0),
  // S_SSWV_DIE2
  new State(SpriteNum.Sswv, 9, 5, null/* A_Scream */, StateNum.SswvDie3, 0, 0),
  // S_SSWV_DIE3
  new State(SpriteNum.Sswv, 10, 5, null/* A_Fall */, StateNum.SswvDie4, 0, 0),
  // S_SSWV_DIE4
  new State(SpriteNum.Sswv, 11, 5, null, StateNum.SswvDie5, 0, 0),
  // S_SSWV_DIE5
  new State(SpriteNum.Sswv, 12, -1, null, StateNum.Null, 0, 0),
  // S_SSWV_XDIE1
  new State(SpriteNum.Sswv, 13, 5, null, StateNum.SswvXdie2, 0, 0),
  // S_SSWV_XDIE2
  new State(SpriteNum.Sswv, 14, 5, null/* A_XScream */, StateNum.SswvXdie3, 0, 0),
  // S_SSWV_XDIE3
  new State(SpriteNum.Sswv, 15, 5, null/* A_Fall */, StateNum.SswvXdie4, 0, 0),
  // S_SSWV_XDIE4
  new State(SpriteNum.Sswv, 16, 5, null, StateNum.SswvXdie5, 0, 0),
  // S_SSWV_XDIE5
  new State(SpriteNum.Sswv, 17, 5, null, StateNum.SswvXdie6, 0, 0),
  // S_SSWV_XDIE6
  new State(SpriteNum.Sswv, 18, 5, null, StateNum.SswvXdie7, 0, 0),
  // S_SSWV_XDIE7
  new State(SpriteNum.Sswv, 19, 5, null, StateNum.SswvXdie8, 0, 0),
  // S_SSWV_XDIE8
  new State(SpriteNum.Sswv, 20, 5, null, StateNum.SswvXdie9, 0, 0),
  // S_SSWV_XDIE9
  new State(SpriteNum.Sswv, 21, -1, null, StateNum.Null, 0, 0),
  // S_SSWV_RAISE1
  new State(SpriteNum.Sswv, 12, 5, null, StateNum.SswvRaise2, 0, 0),
  // S_SSWV_RAISE2
  new State(SpriteNum.Sswv, 11, 5, null, StateNum.SswvRaise3, 0, 0),
  // S_SSWV_RAISE3
  new State(SpriteNum.Sswv, 10, 5, null, StateNum.SswvRaise4, 0, 0),
  // S_SSWV_RAISE4
  new State(SpriteNum.Sswv, 9, 5, null, StateNum.SswvRaise5, 0, 0),
  // S_SSWV_RAISE5
  new State(SpriteNum.Sswv, 8, 5, null, StateNum.SswvRun1, 0, 0),
  // S_KEENSTND
  new State(SpriteNum.Keen, 0, -1, null, StateNum.Keenstnd, 0, 0),
  // S_COMMKEEN
  new State(SpriteNum.Keen, 0, 6, null, StateNum.Commkeen2, 0, 0),
  // S_COMMKEEN2
  new State(SpriteNum.Keen, 1, 6, null, StateNum.Commkeen3, 0, 0),
  // S_COMMKEEN3
  new State(SpriteNum.Keen, 2, 6, null/* A_Scream */, StateNum.Commkeen4, 0, 0),
  // S_COMMKEEN4
  new State(SpriteNum.Keen, 3, 6, null, StateNum.Commkeen5, 0, 0),
  // S_COMMKEEN5
  new State(SpriteNum.Keen, 4, 6, null, StateNum.Commkeen6, 0, 0),
  // S_COMMKEEN6
  new State(SpriteNum.Keen, 5, 6, null, StateNum.Commkeen7, 0, 0),
  // S_COMMKEEN7
  new State(SpriteNum.Keen, 6, 6, null, StateNum.Commkeen8, 0, 0),
  // S_COMMKEEN8
  new State(SpriteNum.Keen, 7, 6, null, StateNum.Commkeen9, 0, 0),
  // S_COMMKEEN9
  new State(SpriteNum.Keen, 8, 6, null, StateNum.Commkeen10, 0, 0),
  // S_COMMKEEN10
  new State(SpriteNum.Keen, 9, 6, null, StateNum.Commkeen11, 0, 0),
  // S_COMMKEEN11
  new State(SpriteNum.Keen, 10, 6, null/* A_KeenDie */, StateNum.Commkeen12, 0, 0),
  // S_COMMKEEN12
  new State(SpriteNum.Keen, 11, -1, null, StateNum.Null, 0, 0),
  // S_KEENPAIN
  new State(SpriteNum.Keen, 12, 4, null, StateNum.Keenpain2, 0, 0),
  // S_KEENPAIN2
  new State(SpriteNum.Keen, 12, 8, null/* A_Pain */, StateNum.Keenstnd, 0, 0),
  // S_BRAIN
  new State(SpriteNum.Bbrn, 0, -1, null, StateNum.Null, 0, 0),
  // S_BRAIN_PAIN
  new State(SpriteNum.Bbrn, 1, 36, null/* A_BrainPain */, StateNum.Brain, 0, 0),
  // S_BRAIN_DIE1
  new State(SpriteNum.Bbrn, 0, 100, null/* A_BrainScream */, StateNum.BrainDie2, 0, 0),
  // S_BRAIN_DIE2
  new State(SpriteNum.Bbrn, 0, 10, null, StateNum.BrainDie3, 0, 0),
  // S_BRAIN_DIE3
  new State(SpriteNum.Bbrn, 0, 10, null, StateNum.BrainDie4, 0, 0),
  // S_BRAIN_DIE4
  new State(SpriteNum.Bbrn, 0, -1, null/* A_BrainDie */, StateNum.Null, 0, 0),
  // S_BRAINEYE
  new State(SpriteNum.Sswv, 0, 10, null/* A_Look */, StateNum.Braineye, 0, 0),
  // S_BRAINEYESEE
  new State(SpriteNum.Sswv, 0, 181, null/* A_BrainAwake */, StateNum.Braineye1, 0, 0),
  // S_BRAINEYE1
  new State(SpriteNum.Sswv, 0, 150, null/* A_BrainSpit */, StateNum.Braineye1, 0, 0),
  // S_SPAWN1
  new State(SpriteNum.Bosf, 32768, 3, null/* A_SpawnSound */, StateNum.Spawn2, 0, 0),
  // S_SPAWN2
  new State(SpriteNum.Bosf, 32769, 3, null/* A_SpawnFly */, StateNum.Spawn3, 0, 0),
  // S_SPAWN3
  new State(SpriteNum.Bosf, 32770, 3, null/* A_SpawnFly */, StateNum.Spawn4, 0, 0),
  // S_SPAWN4
  new State(SpriteNum.Bosf, 32771, 3, null/* A_SpawnFly */, StateNum.Spawn1, 0, 0),
  // S_SPAWNFIRE1
  new State(SpriteNum.Fire, 32768, 4, null/* A_Fire */, StateNum.Spawnfire2, 0, 0),
  // S_SPAWNFIRE2
  new State(SpriteNum.Fire, 32769, 4, null/* A_Fire */, StateNum.Spawnfire3, 0, 0),
  // S_SPAWNFIRE3
  new State(SpriteNum.Fire, 32770, 4, null/* A_Fire */, StateNum.Spawnfire4, 0, 0),
  // S_SPAWNFIRE4
  new State(SpriteNum.Fire, 32771, 4, null/* A_Fire */, StateNum.Spawnfire5, 0, 0),
  // S_SPAWNFIRE5
  new State(SpriteNum.Fire, 32772, 4, null/* A_Fire */, StateNum.Spawnfire6, 0, 0),
  // S_SPAWNFIRE6
  new State(SpriteNum.Fire, 32773, 4, null/* A_Fire */, StateNum.Spawnfire7, 0, 0),
  // S_SPAWNFIRE7
  new State(SpriteNum.Fire, 32774, 4, null/* A_Fire */, StateNum.Spawnfire8, 0, 0),
  // S_SPAWNFIRE8
  new State(SpriteNum.Fire, 32775, 4, null/* A_Fire */, StateNum.Null, 0, 0),
  // S_BRAINEXPLODE1
  new State(SpriteNum.Misl, 32769, 10, null, StateNum.Brainexplode2, 0, 0),
  // S_BRAINEXPLODE2
  new State(SpriteNum.Misl, 32770, 10, null, StateNum.Brainexplode3, 0, 0),
  // S_BRAINEXPLODE3
  new State(SpriteNum.Misl, 32771, 10, null/* A_BrainExplode */, StateNum.Null, 0, 0),
  // S_ARM1
  new State(SpriteNum.Arm1, 0, 6, null, StateNum.Arm1a, 0, 0),
  // S_ARM1A
  new State(SpriteNum.Arm1, 32769, 7, null, StateNum.Arm1, 0, 0),
  // S_ARM2
  new State(SpriteNum.Arm2, 0, 6, null, StateNum.Arm2a, 0, 0),
  // S_ARM2A
  new State(SpriteNum.Arm2, 32769, 6, null, StateNum.Arm2, 0, 0),
  // S_BAR1
  new State(SpriteNum.Bar1, 0, 6, null, StateNum.Bar2, 0, 0),
  // S_BAR2
  new State(SpriteNum.Bar1, 1, 6, null, StateNum.Bar1, 0, 0),
  // S_BEXP
  new State(SpriteNum.Bexp, 32768, 5, null, StateNum.Bexp2, 0, 0),
  // S_BEXP2
  new State(SpriteNum.Bexp, 32769, 5, null/* A_Scream */, StateNum.Bexp3, 0, 0),
  // S_BEXP3
  new State(SpriteNum.Bexp, 32770, 5, null, StateNum.Bexp4, 0, 0),
  // S_BEXP4
  new State(SpriteNum.Bexp, 32771, 10, null/* A_Explode */, StateNum.Bexp5, 0, 0),
  // S_BEXP5
  new State(SpriteNum.Bexp, 32772, 10, null, StateNum.Null, 0, 0),
  // S_BBAR1
  new State(SpriteNum.Fcan, 32768, 4, null, StateNum.Bbar2, 0, 0),
  // S_BBAR2
  new State(SpriteNum.Fcan, 32769, 4, null, StateNum.Bbar3, 0, 0),
  // S_BBAR3
  new State(SpriteNum.Fcan, 32770, 4, null, StateNum.Bbar1, 0, 0),
  // S_BON1
  new State(SpriteNum.Bon1, 0, 6, null, StateNum.Bon1a, 0, 0),
  // S_BON1A
  new State(SpriteNum.Bon1, 1, 6, null, StateNum.Bon1b, 0, 0),
  // S_BON1B
  new State(SpriteNum.Bon1, 2, 6, null, StateNum.Bon1c, 0, 0),
  // S_BON1C
  new State(SpriteNum.Bon1, 3, 6, null, StateNum.Bon1d, 0, 0),
  // S_BON1D
  new State(SpriteNum.Bon1, 2, 6, null, StateNum.Bon1e, 0, 0),
  // S_BON1E
  new State(SpriteNum.Bon1, 1, 6, null, StateNum.Bon1, 0, 0),
  // S_BON2
  new State(SpriteNum.Bon2, 0, 6, null, StateNum.Bon2a, 0, 0),
  // S_BON2A
  new State(SpriteNum.Bon2, 1, 6, null, StateNum.Bon2b, 0, 0),
  // S_BON2B
  new State(SpriteNum.Bon2, 2, 6, null, StateNum.Bon2c, 0, 0),
  // S_BON2C
  new State(SpriteNum.Bon2, 3, 6, null, StateNum.Bon2d, 0, 0),
  // S_BON2D
  new State(SpriteNum.Bon2, 2, 6, null, StateNum.Bon2e, 0, 0),
  // S_BON2E
  new State(SpriteNum.Bon2, 1, 6, null, StateNum.Bon2, 0, 0),
  // S_BKEY
  new State(SpriteNum.Bkey, 0, 10, null, StateNum.Bkey2, 0, 0),
  // S_BKEY2
  new State(SpriteNum.Bkey, 32769, 10, null, StateNum.Bkey, 0, 0),
  // S_RKEY
  new State(SpriteNum.Rkey, 0, 10, null, StateNum.Rkey2, 0, 0),
  // S_RKEY2
  new State(SpriteNum.Rkey, 32769, 10, null, StateNum.Rkey, 0, 0),
  // S_YKEY
  new State(SpriteNum.Ykey, 0, 10, null, StateNum.Ykey2, 0, 0),
  // S_YKEY2
  new State(SpriteNum.Ykey, 32769, 10, null, StateNum.Ykey, 0, 0),
  // S_BSKULL
  new State(SpriteNum.Bsku, 0, 10, null, StateNum.Bskull2, 0, 0),
  // S_BSKULL2
  new State(SpriteNum.Bsku, 32769, 10, null, StateNum.Bskull, 0, 0),
  // S_RSKULL
  new State(SpriteNum.Rsku, 0, 10, null, StateNum.Rskull2, 0, 0),
  // S_RSKULL2
  new State(SpriteNum.Rsku, 32769, 10, null, StateNum.Rskull, 0, 0),
  // S_YSKULL
  new State(SpriteNum.Ysku, 0, 10, null, StateNum.Yskull2, 0, 0),
  // S_YSKULL2
  new State(SpriteNum.Ysku, 32769, 10, null, StateNum.Yskull, 0, 0),
  // S_STIM
  new State(SpriteNum.Stim, 0, -1, null, StateNum.Null, 0, 0),
  // S_MEDI
  new State(SpriteNum.Medi, 0, -1, null, StateNum.Null, 0, 0),
  // S_SOUL
  new State(SpriteNum.Soul, 32768, 6, null, StateNum.Soul2, 0, 0),
  // S_SOUL2
  new State(SpriteNum.Soul, 32769, 6, null, StateNum.Soul3, 0, 0),
  // S_SOUL3
  new State(SpriteNum.Soul, 32770, 6, null, StateNum.Soul4, 0, 0),
  // S_SOUL4
  new State(SpriteNum.Soul, 32771, 6, null, StateNum.Soul5, 0, 0),
  // S_SOUL5
  new State(SpriteNum.Soul, 32770, 6, null, StateNum.Soul6, 0, 0),
  // S_SOUL6
  new State(SpriteNum.Soul, 32769, 6, null, StateNum.Soul, 0, 0),
  // S_PINV
  new State(SpriteNum.Pinv, 32768, 6, null, StateNum.Pinv2, 0, 0),
  // S_PINV2
  new State(SpriteNum.Pinv, 32769, 6, null, StateNum.Pinv3, 0, 0),
  // S_PINV3
  new State(SpriteNum.Pinv, 32770, 6, null, StateNum.Pinv4, 0, 0),
  // S_PINV4
  new State(SpriteNum.Pinv, 32771, 6, null, StateNum.Pinv, 0, 0),
  // S_PSTR
  new State(SpriteNum.Pstr, 32768, -1, null, StateNum.Null, 0, 0),
  // S_PINS
  new State(SpriteNum.Pins, 32768, 6, null, StateNum.Pins2, 0, 0),
  // S_PINS2
  new State(SpriteNum.Pins, 32769, 6, null, StateNum.Pins3, 0, 0),
  // S_PINS3
  new State(SpriteNum.Pins, 32770, 6, null, StateNum.Pins4, 0, 0),
  // S_PINS4
  new State(SpriteNum.Pins, 32771, 6, null, StateNum.Pins, 0, 0),
  // S_MEGA
  new State(SpriteNum.Mega, 32768, 6, null, StateNum.Mega2, 0, 0),
  // S_MEGA2
  new State(SpriteNum.Mega, 32769, 6, null, StateNum.Mega3, 0, 0),
  // S_MEGA3
  new State(SpriteNum.Mega, 32770, 6, null, StateNum.Mega4, 0, 0),
  // S_MEGA4
  new State(SpriteNum.Mega, 32771, 6, null, StateNum.Mega, 0, 0),
  // S_SUIT
  new State(SpriteNum.Suit, 32768, -1, null, StateNum.Null, 0, 0),
  // S_PMAP
  new State(SpriteNum.Pmap, 32768, 6, null, StateNum.Pmap2, 0, 0),
  // S_PMAP2
  new State(SpriteNum.Pmap, 32769, 6, null, StateNum.Pmap3, 0, 0),
  // S_PMAP3
  new State(SpriteNum.Pmap, 32770, 6, null, StateNum.Pmap4, 0, 0),
  // S_PMAP4
  new State(SpriteNum.Pmap, 32771, 6, null, StateNum.Pmap5, 0, 0),
  // S_PMAP5
  new State(SpriteNum.Pmap, 32770, 6, null, StateNum.Pmap6, 0, 0),
  // S_PMAP6
  new State(SpriteNum.Pmap, 32769, 6, null, StateNum.Pmap, 0, 0),
  // S_PVIS
  new State(SpriteNum.Pvis, 32768, 6, null, StateNum.Pvis2, 0, 0),
  // S_PVIS2
  new State(SpriteNum.Pvis, 1, 6, null, StateNum.Pvis, 0, 0),
  // S_CLIP
  new State(SpriteNum.Clip, 0, -1, null, StateNum.Null, 0, 0),
  // S_AMMO
  new State(SpriteNum.Ammo, 0, -1, null, StateNum.Null, 0, 0),
  // S_ROCK
  new State(SpriteNum.Rock, 0, -1, null, StateNum.Null, 0, 0),
  // S_BROK
  new State(SpriteNum.Brok, 0, -1, null, StateNum.Null, 0, 0),
  // S_CELL
  new State(SpriteNum.Cell, 0, -1, null, StateNum.Null, 0, 0),
  // S_CELP
  new State(SpriteNum.Celp, 0, -1, null, StateNum.Null, 0, 0),
  // S_SHEL
  new State(SpriteNum.Shel, 0, -1, null, StateNum.Null, 0, 0),
  // S_SBOX
  new State(SpriteNum.Sbox, 0, -1, null, StateNum.Null, 0, 0),
  // S_BPAK
  new State(SpriteNum.Bpak, 0, -1, null, StateNum.Null, 0, 0),
  // S_BFUG
  new State(SpriteNum.Bfug, 0, -1, null, StateNum.Null, 0, 0),
  // S_MGUN
  new State(SpriteNum.Mgun, 0, -1, null, StateNum.Null, 0, 0),
  // S_CSAW
  new State(SpriteNum.Csaw, 0, -1, null, StateNum.Null, 0, 0),
  // S_LAUN
  new State(SpriteNum.Laun, 0, -1, null, StateNum.Null, 0, 0),
  // S_PLAS
  new State(SpriteNum.Plas, 0, -1, null, StateNum.Null, 0, 0),
  // S_SHOT
  new State(SpriteNum.Shot, 0, -1, null, StateNum.Null, 0, 0),
  // S_SHOT2
  new State(SpriteNum.Sgn2, 0, -1, null, StateNum.Null, 0, 0),
  // S_COLU
  new State(SpriteNum.Colu, 32768, -1, null, StateNum.Null, 0, 0),
  // S_STALAG
  new State(SpriteNum.Smt2, 0, -1, null, StateNum.Null, 0, 0),
  // S_BLOODYTWITCH
  new State(SpriteNum.Gor1, 0, 10, null, StateNum.Bloodytwitch2, 0, 0),
  // S_BLOODYTWITCH2
  new State(SpriteNum.Gor1, 1, 15, null, StateNum.Bloodytwitch3, 0, 0),
  // S_BLOODYTWITCH3
  new State(SpriteNum.Gor1, 2, 8, null, StateNum.Bloodytwitch4, 0, 0),
  // S_BLOODYTWITCH4
  new State(SpriteNum.Gor1, 1, 6, null, StateNum.Bloodytwitch, 0, 0),
  // S_DEADTORSO
  new State(SpriteNum.Play, 13, -1, null, StateNum.Null, 0, 0),
  // S_DEADBOTTOM
  new State(SpriteNum.Play, 18, -1, null, StateNum.Null, 0, 0),
  // S_HEADSONSTICK
  new State(SpriteNum.Pol2, 0, -1, null, StateNum.Null, 0, 0),
  // S_GIBS
  new State(SpriteNum.Pol5, 0, -1, null, StateNum.Null, 0, 0),
  // S_HEADONASTICK
  new State(SpriteNum.Pol4, 0, -1, null, StateNum.Null, 0, 0),
  // S_HEADCANDLES
  new State(SpriteNum.Pol3, 32768, 6, null, StateNum.Headcandles2, 0, 0),
  // S_HEADCANDLES2
  new State(SpriteNum.Pol3, 32769, 6, null, StateNum.Headcandles, 0, 0),
  // S_DEADSTICK
  new State(SpriteNum.Pol1, 0, -1, null, StateNum.Null, 0, 0),
  // S_LIVESTICK
  new State(SpriteNum.Pol6, 0, 6, null, StateNum.Livestick2, 0, 0),
  // S_LIVESTICK2
  new State(SpriteNum.Pol6, 1, 8, null, StateNum.Livestick, 0, 0),
  // S_MEAT2
  new State(SpriteNum.Gor2, 0, -1, null, StateNum.Null, 0, 0),
  // S_MEAT3
  new State(SpriteNum.Gor3, 0, -1, null, StateNum.Null, 0, 0),
  // S_MEAT4
  new State(SpriteNum.Gor4, 0, -1, null, StateNum.Null, 0, 0),
  // S_MEAT5
  new State(SpriteNum.Gor5, 0, -1, null, StateNum.Null, 0, 0),
  // S_STALAGTITE
  new State(SpriteNum.Smit, 0, -1, null, StateNum.Null, 0, 0),
  // S_TALLGRNCOL
  new State(SpriteNum.Col1, 0, -1, null, StateNum.Null, 0, 0),
  // S_SHRTGRNCOL
  new State(SpriteNum.Col2, 0, -1, null, StateNum.Null, 0, 0),
  // S_TALLREDCOL
  new State(SpriteNum.Col3, 0, -1, null, StateNum.Null, 0, 0),
  // S_SHRTREDCOL
  new State(SpriteNum.Col4, 0, -1, null, StateNum.Null, 0, 0),
  // S_CANDLESTIK
  new State(SpriteNum.Cand, 32768, -1, null, StateNum.Null, 0, 0),
  // S_CANDELABRA
  new State(SpriteNum.Cbra, 32768, -1, null, StateNum.Null, 0, 0),
  // S_SKULLCOL
  new State(SpriteNum.Col6, 0, -1, null, StateNum.Null, 0, 0),
  // S_TORCHTREE
  new State(SpriteNum.Tre1, 0, -1, null, StateNum.Null, 0, 0),
  // S_BIGTREE
  new State(SpriteNum.Tre2, 0, -1, null, StateNum.Null, 0, 0),
  // S_TECHPILLAR
  new State(SpriteNum.Elec, 0, -1, null, StateNum.Null, 0, 0),
  // S_EVILEYE
  new State(SpriteNum.Ceye, 32768, 6, null, StateNum.Evileye2, 0, 0),
  // S_EVILEYE2
  new State(SpriteNum.Ceye, 32769, 6, null, StateNum.Evileye3, 0, 0),
  // S_EVILEYE3
  new State(SpriteNum.Ceye, 32770, 6, null, StateNum.Evileye4, 0, 0),
  // S_EVILEYE4
  new State(SpriteNum.Ceye, 32769, 6, null, StateNum.Evileye, 0, 0),
  // S_FLOATSKULL
  new State(SpriteNum.Fsku, 32768, 6, null, StateNum.Floatskull2, 0, 0),
  // S_FLOATSKULL2
  new State(SpriteNum.Fsku, 32769, 6, null, StateNum.Floatskull3, 0, 0),
  // S_FLOATSKULL3
  new State(SpriteNum.Fsku, 32770, 6, null, StateNum.Floatskull, 0, 0),
  // S_HEARTCOL
  new State(SpriteNum.Col5, 0, 14, null, StateNum.Heartcol2, 0, 0),
  // S_HEARTCOL2
  new State(SpriteNum.Col5, 1, 14, null, StateNum.Heartcol, 0, 0),
  // S_BLUETORCH
  new State(SpriteNum.Tblu, 32768, 4, null, StateNum.Bluetorch2, 0, 0),
  // S_BLUETORCH2
  new State(SpriteNum.Tblu, 32769, 4, null, StateNum.Bluetorch3, 0, 0),
  // S_BLUETORCH3
  new State(SpriteNum.Tblu, 32770, 4, null, StateNum.Bluetorch4, 0, 0),
  // S_BLUETORCH4
  new State(SpriteNum.Tblu, 32771, 4, null, StateNum.Bluetorch, 0, 0),
  // S_GREENTORCH
  new State(SpriteNum.Tgrn, 32768, 4, null, StateNum.Greentorch2, 0, 0),
  // S_GREENTORCH2
  new State(SpriteNum.Tgrn, 32769, 4, null, StateNum.Greentorch3, 0, 0),
  // S_GREENTORCH3
  new State(SpriteNum.Tgrn, 32770, 4, null, StateNum.Greentorch4, 0, 0),
  // S_GREENTORCH4
  new State(SpriteNum.Tgrn, 32771, 4, null, StateNum.Greentorch, 0, 0),
  // S_REDTORCH
  new State(SpriteNum.Tred, 32768, 4, null, StateNum.Redtorch2, 0, 0),
  // S_REDTORCH2
  new State(SpriteNum.Tred, 32769, 4, null, StateNum.Redtorch3, 0, 0),
  // S_REDTORCH3
  new State(SpriteNum.Tred, 32770, 4, null, StateNum.Redtorch4, 0, 0),
  // S_REDTORCH4
  new State(SpriteNum.Tred, 32771, 4, null, StateNum.Redtorch, 0, 0),
  // S_BTORCHSHRT
  new State(SpriteNum.Smbt, 32768, 4, null, StateNum.Btorchshrt2, 0, 0),
  // S_BTORCHSHRT2
  new State(SpriteNum.Smbt, 32769, 4, null, StateNum.Btorchshrt3, 0, 0),
  // S_BTORCHSHRT3
  new State(SpriteNum.Smbt, 32770, 4, null, StateNum.Btorchshrt4, 0, 0),
  // S_BTORCHSHRT4
  new State(SpriteNum.Smbt, 32771, 4, null, StateNum.Btorchshrt, 0, 0),
  // S_GTORCHSHRT
  new State(SpriteNum.Smgt, 32768, 4, null, StateNum.Gtorchshrt2, 0, 0),
  // S_GTORCHSHRT2
  new State(SpriteNum.Smgt, 32769, 4, null, StateNum.Gtorchshrt3, 0, 0),
  // S_GTORCHSHRT3
  new State(SpriteNum.Smgt, 32770, 4, null, StateNum.Gtorchshrt4, 0, 0),
  // S_GTORCHSHRT4
  new State(SpriteNum.Smgt, 32771, 4, null, StateNum.Gtorchshrt, 0, 0),
  // S_RTORCHSHRT
  new State(SpriteNum.Smrt, 32768, 4, null, StateNum.Rtorchshrt2, 0, 0),
  // S_RTORCHSHRT2
  new State(SpriteNum.Smrt, 32769, 4, null, StateNum.Rtorchshrt3, 0, 0),
  // S_RTORCHSHRT3
  new State(SpriteNum.Smrt, 32770, 4, null, StateNum.Rtorchshrt4, 0, 0),
  // S_RTORCHSHRT4
  new State(SpriteNum.Smrt, 32771, 4, null, StateNum.Rtorchshrt, 0, 0),
  // S_HANGNOGUTS
  new State(SpriteNum.Hdb1, 0, -1, null, StateNum.Null, 0, 0),
  // S_HANGBNOBRAIN
  new State(SpriteNum.Hdb2, 0, -1, null, StateNum.Null, 0, 0),
  // S_HANGTLOOKDN
  new State(SpriteNum.Hdb3, 0, -1, null, StateNum.Null, 0, 0),
  // S_HANGTSKULL
  new State(SpriteNum.Hdb4, 0, -1, null, StateNum.Null, 0, 0),
  // S_HANGTLOOKUP
  new State(SpriteNum.Hdb5, 0, -1, null, StateNum.Null, 0, 0),
  // S_HANGTNOBRAIN
  new State(SpriteNum.Hdb6, 0, -1, null, StateNum.Null, 0, 0),
  // S_COLONGIBS
  new State(SpriteNum.Pob1, 0, -1, null, StateNum.Null, 0, 0),
  // S_SMALLPOOL
  new State(SpriteNum.Pob2, 0, -1, null, StateNum.Null, 0, 0),
  // S_BRAINSTEM
  new State(SpriteNum.Brs1, 0, -1, null, StateNum.Null, 0, 0),
  // S_TECHLAMP
  new State(SpriteNum.Tlmp, 32768, 4, null, StateNum.Techlamp2, 0, 0),
  // S_TECHLAMP2
  new State(SpriteNum.Tlmp, 32769, 4, null, StateNum.Techlamp3, 0, 0),
  // S_TECHLAMP3
  new State(SpriteNum.Tlmp, 32770, 4, null, StateNum.Techlamp4, 0, 0),
  // S_TECHLAMP4
  new State(SpriteNum.Tlmp, 32771, 4, null, StateNum.Techlamp, 0, 0),
  // S_TECH2LAMP
  new State(SpriteNum.Tlp2, 32768, 4, null, StateNum.Tech2lamp2, 0, 0),
  // S_TECH2LAMP2
  new State(SpriteNum.Tlp2, 32769, 4, null, StateNum.Tech2lamp3, 0, 0),
  // S_TECH2LAMP3
  new State(SpriteNum.Tlp2, 32770, 4, null, StateNum.Tech2lamp4, 0, 0),
  // S_TECH2LAMP4
  new State(SpriteNum.Tlp2, 32771, 4, null, StateNum.Tech2lamp, 0, 0),
]

export const mObjInfo = [
  // MT_PLAYER
  new MObjInfo(
    -1,
    StateNum.Play,
    100,
    StateNum.PlayRun1,
    Sfx.None,
    0,
    Sfx.None,
    StateNum.PlayPain,
    255,
    Sfx.Plpain,
    StateNum.Null,
    StateNum.PlayAtk1,
    StateNum.PlayDie1,
    StateNum.PlayXdie1,
    Sfx.Pldeth,
    0,
    16 * FRACUNIT,
    56 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.DropOff | MObjFlag.PickUp | MObjFlag.NotDMatch,
    StateNum.Null,
  ),

  // MT_POSSESSED
  new MObjInfo(
    3004,
    StateNum.PossStnd,
    20,
    StateNum.PossRun1,
    Sfx.Posit1,
    8,
    Sfx.Pistol,
    StateNum.PossPain,
    200,
    Sfx.Popain,
    0,
    StateNum.PossAtk1,
    StateNum.PossDie1,
    StateNum.PossXdie1,
    Sfx.Podth1,
    8,
    20 * FRACUNIT,
    56 * FRACUNIT,
    100,
    0,
    Sfx.Posact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.PossRaise1,
  ),

  // MT_SHOTGUY
  new MObjInfo(
    9,
    StateNum.SposStnd,
    30,
    StateNum.SposRun1,
    Sfx.Posit2,
    8,
    0,
    StateNum.SposPain,
    170,
    Sfx.Popain,
    0,
    StateNum.SposAtk1,
    StateNum.SposDie1,
    StateNum.SposXdie1,
    Sfx.Podth2,
    8,
    20 * FRACUNIT,
    56 * FRACUNIT,
    100,
    0,
    Sfx.Posact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.SposRaise1,
  ),

  // MT_VILE
  new MObjInfo(
    64,
    StateNum.VileStnd,
    700,
    StateNum.VileRun1,
    Sfx.Vilsit,
    8,
    0,
    StateNum.VilePain,
    10,
    Sfx.Vipain,
    0,
    StateNum.VileAtk1,
    StateNum.VileDie1,
    StateNum.Null,
    Sfx.Vildth,
    15,
    20 * FRACUNIT,
    56 * FRACUNIT,
    500,
    0,
    Sfx.Vilact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.Null,
  ),

  // MT_FIRE
  new MObjInfo(
    -1,
    StateNum.Fire1,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_UNDEAD
  new MObjInfo(
    66,
    StateNum.SkelStnd,
    300,
    StateNum.SkelRun1,
    Sfx.Skesit,
    8,
    0,
    StateNum.SkelPain,
    100,
    Sfx.Popain,
    StateNum.SkelFist1,
    StateNum.SkelMiss1,
    StateNum.SkelDie1,
    StateNum.Null,
    Sfx.Skedth,
    10,
    20 * FRACUNIT,
    56 * FRACUNIT,
    500,
    0,
    Sfx.Skeact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.SkelRaise1,
  ),

  // MT_TRACER
  new MObjInfo(
    -1,
    StateNum.Tracer,
    1000,
    StateNum.Null,
    Sfx.Skeatk,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Traceexp1,
    StateNum.Null,
    Sfx.Barexp,
    10 * FRACUNIT,
    11 * FRACUNIT,
    8 * FRACUNIT,
    100,
    10,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.Missile | MObjFlag.DropOff | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_SMOKE
  new MObjInfo(
    -1,
    StateNum.Smoke1,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_FATSO
  new MObjInfo(
    67,
    StateNum.FattStnd,
    600,
    StateNum.FattRun1,
    Sfx.Mansit,
    8,
    0,
    StateNum.FattPain,
    80,
    Sfx.Mnpain,
    0,
    StateNum.FattAtk1,
    StateNum.FattDie1,
    StateNum.Null,
    Sfx.Mandth,
    8,
    48 * FRACUNIT,
    64 * FRACUNIT,
    1000,
    0,
    Sfx.Posact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.FattRaise1,
  ),

  // MT_FATSHOT
  new MObjInfo(
    -1,
    StateNum.Fatshot1,
    1000,
    StateNum.Null,
    Sfx.Firsht,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Fatshotx1,
    StateNum.Null,
    Sfx.Firxpl,
    20 * FRACUNIT,
    6 * FRACUNIT,
    8 * FRACUNIT,
    100,
    8,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.Missile | MObjFlag.DropOff | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_CHAINGUY
  new MObjInfo(
    65,
    StateNum.CposStnd,
    70,
    StateNum.CposRun1,
    Sfx.Posit2,
    8,
    0,
    StateNum.CposPain,
    170,
    Sfx.Popain,
    0,
    StateNum.CposAtk1,
    StateNum.CposDie1,
    StateNum.CposXdie1,
    Sfx.Podth2,
    8,
    20 * FRACUNIT,
    56 * FRACUNIT,
    100,
    0,
    Sfx.Posact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.CposRaise1,
  ),

  // MT_TROOP
  new MObjInfo(
    3001,
    StateNum.TrooStnd,
    60,
    StateNum.TrooRun1,
    Sfx.Bgsit1,
    8,
    0,
    StateNum.TrooPain,
    200,
    Sfx.Popain,
    StateNum.TrooAtk1,
    StateNum.TrooAtk1,
    StateNum.TrooDie1,
    StateNum.TrooXdie1,
    Sfx.Bgdth1,
    8,
    20 * FRACUNIT,
    56 * FRACUNIT,
    100,
    0,
    Sfx.Bgact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.TrooRaise1,
  ),

  // MT_SERGEANT
  new MObjInfo(
    3002,
    StateNum.SargStnd,
    150,
    StateNum.SargRun1,
    Sfx.Sgtsit,
    8,
    Sfx.Sgtatk,
    StateNum.SargPain,
    180,
    Sfx.Dmpain,
    StateNum.SargAtk1,
    0,
    StateNum.SargDie1,
    StateNum.Null,
    Sfx.Sgtdth,
    10,
    30 * FRACUNIT,
    56 * FRACUNIT,
    400,
    0,
    Sfx.Dmact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.SargRaise1,
  ),

  // MT_SHADOWS
  new MObjInfo(
    58,
    StateNum.SargStnd,
    150,
    StateNum.SargRun1,
    Sfx.Sgtsit,
    8,
    Sfx.Sgtatk,
    StateNum.SargPain,
    180,
    Sfx.Dmpain,
    StateNum.SargAtk1,
    0,
    StateNum.SargDie1,
    StateNum.Null,
    Sfx.Sgtdth,
    10,
    30 * FRACUNIT,
    56 * FRACUNIT,
    400,
    0,
    Sfx.Dmact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.Shadow | MObjFlag.CountKill,
    StateNum.SargRaise1,
  ),

  // MT_HEAD
  new MObjInfo(
    3005,
    StateNum.HeadStnd,
    400,
    StateNum.HeadRun1,
    Sfx.Cacsit,
    8,
    0,
    StateNum.HeadPain,
    128,
    Sfx.Dmpain,
    0,
    StateNum.HeadAtk1,
    StateNum.HeadDie1,
    StateNum.Null,
    Sfx.Cacdth,
    8,
    31 * FRACUNIT,
    56 * FRACUNIT,
    400,
    0,
    Sfx.Dmact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.Float | MObjFlag.NoGravity | MObjFlag.CountKill,
    StateNum.HeadRaise1,
  ),

  // MT_BRUISER
  new MObjInfo(
    3003,
    StateNum.BossStnd,
    1000,
    StateNum.BossRun1,
    Sfx.Brssit,
    8,
    0,
    StateNum.BossPain,
    50,
    Sfx.Dmpain,
    StateNum.BossAtk1,
    StateNum.BossAtk1,
    StateNum.BossDie1,
    StateNum.Null,
    Sfx.Brsdth,
    8,
    24 * FRACUNIT,
    64 * FRACUNIT,
    1000,
    0,
    Sfx.Dmact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.BossRaise1,
  ),

  // MT_BRUISERSHOT
  new MObjInfo(
    -1,
    StateNum.Brball1,
    1000,
    StateNum.Null,
    Sfx.Firsht,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Brballx1,
    StateNum.Null,
    Sfx.Firxpl,
    15 * FRACUNIT,
    6 * FRACUNIT,
    8 * FRACUNIT,
    100,
    8,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.Missile | MObjFlag.DropOff | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_KNIGHT
  new MObjInfo(
    69,
    StateNum.Bos2Stnd,
    500,
    StateNum.Bos2Run1,
    Sfx.Kntsit,
    8,
    0,
    StateNum.Bos2Pain,
    50,
    Sfx.Dmpain,
    StateNum.Bos2Atk1,
    StateNum.Bos2Atk1,
    StateNum.Bos2Die1,
    StateNum.Null,
    Sfx.Kntdth,
    8,
    24 * FRACUNIT,
    64 * FRACUNIT,
    1000,
    0,
    Sfx.Dmact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.Bos2Raise1,
  ),

  // MT_SKULL
  new MObjInfo(
    3006,
    StateNum.SkullStnd,
    100,
    StateNum.SkullRun1,
    0,
    8,
    Sfx.Sklatk,
    StateNum.SkullPain,
    256,
    Sfx.Dmpain,
    0,
    StateNum.SkullAtk1,
    StateNum.SkullDie1,
    StateNum.Null,
    Sfx.Firxpl,
    8,
    16 * FRACUNIT,
    56 * FRACUNIT,
    50,
    3,
    Sfx.Dmact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.Float | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_SPIDER
  new MObjInfo(
    7,
    StateNum.SpidStnd,
    3000,
    StateNum.SpidRun1,
    Sfx.Spisit,
    8,
    Sfx.Shotgn,
    StateNum.SpidPain,
    40,
    Sfx.Dmpain,
    0,
    StateNum.SpidAtk1,
    StateNum.SpidDie1,
    StateNum.Null,
    Sfx.Spidth,
    12,
    128 * FRACUNIT,
    100 * FRACUNIT,
    1000,
    0,
    Sfx.Dmact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.Null,
  ),

  // MT_BABY
  new MObjInfo(
    68,
    StateNum.BspiStnd,
    500,
    StateNum.BspiSight,
    Sfx.Bspsit,
    8,
    0,
    StateNum.BspiPain,
    128,
    Sfx.Dmpain,
    0,
    StateNum.BspiAtk1,
    StateNum.BspiDie1,
    StateNum.Null,
    Sfx.Bspdth,
    12,
    64 * FRACUNIT,
    64 * FRACUNIT,
    600,
    0,
    Sfx.Bspact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.BspiRaise1,
  ),

  // MT_CYBORG
  new MObjInfo(
    16,
    StateNum.CyberStnd,
    4000,
    StateNum.CyberRun1,
    Sfx.Cybsit,
    8,
    0,
    StateNum.CyberPain,
    20,
    Sfx.Dmpain,
    0,
    StateNum.CyberAtk1,
    StateNum.CyberDie1,
    StateNum.Null,
    Sfx.Cybdth,
    16,
    40 * FRACUNIT,
    110 * FRACUNIT,
    1000,
    0,
    Sfx.Dmact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.Null,
  ),

  // MT_PAIN
  new MObjInfo(
    71,
    StateNum.PainStnd,
    400,
    StateNum.PainRun1,
    Sfx.Pesit,
    8,
    0,
    StateNum.PainPain,
    128,
    Sfx.Pepain,
    0,
    StateNum.PainAtk1,
    StateNum.PainDie1,
    StateNum.Null,
    Sfx.Pedth,
    8,
    31 * FRACUNIT,
    56 * FRACUNIT,
    400,
    0,
    Sfx.Dmact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.Float | MObjFlag.NoGravity | MObjFlag.CountKill,
    StateNum.PainRaise1,
  ),

  // MT_WOLFSS
  new MObjInfo(
    84,
    StateNum.SswvStnd,
    50,
    StateNum.SswvRun1,
    Sfx.Sssit,
    8,
    0,
    StateNum.SswvPain,
    170,
    Sfx.Popain,
    0,
    StateNum.SswvAtk1,
    StateNum.SswvDie1,
    StateNum.SswvXdie1,
    Sfx.Ssdth,
    8,
    20 * FRACUNIT,
    56 * FRACUNIT,
    100,
    0,
    Sfx.Posact,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.SswvRaise1,
  ),

  // MT_KEEN
  new MObjInfo(
    72,
    StateNum.Keenstnd,
    100,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Keenpain,
    256,
    Sfx.Keenpn,
    StateNum.Null,
    StateNum.Null,
    StateNum.Commkeen,
    StateNum.Null,
    Sfx.Keendt,
    0,
    16 * FRACUNIT,
    72 * FRACUNIT,
    10000000,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.SpawnCeiling | MObjFlag.NoGravity | MObjFlag.Shootable | MObjFlag.CountKill,
    StateNum.Null,
  ),

  // MT_BOSSBRAIN
  new MObjInfo(
    88,
    StateNum.Brain,
    250,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.BrainPain,
    255,
    Sfx.Bospn,
    StateNum.Null,
    StateNum.Null,
    StateNum.BrainDie1,
    StateNum.Null,
    Sfx.Bosdth,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    10000000,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.Shootable,
    StateNum.Null,
  ),

  // MT_BOSSSPIT
  new MObjInfo(
    89,
    StateNum.Braineye,
    1000,
    StateNum.Braineyesee,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    32 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.NoSector,
    StateNum.Null,
  ),

  // MT_BOSSTARGET
  new MObjInfo(
    87,
    StateNum.Null,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    32 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.NoSector,
    StateNum.Null,
  ),

  // MT_SPAWNSHOT
  new MObjInfo(
    -1,
    StateNum.Spawn1,
    1000,
    StateNum.Null,
    Sfx.Bospit,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.Firxpl,
    10 * FRACUNIT,
    6 * FRACUNIT,
    32 * FRACUNIT,
    100,
    3,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.Missile | MObjFlag.DropOff | MObjFlag.NoGravity | MObjFlag.NoClip,
    StateNum.Null,
  ),

  // MT_SPAWNFIRE
  new MObjInfo(
    -1,
    StateNum.Spawnfire1,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_BARREL
  new MObjInfo(
    2035,
    StateNum.Bar1,
    20,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Bexp,
    StateNum.Null,
    Sfx.Barexp,
    0,
    10 * FRACUNIT,
    42 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.Shootable | MObjFlag.NoBlood,
    StateNum.Null,
  ),

  // MT_TROOPSHOT
  new MObjInfo(
    -1,
    StateNum.Tball1,
    1000,
    StateNum.Null,
    Sfx.Firsht,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Tballx1,
    StateNum.Null,
    Sfx.Firxpl,
    10 * FRACUNIT,
    6 * FRACUNIT,
    8 * FRACUNIT,
    100,
    3,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.Missile | MObjFlag.DropOff | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_HEADSHOT
  new MObjInfo(
    -1,
    StateNum.Rball1,
    1000,
    StateNum.Null,
    Sfx.Firsht,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Rballx1,
    StateNum.Null,
    Sfx.Firxpl,
    10 * FRACUNIT,
    6 * FRACUNIT,
    8 * FRACUNIT,
    100,
    5,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.Missile | MObjFlag.DropOff | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_ROCKET
  new MObjInfo(
    -1,
    StateNum.Rocket,
    1000,
    StateNum.Null,
    Sfx.Rlaunc,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Explode1,
    StateNum.Null,
    Sfx.Barexp,
    20 * FRACUNIT,
    11 * FRACUNIT,
    8 * FRACUNIT,
    100,
    20,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.Missile | MObjFlag.DropOff | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_PLASMA
  new MObjInfo(
    -1,
    StateNum.Plasball,
    1000,
    StateNum.Null,
    Sfx.Plasma,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Plasexp,
    StateNum.Null,
    Sfx.Firxpl,
    25 * FRACUNIT,
    13 * FRACUNIT,
    8 * FRACUNIT,
    100,
    5,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.Missile | MObjFlag.DropOff | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_BFG
  new MObjInfo(
    -1,
    StateNum.Bfgshot,
    1000,
    StateNum.Null,
    0,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Bfgland,
    StateNum.Null,
    Sfx.Rxplod,
    25 * FRACUNIT,
    13 * FRACUNIT,
    8 * FRACUNIT,
    100,
    100,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.Missile | MObjFlag.DropOff | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_ARACHPLAZ
  new MObjInfo(
    -1,
    StateNum.ArachPlaz,
    1000,
    StateNum.Null,
    Sfx.Plasma,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.ArachPlex,
    StateNum.Null,
    Sfx.Firxpl,
    25 * FRACUNIT,
    13 * FRACUNIT,
    8 * FRACUNIT,
    100,
    5,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.Missile | MObjFlag.DropOff | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_PUFF
  new MObjInfo(
    -1,
    StateNum.Puff1,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_BLOOD
  new MObjInfo(
    -1,
    StateNum.Blood1,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap,
    StateNum.Null,
  ),

  // MT_TFOG
  new MObjInfo(
    -1,
    StateNum.Tfog,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_IFOG
  new MObjInfo(
    -1,
    StateNum.Ifog,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_TELEPORTMAN
  new MObjInfo(
    14,
    StateNum.Null,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.NoSector,
    StateNum.Null,
  ),

  // MT_EXTRABFG
  new MObjInfo(
    -1,
    StateNum.Bfgexp,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC0
  new MObjInfo(
    2018,
    StateNum.Arm1,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC1
  new MObjInfo(
    2019,
    StateNum.Arm2,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC2
  new MObjInfo(
    2014,
    StateNum.Bon1,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.CountItem,
    StateNum.Null,
  ),

  // MT_MISC3
  new MObjInfo(
    2015,
    StateNum.Bon2,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.CountItem,
    StateNum.Null,
  ),

  // MT_MISC4
  new MObjInfo(
    5,
    StateNum.Bkey,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.NotDMatch,
    StateNum.Null,
  ),

  // MT_MISC5
  new MObjInfo(
    13,
    StateNum.Rkey,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.NotDMatch,
    StateNum.Null,
  ),

  // MT_MISC6
  new MObjInfo(
    6,
    StateNum.Ykey,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.NotDMatch,
    StateNum.Null,
  ),

  // MT_MISC7
  new MObjInfo(
    39,
    StateNum.Yskull,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.NotDMatch,
    StateNum.Null,
  ),

  // MT_MISC8
  new MObjInfo(
    38,
    StateNum.Rskull,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.NotDMatch,
    StateNum.Null,
  ),

  // MT_MISC9
  new MObjInfo(
    40,
    StateNum.Bskull,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.NotDMatch,
    StateNum.Null,
  ),

  // MT_MISC10
  new MObjInfo(
    2011,
    StateNum.Stim,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC11
  new MObjInfo(
    2012,
    StateNum.Medi,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC12
  new MObjInfo(
    2013,
    StateNum.Soul,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.CountItem,
    StateNum.Null,
  ),

  // MT_INV
  new MObjInfo(
    2022,
    StateNum.Pinv,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.CountItem,
    StateNum.Null,
  ),

  // MT_MISC13
  new MObjInfo(
    2023,
    StateNum.Pstr,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.CountItem,
    StateNum.Null,
  ),

  // MT_INS
  new MObjInfo(
    2024,
    StateNum.Pins,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.CountItem,
    StateNum.Null,
  ),

  // MT_MISC14
  new MObjInfo(
    2025,
    StateNum.Suit,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC15
  new MObjInfo(
    2026,
    StateNum.Pmap,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.CountItem,
    StateNum.Null,
  ),

  // MT_MISC16
  new MObjInfo(
    2045,
    StateNum.Pvis,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.CountItem,
    StateNum.Null,
  ),

  // MT_MEGA
  new MObjInfo(
    83,
    StateNum.Mega,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special | MObjFlag.CountItem,
    StateNum.Null,
  ),

  // MT_CLIP
  new MObjInfo(
    2007,
    StateNum.Clip,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC17
  new MObjInfo(
    2048,
    StateNum.Ammo,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC18
  new MObjInfo(
    2010,
    StateNum.Rock,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC19
  new MObjInfo(
    2046,
    StateNum.Brok,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC20
  new MObjInfo(
    2047,
    StateNum.Cell,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC21
  new MObjInfo(
    17,
    StateNum.Celp,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC22
  new MObjInfo(
    2008,
    StateNum.Shel,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC23
  new MObjInfo(
    2049,
    StateNum.Sbox,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC24
  new MObjInfo(
    8,
    StateNum.Bpak,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC25
  new MObjInfo(
    2006,
    StateNum.Bfug,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_CHAINGUN
  new MObjInfo(
    2002,
    StateNum.Mgun,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC26
  new MObjInfo(
    2005,
    StateNum.Csaw,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC27
  new MObjInfo(
    2003,
    StateNum.Laun,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC28
  new MObjInfo(
    2004,
    StateNum.Plas,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_SHOTGUN
  new MObjInfo(
    2001,
    StateNum.Shot,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_SUPERSHOTGUN
  new MObjInfo(
    82,
    StateNum.Shot2,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Special,
    StateNum.Null,
  ),

  // MT_MISC29
  new MObjInfo(
    85,
    StateNum.Techlamp,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC30
  new MObjInfo(
    86,
    StateNum.Tech2lamp,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC31
  new MObjInfo(
    2028,
    StateNum.Colu,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC32
  new MObjInfo(
    30,
    StateNum.Tallgrncol,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC33
  new MObjInfo(
    31,
    StateNum.Shrtgrncol,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC34
  new MObjInfo(
    32,
    StateNum.Tallredcol,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC35
  new MObjInfo(
    33,
    StateNum.Shrtredcol,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC36
  new MObjInfo(
    37,
    StateNum.Skullcol,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC37
  new MObjInfo(
    36,
    StateNum.Heartcol,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC38
  new MObjInfo(
    41,
    StateNum.Evileye,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC39
  new MObjInfo(
    42,
    StateNum.Floatskull,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC40
  new MObjInfo(
    43,
    StateNum.Torchtree,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC41
  new MObjInfo(
    44,
    StateNum.Bluetorch,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC42
  new MObjInfo(
    45,
    StateNum.Greentorch,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC43
  new MObjInfo(
    46,
    StateNum.Redtorch,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC44
  new MObjInfo(
    55,
    StateNum.Btorchshrt,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC45
  new MObjInfo(
    56,
    StateNum.Gtorchshrt,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC46
  new MObjInfo(
    57,
    StateNum.Rtorchshrt,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC47
  new MObjInfo(
    47,
    StateNum.Stalagtite,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC48
  new MObjInfo(
    48,
    StateNum.Techpillar,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC49
  new MObjInfo(
    34,
    StateNum.Candlestik,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    0,
    StateNum.Null,
  ),

  // MT_MISC50
  new MObjInfo(
    35,
    StateNum.Candelabra,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC51
  new MObjInfo(
    49,
    StateNum.Bloodytwitch,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    68 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC52
  new MObjInfo(
    50,
    StateNum.Meat2,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    84 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC53
  new MObjInfo(
    51,
    StateNum.Meat3,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    84 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC54
  new MObjInfo(
    52,
    StateNum.Meat4,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    68 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC55
  new MObjInfo(
    53,
    StateNum.Meat5,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    52 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC56
  new MObjInfo(
    59,
    StateNum.Meat2,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    84 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC57
  new MObjInfo(
    60,
    StateNum.Meat4,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    68 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC58
  new MObjInfo(
    61,
    StateNum.Meat3,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    52 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC59
  new MObjInfo(
    62,
    StateNum.Meat5,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    52 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC60
  new MObjInfo(
    63,
    StateNum.Bloodytwitch,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    68 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC61
  new MObjInfo(
    22,
    StateNum.HeadDie6,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    0,
    StateNum.Null,
  ),

  // MT_MISC62
  new MObjInfo(
    15,
    StateNum.PlayDie7,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    0,
    StateNum.Null,
  ),

  // MT_MISC63
  new MObjInfo(
    18,
    StateNum.PossDie5,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    0,
    StateNum.Null,
  ),

  // MT_MISC64
  new MObjInfo(
    21,
    StateNum.SargDie6,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    0,
    StateNum.Null,
  ),

  // MT_MISC65
  new MObjInfo(
    23,
    StateNum.SkullDie6,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    0,
    StateNum.Null,
  ),

  // MT_MISC66
  new MObjInfo(
    20,
    StateNum.TrooDie5,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    0,
    StateNum.Null,
  ),

  // MT_MISC67
  new MObjInfo(
    19,
    StateNum.SposDie5,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    0,
    StateNum.Null,
  ),

  // MT_MISC68
  new MObjInfo(
    10,
    StateNum.PlayXdie9,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    0,
    StateNum.Null,
  ),

  // MT_MISC69
  new MObjInfo(
    12,
    StateNum.PlayXdie9,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    0,
    StateNum.Null,
  ),

  // MT_MISC70
  new MObjInfo(
    28,
    StateNum.Headsonstick,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC71
  new MObjInfo(
    24,
    StateNum.Gibs,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    0,
    StateNum.Null,
  ),

  // MT_MISC72
  new MObjInfo(
    27,
    StateNum.Headonastick,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC73
  new MObjInfo(
    29,
    StateNum.Headcandles,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC74
  new MObjInfo(
    25,
    StateNum.Deadstick,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC75
  new MObjInfo(
    26,
    StateNum.Livestick,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC76
  new MObjInfo(
    54,
    StateNum.Bigtree,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    32 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC77
  new MObjInfo(
    70,
    StateNum.Bbar1,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid,
    StateNum.Null,
  ),

  // MT_MISC78
  new MObjInfo(
    73,
    StateNum.Hangnoguts,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    88 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC79
  new MObjInfo(
    74,
    StateNum.Hangbnobrain,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    88 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC80
  new MObjInfo(
    75,
    StateNum.Hangtlookdn,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    64 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC81
  new MObjInfo(
    76,
    StateNum.Hangtskull,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    64 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC82
  new MObjInfo(
    77,
    StateNum.Hangtlookup,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    64 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC83
  new MObjInfo(
    78,
    StateNum.Hangtnobrain,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    16 * FRACUNIT,
    64 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.Solid | MObjFlag.SpawnCeiling | MObjFlag.NoGravity,
    StateNum.Null,
  ),

  // MT_MISC84
  new MObjInfo(
    79,
    StateNum.Colongibs,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap,
    StateNum.Null,
  ),

  // MT_MISC85
  new MObjInfo(
    80,
    StateNum.Smallpool,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap,
    StateNum.Null,
  ),

  // MT_MISC86
  new MObjInfo(
    81,
    StateNum.Brainstem,
    1000,
    StateNum.Null,
    Sfx.None,
    8,
    Sfx.None,
    StateNum.Null,
    0,
    Sfx.None,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    StateNum.Null,
    Sfx.None,
    0,
    20 * FRACUNIT,
    16 * FRACUNIT,
    100,
    0,
    Sfx.None,
    MObjFlag.NoBlockMap,
    StateNum.Null,
  ),
]
