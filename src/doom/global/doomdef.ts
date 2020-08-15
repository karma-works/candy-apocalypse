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
export const INTENDED_SCREENHEIGHT = 240

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

  NUM_WEAPONS,

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
export const KEY_RIGHTARROW = 0xae
export const KEY_LEFTARROW = 0xac
export const KEY_UPARROW = 0xad
export const KEY_DOWNARROW = 0xaf
export const KEY_ESCAPE = 27
export const KEY_ENTER = 13
export const KEY_TAB = 9
export const KEY_F1 = 0x80 + 0x3b
export const KEY_F2 = 0x80 + 0x3c
export const KEY_F3 = 0x80 + 0x3d
export const KEY_F4 = 0x80 + 0x3e
export const KEY_F5 = 0x80 + 0x3f
export const KEY_F6 = 0x80 + 0x40
export const KEY_F7 = 0x80 + 0x41
export const KEY_F8 = 0x80 + 0x42
export const KEY_F9 = 0x80 + 0x43
export const KEY_F10 = 0x80 + 0x44
export const KEY_F11 = 0x80 + 0x57
export const KEY_F12 = 0x80 + 0x58

export const KEY_BACKSPACE = 127
export const KEY_PAUSE = 0xff

export const KEY_EQUALS = 0x3d
export const KEY_MINUS = 0x2d

export const KEY_RSHIFT = 0x80 + 0x36
export const KEY_RCTRL = 0x80 + 0x1d
export const KEY_RALT = 0x80 + 0x38

export const KEY_LALT = KEY_RALT
