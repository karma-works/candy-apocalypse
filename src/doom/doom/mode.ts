// The "mission" controls what game we are playing.
export const enum GameMission {
  // Doom 1
  Doom,
  // Doom 2
  Doom2,
  // Final Doom: TNT: Evilution
  PackTNT,
  // Final Doom: The Plutonia Experiment
  PackPlut,
  // Chex Quest (modded doom)
  PackChex,
  // Hacx (modded doom2)
  PackHacx,
  // Heretic
  Heretic,
  // Hexen
  Hexen,
  // Strife
  Strife,
  None,
}

// The "mode" allows more accurate specification of the game mode we are
// in: eg. shareware vs. registered.  So doom1.wad and doom.wad are the
// same mission, but a different mode.

export const enum GameMode {
  // Doom/Heretic shareware
  Shareware,
  // Doom/Heretic registered
  Registered,
  // Doom II/Hexen
  Commercial,
  // Ultimate Doom
  Retail,
  // Unknown.
  Indetermined
}

export const enum GameVersion {
  Undefined = -1,
  // Doom 1.2: shareware and registered
  Doom12,
  // Doom 1.666: for shareware, registered and commercial
  Doom1666,
  // Doom 1.7/1.7a: "
  Doom17,
  // Doom 1.8: "
  Doom18,
  // Doom 1.9: "
  Doom19,
  // Hacx
  Hacx,
  // Ultimate Doom (retail)
  Ultimate,
  // Final Doom
  Final,
  // Final Doom (alternate exe)
  Final2,
  // Chex Quest executable (based on Final Doom)
  Chex,

  // Heretic 1.3
  Heretic13,

  // Hexen 1.1
  Hexen11,
  // Strife v1.2
  Strife12,
  // Strife v1.31
  Strife131,
}

// Identify language to use, software localization.

export const enum Language {
  English,
  French,
  German,
  Unknown
}

export const enum Skill {
  Undefined = -1,
  Baby,
  Easy,
  Medium,
  Hard,
  Nightmare
}
