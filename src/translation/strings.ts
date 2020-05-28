export interface Strings {

  //
  // D_Main.C
  //
  dDevstr: string
  dCdrom: string

  //
  // M_Menu.C
  //
  presskey: string
  pressyn: string
  quitmsg: string
  loadnet: string
  qloadnet: string
  qsavespot: string
  savedead: string
  qsprompt: (s: string) => string
  qlprompt: (s: string) => string

  newgame: string

  nightmare: string

  swstring: string

  msgoff: string
  msgon: string
  netend: string
  endgame: string

  endmsg: string[]
  numQuitMessages: number

  dosy: string

  detailhi: string
  detaillo: string
  gammalvl0: string
  gammalvl1: string
  gammalvl2: string
  gammalvl3: string
  gammalvl4: string
  emptystring: string

  //
  // P_inter.C
  //
  gotarmor: string
  gotmega: string
  goththbonus: string
  gotarmbonus: string
  gotstim: string
  gotmedineed: string
  gotmedikit: string
  gotsuper: string

  gotbluecard: string
  gotyelwcard: string
  gotredcard: string
  gotblueskul: string
  gotyelwskul: string
  gotredskull: string

  gotinvul: string
  gotberserk: string
  gotinvis: string
  gotsuit: string
  gotmap: string
  gotvisor: string
  gotmsphere: string

  gotclip: string
  gotclipbox: string
  gotrocket: string
  gotrockbox: string
  gotcell: string
  gotcellbox: string
  gotshells: string
  gotshellbox: string
  gotbackpack: string

  gotbfg9000: string
  gotchaingun: string
  gotchainsaw: string
  gotlauncher: string
  gotplasma: string
  gotshotgun: string
  gotshotgun2: string

  //
  // P_Doors.C
  //
  pdBlueo: string
  pdRedo: string
  pdYellowo: string
  pdBluek: string
  pdRedk: string
  pdYellowk: string

  //
  // G_game.C
  //
  ggsaved: string

  //
  // HU_stuff.C
  //
  hustrMsgu: string

  hustrE1m1: string
  hustrE1m2: string
  hustrE1m3: string
  hustrE1m4: string
  hustrE1m5: string
  hustrE1m6: string
  hustrE1m7: string
  hustrE1m8: string
  hustrE1m9: string

  hustrE2m1: string
  hustrE2m2: string
  hustrE2m3: string
  hustrE2m4: string
  hustrE2m5: string
  hustrE2m6: string
  hustrE2m7: string
  hustrE2m8: string
  hustrE2m9: string

  hustrE3m1: string
  hustrE3m2: string
  hustrE3m3: string
  hustrE3m4: string
  hustrE3m5: string
  hustrE3m6: string
  hustrE3m7: string
  hustrE3m8: string
  hustrE3m9: string

  hustrE4m1: string
  hustrE4m2: string
  hustrE4m3: string
  hustrE4m4: string
  hustrE4m5: string
  hustrE4m6: string
  hustrE4m7: string
  hustrE4m8: string
  hustrE4m9: string

  hustr1: string
  hustr2: string
  hustr3: string
  hustr4: string
  hustr5: string
  hustr6: string
  hustr7: string
  hustr8: string
  hustr9: string
  hustr10: string
  hustr11: string

  hustr12: string
  hustr13: string
  hustr14: string
  hustr15: string
  hustr16: string
  hustr17: string
  hustr18: string
  hustr19: string
  hustr20: string

  hustr21: string
  hustr22: string
  hustr23: string
  hustr24: string
  hustr25: string
  hustr26: string
  hustr27: string
  hustr28: string
  hustr29: string
  hustr30: string

  hustr31: string
  hustr32: string

  phustr1: string
  phustr2: string
  phustr3: string
  phustr4: string
  phustr5: string
  phustr6: string
  phustr7: string
  phustr8: string
  phustr9: string
  phustr10: string
  phustr11: string

  phustr12: string
  phustr13: string
  phustr14: string
  phustr15: string
  phustr16: string
  phustr17: string
  phustr18: string
  phustr19: string
  phustr20: string

  phustr21: string
  phustr22: string
  phustr23: string
  phustr24: string
  phustr25: string
  phustr26: string
  phustr27: string
  phustr28: string
  phustr29: string
  phustr30: string

  phustr31: string
  phustr32: string

  thustr1: string
  thustr2: string
  thustr3: string
  thustr4: string
  thustr5: string
  thustr6: string
  thustr7: string
  thustr8: string
  thustr9: string
  thustr10: string
  thustr11: string

  thustr12: string
  thustr13: string
  thustr14: string
  thustr15: string
  thustr16: string
  thustr17: string
  thustr18: string
  thustr19: string
  thustr20: string

  thustr21: string
  thustr22: string
  thustr23: string
  thustr24: string
  thustr25: string
  thustr26: string
  thustr27: string
  thustr28: string
  thustr29: string
  thustr30: string

  thustr31: string
  thustr32: string

  hustrChatmacro1: string
  hustrChatmacro2: string
  hustrChatmacro3: string
  hustrChatmacro4: string
  hustrChatmacro5: string
  hustrChatmacro6: string
  hustrChatmacro7: string
  hustrChatmacro8: string
  hustrChatmacro9: string
  hustrChatmacro0: string

  hustrTalktoself1: string
  hustrTalktoself2: string
  hustrTalktoself3: string
  hustrTalktoself4: string
  hustrTalktoself5: string

  hustrMessagesent: string

  // The following should NOT be changed unless it seems
  // just AWFULLY necessary

  hustrPlrgreen: string
  hustrPlrindigo: string
  hustrPlrbrown: string
  hustrPlrred: string

  hustrKeygreen: string
  hustrKeyindigo: string
  hustrKeybrown: string
  hustrKeyred: string

  //
  // AM_map.C
  //

  amstrFollowon: string
  amstrFollowoff: string

  amstrGridon: string
  amstrGridoff: string

  amstrMarkedspot: string
  amstrMarkscleared: string

  //
  // ST_stuff.C
  //

  ststrMus: string
  ststrNomus: string
  ststrDqdon: string
  ststrDqdoff: string

  ststrKfaadded: string
  ststrFaadded: string

  ststrNcon: string
  ststrNcoff: string

  ststrBehold: string
  ststrBeholdx: string

  ststrChoppers: string
  ststrClev: string

  //
  // F_Finale.C
  //
  e1text: string
  e2text: string
  e3text: string
  e4text: string
  // after level 6, put this:
  c1text: string
  // After level 11, put this:
  c2text: string
  // After level 20, put this:
  c3text: string
  // After level 29, put this:
  c4text: string
  // Before level 31, put this:
  c5text: string
  // Before level 32, put this:
  c6text: string
  // after map 06
  p1text: string
  // after map 11
  p2text: string
  // after map 20
  p3text: string
  // after map 30
  p4text: string
  // before map 31
  p5text: string
  // before map 32
  p6text: string
  t1text: string
  t2text: string
  t3text: string
  t4text: string
  t5text: string
  t6text: string

  //
  // Character cast strings F_FINALE.C
  //
  ccZombie: string
  ccShotgun: string
  ccHeavy: string
  ccImp: string
  ccDemon: string
  ccLost: string
  ccCaco: string
  ccHell: string
  ccBaron: string
  ccArach: string
  ccPain: string
  ccReven: string
  ccMancu: string
  ccArch: string
  ccSpider: string
  ccCyber: string
  ccHero: string
}
