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
