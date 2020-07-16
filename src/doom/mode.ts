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

export function logicalGameMission(mission: GameMission): GameMission {
  return mission === GameMission.PackChex ?
    GameMission.Doom :
    mission === GameMission.PackHacx ?
      GameMission.Doom2 : mission
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

export const wads: readonly [ string, GameMission, GameMode, string ][] = [
  [ 'doom2.wad', GameMission.Doom2, GameMode.Commercial, 'Doom II' ],
  [ 'plutonia.wad', GameMission.PackPlut, GameMode.Commercial, 'Final Doom: Plutonia Experiment' ],
  [ 'tnt.wad', GameMission.PackTNT, GameMode.Commercial, 'Final Doom: TNT: Evilution' ],
  [ 'doom.wad', GameMission.Doom, GameMode.Retail, 'Doom' ],
  [ 'doom1.wad', GameMission.Doom, GameMode.Shareware, 'Doom Shareware' ],
  [ 'chex.wad', GameMission.PackChex, GameMode.Retail, 'Chex Quest' ],
  [ 'hacx.wad', GameMission.PackHacx, GameMode.Commercial, 'Hacx' ],
  [ 'freedoom2.wad', GameMission.Doom2, GameMode.Commercial, 'Freedoom: Phase 2' ],
  [ 'freedoom1.wad', GameMission.Doom, GameMode.Retail, 'Freedoom: Phase 1' ],
  [ 'freedm.wad', GameMission.Doom2, GameMode.Commercial, 'FreeDM' ],
  [ 'heretic.wad', GameMission.Heretic, GameMode.Retail, 'Heretic' ],
  [ 'heretic1.wad', GameMission.Heretic, GameMode.Shareware, 'Heretic Shareware' ],
  [ 'hexen.wad', GameMission.Hexen, GameMode.Commercial, 'Hexen' ],
  [ 'strife1.wad', GameMission.Strife, GameMode.Commercial, 'Strife' ],
]


export const enum GameVersion {
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
  Baby,
  Easy,
  Medium,
  Hard,
  Nightmare
}
