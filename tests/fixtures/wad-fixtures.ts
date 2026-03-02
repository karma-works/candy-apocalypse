// Minimal test WAD structure for testing
// This creates a simple single-room level for testing
// In a real scenario, you'd use a WAD editor or download Freedoom

export const MINIMAL_WAD_FIXTURE = {
  name: "TEST.WAD",
  description: "Minimal single-room test level",
  structure: {
    vertices: 8, // Cube has 8 corners
    linedefs: 12, // 4 walls, 4 floor edges, 4 ceiling edges
    sectors: 1, // Single room
    things: 2, // Player start + one enemy
  },
};

// Expected parsed data from WAD
export interface ExpectedWADData {
  vertices: Array<{ x: number; y: number }>;
  linedefs: Array<{
    vertex1: number;
    vertex2: number;
    flags: number;
    specialType: number;
    sectorTag: number;
    frontSide: number;
    backSide: number;
  }>;
  sectors: Array<{
    floorHeight: number;
    ceilingHeight: number;
    floorTexture: string;
    ceilingTexture: string;
    lightLevel: number;
    specialType: number;
    tag: number;
  }>;
  things: Array<{
    x: number;
    y: number;
    angle: number;
    type: number;
    flags: number;
  }>;
}

// Sample expected data for single cube room
export const EXPECTED_SINGLE_CUBE: ExpectedWADData = {
  vertices: [
    { x: 0, y: 0 },
    { x: 128, y: 0 },
    { x: 128, y: 128 },
    { x: 0, y: 128 },
  ],
  linedefs: [
    {
      vertex1: 0,
      vertex2: 1,
      flags: 1,
      specialType: 0,
      sectorTag: 0,
      frontSide: 0,
      backSide: -1,
    },
    {
      vertex1: 1,
      vertex2: 2,
      flags: 1,
      specialType: 0,
      sectorTag: 0,
      frontSide: 1,
      backSide: -1,
    },
    {
      vertex1: 2,
      vertex2: 3,
      flags: 1,
      specialType: 0,
      sectorTag: 0,
      frontSide: 2,
      backSide: -1,
    },
    {
      vertex1: 3,
      vertex2: 0,
      flags: 1,
      specialType: 0,
      sectorTag: 0,
      frontSide: 3,
      backSide: -1,
    },
  ],
  sectors: [
    {
      floorHeight: 0,
      ceilingHeight: 128,
      floorTexture: "FLOOR0_1",
      ceilingTexture: "CEIL1_1",
      lightLevel: 160,
      specialType: 0,
      tag: 0,
    },
  ],
  things: [
    { x: 64, y: 64, angle: 90, type: 1, flags: 7 }, // Player 1 start
    { x: 32, y: 32, angle: 0, type: 3004, flags: 7 }, // Zombieman
  ],
};
