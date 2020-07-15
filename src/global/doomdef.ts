// DOOM version
export const VERSION = 110

// Game mode handling - identify IWAD version
//  to handle IWAD dependend animations etc.
export const enum GameMode {
  // DOOM 1 shareware, E1, M9
  Shareware,
  // DOOM 1 registered, E3, M27
  Registered,
  // DOOM 2 retail, E1 M34
  Commercial,
  // DOOM 1 retail, E4, M36
  Retail,
  // Well, no IWAD found
  Indetermined,
}

// Mission packs - might be useful for TC stuff?
export const enum GameMission {
  // DOOM 1
  Doom,
  // DOOM 2
  Doom2,
  // TNT mission pack
  PackTNT,
  // Plutonia pack
  PackPlut,
  None,
}

// Identify language to use, software localization.
export const enum Language {
  English,
  French,
  German,
  Unknown,
}

// If rangecheck is undefined,
// most parameter validation debugging code will not be compiled
export const RANGE_CHECK = true

// It is educational but futile to change this
//  scaling e.g. to 2. Drawing of status bar,
//  menues etc. is tied to the scale implied
//  by the graphics.
export const SCREEN_MUL = 1

export const SCREENWIDTH = 320
export const SCREENHEIGHT = 200

// The maximum number of players, multiplayer/networking.
export const MAX_PLAYERS = 4

// State updates, number of tics / second.
export const TICRATE = 35

// The current state of the game: whether we are
// playing, gazing at the intermission screen,
// the game final animation, or a demo.
export const enum GameState {
  Level,
  Intermission,
  Finale,
  DemoScreen,
}

// Deaf monsters/do not react to sound.
export const MTF_AMBUSH = 8

export const enum Skill {
  Baby,
  Easy,
  Medium,
  Hard,
  Nightmare,
}

//
// Key cards.
//
export const enum Card {
  BlueCard,
  YellowCard,
  RedCard,
  BlueSkull,
  YellowSkull,
  RedSkull,

  NUM_CARDS,
}

// The defined weapons,
//  including a marker indicating
//  user has not changed weapon.
export const enum WeaponType {
  Fist,
  Pistol,
  Shotgun,
  Chaingun,
  Missile,
  Plasma,
  BFG,
  Chainsaw,
  Supershotgun,

  NUMWEAPONS,

  // No pending weapon change.
  NoChange,
}


// Ammunition types defined.
export const enum AmmoType {
  // Pistol / chaingun ammo.
  Clip,
  // Shotgun / double barreled shotgun.
  Shell,
  // Plasma rifle, BFG.
  Cell,
  // Missile launcher.
  Misl,

  NUM_AMMO,
  // Unlimited for chainsaw / fist.
  NoAmmo,
}

// Power up artifacts.
export const enum PowerType {
  Invulnerability,
  Strength,
  Invisibility,
  Ironfeet,
  AllMap,
  Infrared,

  NUMPOWERS,
}

//
// Power up durations,
//  how many seconds till expiration,
//  assuming TICRATE is 35 ticks/second.
//
export enum PowerDuration {
  InvulnTics = 30 * TICRATE,
  InvisTics = 60 * TICRATE,
  InfraTics = 120 * TICRATE,
  IronTics = 60 * TICRATE,
}

//
// DOOM keyboard definition.
// This is the stuff configured by Setup.Exe.
// Most key data are simple ascii (uppercased).
//
export const KEY_RIGHTARROW = 39
export const KEY_LEFTARROW = 37
export const KEY_UPARROW = 38
export const KEY_DOWNARROW = 40
export const KEY_ESCAPE = 27
export const KEY_ENTER = 13
export const KEY_TAB = 9
export const KEY_F1 = 112
export const KEY_F2 = 113
export const KEY_F3 = 114
export const KEY_F4 = 115
export const KEY_F5 = 116
export const KEY_F6 = 117
export const KEY_F7 = 118
export const KEY_F8 = 119
export const KEY_F9 = 120
export const KEY_F10 = 121
export const KEY_F11 = 122
export const KEY_F12 = 123

export const KEY_BACKSPACE = 8
export const KEY_PAUSE = 19

export const KEY_EQUALS = 187
export const KEY_MINUS = 189

export const KEY_RSHIFT = 16
export const KEY_RCTRL = 17
export const KEY_RALT = 18

export const KEY_LALT = KEY_RALT
