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
export const STRETCH = 6 / 5

// The maximum number of players, multiplayer/networking.
export const MAX_PLAYERS = 4

// State updates, number of tics / second.
export const TICRATE = 35

// The current state of the game: whether we are
// playing, gazing at the intermission screen,
// the game final animation, or a demo.
export const enum GameState {
  Undefined = -1,
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
